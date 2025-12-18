-- 修复批量分配培养方案函数中的format错误
-- 问题：PostgreSQL的format()函数中使用了错误的格式化符号%d，应该使用%s

-- 删除有问题的函数
DROP FUNCTION IF EXISTS batch_assign_training_program_to_teacher_students(UUID, UUID, UUID[]);

-- 重新创建修复后的函数
CREATE OR REPLACE FUNCTION batch_assign_training_program_to_teacher_students(
    p_teacher_id UUID,
    p_program_id UUID,
    p_student_ids UUID[]
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
            
            -- 检查是否已经分配过培养方案
            SELECT EXISTS(
                SELECT 1 FROM student_training_programs 
                WHERE student_id = student_uuid
            ) INTO assignment_exists;
            
            IF assignment_exists THEN
                -- 更新现有分配
                UPDATE student_training_programs 
                SET program_id = p_program_id, updated_at = NOW()
                WHERE student_id = student_uuid;
            ELSE
                -- 插入新的培养方案分配
                INSERT INTO student_training_programs (
                    student_id,
                    program_id,
                    enrollment_date,
                    status,
                    created_at,
                    updated_at
                ) VALUES (
                    student_uuid,
                    p_program_id,
                    CURRENT_DATE,
                    'active',
                    NOW(),
                    NOW()
                );
            END IF;
            
            -- 创建学生课程进度记录
            INSERT INTO student_course_progress (
                student_id,
                course_id,
                status,
                created_at,
                updated_at
            )
            SELECT 
                student_uuid,
                tpc.id,
                'not_started',
                NOW(),
                NOW()
            FROM training_program_courses tpc
            WHERE tpc.program_id = p_program_id 
            AND tpc.status = 'active'
            ON CONFLICT (student_id, course_id) DO NOTHING;
            
            success_count := success_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            failure_count := failure_count + 1;
        END;
    END LOOP;
    
    -- 关键修复：使用%s而不是%d
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

-- 授权
GRANT EXECUTE ON FUNCTION batch_assign_training_program_to_teacher_students(UUID, UUID, UUID[]) TO authenticated;