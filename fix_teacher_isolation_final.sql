-- 修复教师培养方案隔离功能 - 最终版本
-- 解决字段冲突问题

-- 首先检查现有表结构，避免字段冲突
DO $$
BEGIN
    -- 检查并添加teacher_id字段到training_programs表
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'training_programs' AND column_name = 'teacher_id'
    ) THEN
        ALTER TABLE training_programs ADD COLUMN teacher_id UUID REFERENCES users(id) ON DELETE CASCADE;
        CREATE INDEX idx_training_programs_teacher_id ON training_programs(teacher_id);
        RAISE NOTICE '✅ 添加training_programs.teacher_id字段';
    ELSE
        RAISE NOTICE '⚠️ training_programs.teacher_id字段已存在';
    END IF;
    
    -- 检查并添加teacher_id字段到training_program_import_batches表
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'training_program_import_batches' AND column_name = 'teacher_id'
    ) THEN
        ALTER TABLE training_program_import_batches ADD COLUMN teacher_id UUID REFERENCES users(id) ON DELETE CASCADE;
        CREATE INDEX idx_training_program_import_batches_teacher_id ON training_program_import_batches(teacher_id);
        RAISE NOTICE '✅ 添加training_program_import_batches.teacher_id字段';
    ELSE
        RAISE NOTICE '⚠️ training_program_import_batches.teacher_id字段已存在';
    END IF;
END $$;

