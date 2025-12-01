-- 最终完整修复：使用真实用户ID
-- 在 Supabase SQL Editor 中执行此SQL

-- 1. 创建教师学生关系表（如果还没有）
CREATE TABLE IF NOT EXISTS teacher_student_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) DEFAULT 'teacher_student',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 确保同一教师不会重复关联同一学生
    UNIQUE(teacher_id, student_id)
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_teacher_student_relationships_teacher_id ON teacher_student_relationships(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_student_relationships_student_id ON teacher_student_relationships(student_id);

-- 3. 插入真实存在的学生关系
INSERT INTO teacher_student_relationships (teacher_id, student_id) VALUES
    ('00000000-0000-0000-0000-000000000001', 'db888c86-eb18-4c5d-819a-d59f0d223adc'),
    ('00000000-0000-0000-0000-000000000001', '89e41fee-a388-486f-bbb2-320c4e115ee1'),
    ('00000000-0000-0000-0000-000000000001', '7b282f57-7b8a-4ade-b9a2-043cd4b8c2a5')
ON CONFLICT (teacher_id, student_id) DO NOTHING;

-- 4. 禁用RLS
ALTER TABLE teacher_student_relationships DISABLE ROW LEVEL SECURITY;

-- 5. 授权
GRANT ALL ON teacher_student_relationships TO authenticated;
GRANT SELECT ON teacher_student_relationships TO anon;

-- 6. 确保批量分配函数是最新的（如果没有format错误可以跳过）
DROP FUNCTION IF EXISTS batch_assign_training_program_to_teacher_students(UUID, UUID, UUID[]);

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
            
            -- 检查培养方案是否存在
            SELECT EXISTS(
                SELECT 1 FROM training_programs 
                WHERE id = p_program_id AND status = 'active'
            ) INTO assignment_exists;
            
            IF NOT assignment_exists THEN
                RAISE EXCEPTION '培养方案不存在或已停用';
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

-- 7. 授权函数
GRANT EXECUTE ON FUNCTION batch_assign_training_program_to_teacher_students(UUID, UUID, UUID[]) TO authenticated;

-- 8. 显示修复结果
SELECT 
    '修复完成' as status,
    (SELECT COUNT(*) FROM teacher_student_relationships WHERE teacher_id = '00000000-0000-0000-0000-000000000001') as student_count,
    (SELECT COUNT(*) FROM training_programs WHERE status = 'active') as program_count;