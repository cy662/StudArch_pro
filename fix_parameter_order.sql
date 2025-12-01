-- 修复参数顺序问题
-- 在 Supabase SQL Editor 中执行

-- 1. 删除所有版本的函数（清理所有冲突）
DROP FUNCTION IF EXISTS batch_assign_training_program_to_teacher_students(p_teacher_id UUID, p_program_id UUID, p_student_ids UUID[]);
DROP FUNCTION IF EXISTS batch_assign_training_program_to_teacher_students(p_program_id UUID, p_teacher_id UUID, p_student_ids UUID[]);
DROP FUNCTION IF EXISTS batch_assign_training_program_to_teacher_students(p_student_ids UUID[], p_teacher_id UUID, p_program_id UUID);
DROP FUNCTION IF EXISTS batch_assign_training_program_to_teacher_students(p_program_id UUID, p_student_ids UUID[], p_teacher_id UUID);
DROP FUNCTION IF EXISTS batch_assign_training_program_to_teacher_students(p_student_ids UUID[], p_program_id UUID, p_teacher_id UUID);

-- 2. 创建函数，严格按照API调用的参数顺序
CREATE OR REPLACE FUNCTION batch_assign_training_program_to_teacher_students(
    p_notes TEXT,
    p_program_id UUID,
    p_student_ids UUID[],
    p_teacher_id UUID
)
RETURNS JSONB AS $$
DECLARE
    success_count INTEGER := 0;
    failure_count INTEGER := 0;
    student_uuid UUID;
    result JSONB;
    assignment_exists BOOLEAN;
BEGIN
    -- 遍历学生ID列表进行批量分配
    FOREACH student_uuid IN ARRAY p_student_ids
    LOOP
        BEGIN
            -- 检查学生是否在该教师管理列表中
            SELECT EXISTS(
                SELECT 1 FROM teacher_student_relationships 
                WHERE teacher_id = p_teacher_id AND student_id = student_uuid
            ) INTO assignment_exists;
            
            IF NOT assignment_exists THEN
                RAISE EXCEPTION '学生不在教师管理列表中';
            END IF;
            
            -- 检查培养方案是否存在
            SELECT EXISTS(
                SELECT 1 FROM training_programs 
                WHERE id = p_program_id AND status = 'active'
            ) INTO assignment_exists;
            
            IF NOT assignment_exists THEN
                RAISE EXCEPTION '培养方案不存在或已停用';
            END IF;
            
            -- 插入或更新培养方案分配
            INSERT INTO student_training_programs (
                student_id, program_id, enrollment_date, status, created_at, updated_at
            ) VALUES (
                student_uuid, p_program_id, CURRENT_DATE, 'active', NOW(), NOW()
            )
            ON CONFLICT (student_id) 
            DO UPDATE SET 
                program_id = p_program_id, 
                updated_at = NOW();
            
            -- 创建学生课程进度记录
            INSERT INTO student_course_progress (
                student_id, course_id, status, created_at, updated_at
            )
            SELECT 
                student_uuid, tpc.id, 'not_started', NOW(), NOW()
            FROM training_program_courses tpc
            WHERE tpc.program_id = p_program_id 
            AND tpc.status = 'active'
            ON CONFLICT (student_id, course_id) DO NOTHING;
            
            success_count := success_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            failure_count := failure_count + 1;
        END;
    END LOOP;
    
    -- 构建返回结果（使用%s而不是%d）
    result := jsonb_build_object(
        'success', success_count > 0,
        'message', format('批量分配完成：成功 %s 个，失败 %s 个', success_count, failure_count),
        'success_count', success_count,
        'failure_count', failure_count,
        'total_count', success_count + failure_count
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 3. 授权
GRANT EXECUTE ON FUNCTION batch_assign_training_program_to_teacher_students(p_notes TEXT, p_program_id UUID, p_student_ids UUID[], p_teacher_id UUID) TO authenticated;

-- 4. 显示修复完成
DO $$
BEGIN
    RAISE NOTICE '✅ 参数顺序修复完成！';
    RAISE NOTICE '🔧 函数参数顺序: p_notes, p_program_id, p_student_ids, p_teacher_id';
    RAISE NOTICE '🎯 现在应该能正常调用API';
END $$;