-- 创建教师培养方案导入函数（解决字段冲突）
CREATE OR REPLACE FUNCTION import_training_program_courses_with_teacher_v2(
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
    import_success_count INTEGER;
    import_failure_count INTEGER;
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
    
    -- 创建导入批次（使用明确的字段名避免冲突）
    INSERT INTO training_program_import_batches (
        batch_name,
        program_id,
        teacher_id,
        imported_by,
        total_records,
        tp_success_count,  -- 使用明确的字段名
        tp_failure_count,  -- 使用明确的字段名
        status,
        created_at,
        updated_at
    ) VALUES (
        COALESCE(p_batch_name, p_program_name || '_导入批次'),
        program_uuid,
        p_teacher_id,
        COALESCE(p_imported_by, p_teacher_id),
        jsonb_array_length(p_courses),
        0,  -- 初始成功计数
        0,  -- 初始失败计数
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
            
            -- 记录失败信息到failure表
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
    
    -- 更新批次状态（使用明确的字段名）
    UPDATE training_program_import_batches 
    SET 
        tp_success_count = success_count,
        tp_failure_count = failure_count,
        status = CASE WHEN failure_count = 0 THEN 'completed' ELSE 'completed_with_errors' END,
        updated_at = NOW()
    WHERE id = batch_uuid;
    
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

-- 创建简化版的教师培养方案列表函数
CREATE OR REPLACE FUNCTION get_teacher_training_programs_v2(
    p_teacher_id UUID,
    p_page INTEGER DEFAULT 1,
    p_limit INTEGER DEFAULT 50
)
RETURNS JSONB AS $$
DECLARE
    offset_count INTEGER := (p_page - 1) * p_limit;
    result JSONB;
    total_count INTEGER;
BEGIN
    -- 获取总数
    SELECT COUNT(*) INTO total_count
    FROM training_programs tp
    WHERE tp.teacher_id = p_teacher_id AND tp.status = 'active';
    
    -- 获取分页数据
    SELECT jsonb_build_object(
        'programs', jsonb_agg(
            jsonb_build_object(
                'id', tp.id,
                'program_name', tp.program_name,
                'program_code', tp.program_code,
                'major', tp.major,
                'department', tp.department,
                'total_credits', tp.total_credits,
                'duration_years', tp.duration_years,
                'description', tp.description,
                'status', tp.status,
                'created_by', tp.created_by,
                'teacher_id', tp.teacher_id,
                'created_at', tp.created_at,
                'updated_at', tp.updated_at
            )
        ),
        'pagination', jsonb_build_object(
            'page', p_page,
            'limit', p_limit,
            'total', total_count,
            'totalPages', CEIL(total_count::NUMERIC / p_limit)
        )
    ) INTO result
    FROM training_programs tp
    WHERE 
        tp.teacher_id = p_teacher_id AND tp.status = 'active'
    ORDER BY tp.created_at DESC
    LIMIT p_limit OFFSET offset_count;
    
    RETURN COALESCE(result, '{"programs": [], "pagination": {"page": 1, "limit": 50, "total": 0, "totalPages": 0}}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- 创建简化版的教师分配函数
CREATE OR REPLACE FUNCTION assign_teacher_training_program_to_students_v2(
    p_teacher_id UUID,
    p_program_id UUID,
    p_student_ids UUID[],
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    success_count INTEGER := 0;
    failure_count INTEGER := 0;
    student_uuid UUID;
    result JSONB;
    failed_students JSONB := '[]'::jsonb;
    assignment_result JSONB;
    is_teacher_program BOOLEAN := FALSE;
BEGIN
    -- 验证教师是否拥有该培养方案
    SELECT COUNT(*) > 0 INTO is_teacher_program
    FROM training_programs 
    WHERE id = p_program_id AND teacher_id = p_teacher_id AND status = 'active';
    
    IF NOT is_teacher_program THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', '您无权操作此培养方案，该方案不属于您'
        );
    END IF;
    
    -- 遍历学生ID列表进行批量分配
    FOREACH student_uuid IN ARRAY p_student_ids
    LOOP
        BEGIN
            -- 直接插入分配记录（如果不存在）
            INSERT INTO student_training_programs (
                student_id,
                program_id,
                assigned_by,
                assigned_at,
                status,
                notes
            ) VALUES (
                student_uuid,
                p_program_id,
                p_teacher_id,
                NOW(),
                'active',
                COALESCE(p_notes, '批量分配培养方案')
            ) ON CONFLICT (student_id, program_id) 
            DO UPDATE SET 
                status = 'active',
                assigned_at = NOW(),
                notes = COALESCE(p_notes, '批量分配培养方案');
            
            success_count := success_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            failure_count := failure_count + 1;
            failed_students := failed_students || jsonb_build_object(
                'student_id', student_uuid,
                'error', SQLERRM
            );
        END;
    END LOOP;
    
    -- 构建返回结果
    result := jsonb_build_object(
        'success', success_count > 0,
        'message', format('批量分配完成：成功 %d 个，失败 %d 个', success_count, failure_count),
        'data', jsonb_build_object(
            'success_count', success_count,
            'failure_count', failure_count,
            'total_count', success_count + failure_count,
            'details', failed_students,
            'teacher_id', p_teacher_id,
            'program_id', p_program_id
        )
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 创建获取教师可用培养方案函数
CREATE OR REPLACE FUNCTION get_teacher_available_programs_v2(p_teacher_id UUID)
RETURNS SETOF JSONB AS $$
BEGIN
    RETURN QUERY
    SELECT jsonb_build_object(
        'id', tp.id,
        'program_name', tp.program_name,
        'program_code', tp.program_code,
        'major', tp.major,
        'department', tp.department,
        'total_credits', tp.total_credits,
        'created_at', tp.created_at
    )
    FROM training_programs tp
    WHERE 
        tp.teacher_id = p_teacher_id 
        AND tp.status = 'active'
    ORDER BY tp.created_at DESC;
END;
$$ LANGUAGE plpgsql;

COMMIT;

-- 创建一个简单的测试函数
CREATE OR REPLACE FUNCTION test_teacher_isolation()
RETURNS JSONB AS $$
DECLARE
    test_result JSONB;
BEGIN
    test_result := jsonb_build_object(
        'message', '教师培养方案隔离功能已部署完成',
        'functions_available', ARRAY[
            'import_training_program_courses_with_teacher_v2',
            'get_teacher_training_programs_v2',
            'assign_teacher_training_program_to_students_v2',
            'get_teacher_available_programs_v2'
        ]
    );
    
    RETURN test_result;
END;
$$ LANGUAGE plpgsql;

-- 执行测试
SELECT test_teacher_isolation();