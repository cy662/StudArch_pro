-- 极简导入函数，完全避开批次表和字段冲突
CREATE OR REPLACE FUNCTION import_training_program_courses_minimal(
    p_courses JSONB,
    p_program_code TEXT,
    p_program_name TEXT,
    p_teacher_id UUID,
    p_major TEXT DEFAULT '未指定专业',
    p_department TEXT DEFAULT '未指定院系',
    p_imported_by UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    program_uuid UUID;
    success_count INTEGER := 0;
    failure_count INTEGER := 0;
    course_record JSONB;
    result JSONB;
    final_program_code TEXT;
BEGIN
    -- 生成唯一的培养方案代码
    final_program_code := p_program_code || '_' || SUBSTRING(p_teacher_id::TEXT, 1, 8);
    
    -- 检查是否已存在相同的培养方案代码
    SELECT id INTO program_uuid 
    FROM training_programs 
    WHERE teacher_id = p_teacher_id AND program_code = final_program_code;
    
    IF program_uuid IS NULL THEN
        -- 创建新的培养方案（教师专属）
        INSERT INTO training_programs (
            program_name, 
            program_code, 
            major,
            department,
            teacher_id,
            created_by,
            total_credits,
            created_at,
            updated_at
        ) VALUES (
            p_program_name,
            final_program_code,
            p_major,
            p_department,
            p_teacher_id,
            COALESCE(p_imported_by, p_teacher_id),
            0,
            NOW(),
            NOW()
        ) RETURNING id INTO program_uuid;
    END IF;
    
    -- 处理每门课程（不使用批次表）
    FOR course_record IN SELECT * FROM jsonb_array_elements(p_courses)
    LOOP
        BEGIN
            INSERT INTO training_program_courses (
                program_id,
                course_number,
                course_name,
                credits,
                recommended_grade,
                semester,
                exam_method,
                course_nature,
                course_type,
                sequence_order,
                status,
                created_at,
                updated_at
            ) VALUES (
                program_uuid,
                course_record->>'course_number',
                course_record->>'course_name',
                (course_record->>'credits')::NUMERIC,
                course_record->>'recommended_grade',
                course_record->>'semester',
                course_record->>'exam_method',
                course_record->>'course_nature',
                CASE 
                    WHEN COALESCE(course_record->>'course_nature', '必修课') = '必修课' THEN 'required' 
                    ELSE 'elective' 
                END,
                success_count + 1,
                'active',
                NOW(),
                NOW()
            );
            
            success_count := success_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            failure_count := failure_count + 1;
        END;
        
        success_count := success_count;
        failure_count := failure_count;
    END LOOP;
    
    -- 更新培养方案总学分
    UPDATE training_programs 
    SET 
        total_credits = (
            SELECT COALESCE(SUM(credits), 0) 
            FROM training_program_courses 
            WHERE program_id = program_uuid AND status = 'active'
        ),
        updated_at = NOW()
    WHERE id = program_uuid;
    
    -- 构建返回结果
    result := jsonb_build_object(
        'success', true,
        'message', '培养方案导入成功（极简版）',
        'data', jsonb_build_object(
            'success', success_count,
            'failed', failure_count,
            'total', success_count + failure_count,
            'program_id', program_uuid,
            'program_code', final_program_code,
            'teacher_id', p_teacher_id,
            'note', '使用极简导入函数，未使用批次表'
        )
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

COMMIT;

-- 测试极简导入函数
SELECT import_training_program_courses_minimal(
    '[{"course_number": "CS101", "course_name": "测试课程", "credits": 3}]'::jsonb,
    'TEST_MINIMAL',
    '极简测试方案',
    '11111111-1111-1111-1111-111111111121'
);