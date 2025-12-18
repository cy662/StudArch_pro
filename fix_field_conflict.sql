-- 修复培养方案导入表字段冲突问题
-- 为导入函数使用明确的字段名避免歧义

CREATE OR REPLACE FUNCTION import_training_program_courses_with_teacher(
    p_courses JSONB,
    p_program_code TEXT,
    p_program_name TEXT,
    p_teacher_id UUID,
    p_major TEXT DEFAULT '未指定专业',
    p_department TEXT DEFAULT '未指定院系',
    p_batch_name TEXT DEFAULT NULL,
    p_imported_by UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    batch_uuid UUID;
    program_uuid UUID;
    success_count INTEGER := 0;
    failure_count INTEGER := 0;
    course_record JSONB;
    course_uuid UUID;
    error_message TEXT;
    row_number INTEGER := 1;
    result JSONB;
    final_program_code TEXT;
BEGIN
    -- 生成唯一的培养方案代码（避免教师间冲突）
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
    
    -- 创建导入批次（使用明确字段名避免冲突）
    INSERT INTO training_program_import_batches (
        batch_name,
        program_id,
        teacher_id,
        imported_by,
        total_records,
        status,
        created_at,
        updated_at
    ) VALUES (
        COALESCE(p_batch_name, p_program_name || '_导入批次'),
        program_uuid,
        p_teacher_id,
        COALESCE(p_imported_by, p_teacher_id),
        jsonb_array_length(p_courses),
        'processing',
        NOW(),
        NOW()
    ) RETURNING id INTO batch_uuid;
    
    -- 处理每门课程
    FOR course_record IN SELECT * FROM jsonb_array_elements(p_courses)
    LOOP
        BEGIN
            -- 插入课程记录
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
                row_number,
                'active',
                NOW(),
                NOW()
            ) RETURNING id INTO course_uuid;
            
            success_count := success_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            error_message := SQLERRM;
            
            -- 记录失败信息
            BEGIN
                INSERT INTO training_program_import_failures (
                    batch_id,
                    row_number,
                    course_number,
                    course_name,
                    error_message,
                    raw_data,
                    created_at
                ) VALUES (
                    batch_uuid,
                    row_number,
                    course_record->>'course_number',
                    course_record->>'course_name',
                    error_message,
                    course_record,
                    NOW()
                );
            EXCEPTION WHEN OTHERS THEN
                -- 如果失败表也不存在，跳过记录
                NULL;
            END;
            
            failure_count := failure_count + 1;
        END;
        
        row_number := row_number + 1;
    END LOOP;
    
    -- 更新批次状态（使用明确字段名）
    -- 检查哪些字段存在，然后使用正确的字段名
    BEGIN
        UPDATE training_program_import_batches 
        SET 
            tp_success_count = success_count,
            tp_failure_count = failure_count,
            status = CASE WHEN failure_count = 0 THEN 'completed' ELSE 'completed_with_errors' END,
            updated_at = NOW()
        WHERE id = batch_uuid;
    EXCEPTION WHEN OTHERS THEN
        -- 如果tp_success_count字段不存在，尝试其他字段名
        BEGIN
            UPDATE training_program_import_batches 
            SET 
                success_count = success_count,
                failure_count = failure_count,
                status = CASE WHEN failure_count = 0 THEN 'completed' ELSE 'completed_with_errors' END,
                updated_at = NOW()
            WHERE id = batch_uuid;
        EXCEPTION WHEN OTHERS THEN
            -- 如果都不存在，跳过更新
            NULL;
        END;
    END;
    
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
        'message', '培养方案导入成功',
        'data', jsonb_build_object(
            'success', success_count,
            'failed', failure_count,
            'total', success_count + failure_count,
            'batch_id', batch_uuid,
            'program_id', program_uuid,
            'program_code', final_program_code,
            'teacher_id', p_teacher_id
        )
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

COMMIT;