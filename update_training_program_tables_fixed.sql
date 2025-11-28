-- 修复版：更新培养方案表结构
-- 不依赖teacher_student_relations表，简化验证逻辑

-- 1. 为学生培养方案关联表添加教师关联字段
ALTER TABLE student_training_programs 
ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- 2. 简化的教师学生关系验证函数（不依赖关联表）
CREATE OR REPLACE FUNCTION validate_teacher_student_relationship(
    p_teacher_id UUID,
    p_student_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    is_teacher_student BOOLEAN := FALSE;
BEGIN
    -- 简化验证：目前允许任意教师给任意学生分配培养方案
    -- 在实际应用中，可以根据您的学生管理逻辑来调整
    SELECT TRUE INTO is_teacher_student;
    
    RETURN is_teacher_student;
END;
$$ LANGUAGE plpgsql;

-- 3. 更新学生培养方案关联函数，添加教师验证
CREATE OR REPLACE FUNCTION assign_training_program_to_student(
    p_student_id UUID,
    p_program_id UUID,
    p_teacher_id UUID DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    validation_ok BOOLEAN;
BEGIN
    -- 如果提供了教师ID，验证教师与学生的关联关系
    IF p_teacher_id IS NOT NULL THEN
        validation_ok := validate_teacher_student_relationship(p_teacher_id, p_student_id);
        
        IF NOT validation_ok THEN
            RETURN jsonb_build_object(
                'success', false,
                'message', '该学生不在您的管理列表中，无法分配培养方案'
            );
        END IF;
    END IF;
    
    -- 插入或更新学生培养方案关联
    INSERT INTO student_training_programs (
        student_id,
        program_id,
        teacher_id,
        enrollment_date,
        status,
        notes,
        created_at,
        updated_at
    ) VALUES (
        p_student_id,
        p_program_id,
        p_teacher_id,
        CURRENT_DATE,
        'active',
        p_notes,
        NOW(),
        NOW()
    )
    ON CONFLICT (student_id, program_id) 
    DO UPDATE SET
        teacher_id = COALESCE(EXCLUDED.teacher_id, student_training_programs.teacher_id),
        enrollment_date = CURRENT_DATE,
        status = 'active',
        notes = COALESCE(EXCLUDED.notes, student_training_programs.notes),
        updated_at = NOW()
    RETURNING id INTO result;
    
    -- 返回成功结果
    RETURN jsonb_build_object(
        'success', true,
        'message', '培养方案分配成功',
        'assignment_id', result
    );
END;
$$ LANGUAGE plpgsql;

-- 4. 创建批量分配培养方案给教师的学生函数
CREATE OR REPLACE FUNCTION batch_assign_training_program_to_teacher_students(
    p_teacher_id UUID,
    p_program_id UUID,
    p_student_ids TEXT[],  -- 修改为TEXT数组以避免JSON解析问题
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    success_count INTEGER := 0;
    failure_count INTEGER := 0;
    student_uuid UUID;
    result JSONB;
    results JSONB := '[]'::jsonb;
BEGIN
    -- 验证培养方案存在
    IF NOT EXISTS (SELECT 1 FROM training_programs WHERE id = p_program_id AND status = 'active') THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', '培养方案不存在或已停用'
        );
    END IF;
    
    -- 逐个处理学生
    FOR student_uuid IN SELECT * FROM unnest(p_student_ids::UUID[])  -- 转换为UUID数组
    LOOP
        -- 调用单个分配函数
        result := assign_training_program_to_student(student_uuid, p_program_id, p_teacher_id, p_notes);
        
        -- 添加到结果数组
        results := results || jsonb_build_object(
            'student_id', student_uuid,
            'result', result
        );
        
        -- 统计成功/失败
        IF (result->>'success')::BOOLEAN = TRUE THEN
            success_count := success_count + 1;
        ELSE
            failure_count := failure_count + 1;
        END IF;
    END LOOP;
    
    -- 返回总体结果
    RETURN jsonb_build_object(
        'success', success_count > 0,
        'message', format('成功分配 %d 个学生，失败 %d 个学生', success_count, failure_count),
        'success_count', success_count,
        'failure_count', failure_count,
        'total_count', success_count + failure_count,
        'details', results
    );
END;
$$ LANGUAGE plpgsql;

-- 5. 创建获取教师学生培养方案汇总的函数
CREATE OR REPLACE FUNCTION get_teacher_students_training_programs_summary(p_teacher_id UUID)
RETURNS SETOF JSONB AS $$
BEGIN
    RETURN QUERY
    SELECT jsonb_build_object(
        'student_id', sp.id,
        'student_name', sp.full_name,
        'student_number', sp.student_number,
        'program_id', tp.id,
        'program_name', tp.program_name,
        'program_code', tp.program_code,
        'total_credits', tp.total_credits,
        'courses_count', COALESCE(course_counts.course_count, 0),
        'completed_courses', COALESCE(progress_counts.completed_count, 0),
        'assignment_date', stp.enrollment_date,
        'assignment_status', stp.status
    )
    FROM student_profiles sp
    LEFT JOIN student_training_programs stp ON sp.id = stp.student_id AND stp.status = 'active'
    LEFT JOIN training_programs tp ON stp.program_id = tp.id
    LEFT JOIN (
        SELECT 
            tpc.program_id,
            COUNT(*) as course_count
        FROM training_program_courses tpc
        WHERE tpc.status = 'active'
        GROUP BY tpc.program_id
    ) course_counts ON tp.id = course_counts.program_id
    LEFT JOIN (
        SELECT 
            scp.student_id,
            COUNT(*) FILTER (WHERE scp.status = 'completed') as completed_count
        FROM student_course_progress scp
        GROUP BY scp.student_id
    ) progress_counts ON sp.id = progress_counts.student_id
    ORDER BY sp.student_number;
END;
$$ LANGUAGE plpgsql;

-- 6. 创建视图：教师培养方案管理视图
CREATE OR REPLACE VIEW teacher_training_programs_view AS
SELECT 
    tp.*,
    (SELECT COUNT(*) FROM student_training_programs stp WHERE stp.program_id = tp.id AND stp.status = 'active') as assigned_students_count,
    (SELECT COUNT(DISTINCT stp.teacher_id) FROM student_training_programs stp WHERE stp.program_id = tp.id AND stp.status = 'active') as teachers_count
FROM training_programs tp
WHERE tp.status = 'active';

-- 7. 索引优化
CREATE INDEX IF NOT EXISTS idx_student_training_programs_teacher_id ON student_training_programs(teacher_id);
CREATE INDEX IF NOT EXISTS idx_student_training_programs_student_teacher ON student_training_programs(student_id, teacher_id);

COMMIT;