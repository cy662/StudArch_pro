-- 教师级培养方案数据隔离数据库修改（修复版）
-- 实现教师级别的培养方案导入和管理隔离

-- 1. 为培养方案主表添加教师ID字段
ALTER TABLE training_programs 
ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- 2. 为培养方案导入批次表添加教师ID字段
ALTER TABLE training_program_import_batches 
ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- 3. 创建索引提高查询性能
CREATE INDEX IF NOT EXISTS idx_training_programs_teacher_id ON training_programs(teacher_id);
CREATE INDEX IF NOT EXISTS idx_training_program_import_batches_teacher_id ON training_program_import_batches(teacher_id);

-- 4. 创建教师级培养方案隔离函数
CREATE OR REPLACE FUNCTION get_teacher_training_programs(
    p_teacher_id UUID,
    p_program_name TEXT DEFAULT NULL,
    p_program_code TEXT DEFAULT NULL,
    p_status TEXT DEFAULT 'active',
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
    WHERE 
        tp.teacher_id = p_teacher_id
        AND (p_status IS NULL OR tp.status = p_status)
        AND (p_program_name IS NULL OR tp.program_name ILIKE '%' || p_program_name || '%')
        AND (p_program_code IS NULL OR tp.program_code ILIKE '%' || p_program_code || '%');
    
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
                'course_count', course_count.course_count,
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
    LEFT JOIN (
        SELECT tpc.program_id, COUNT(*) as course_count
        FROM training_program_courses tpc
        WHERE tpc.status = 'active'
        GROUP BY tpc.program_id
    ) course_count ON tp.id = course_count.program_id
    WHERE 
        tp.teacher_id = p_teacher_id
        AND (p_status IS NULL OR tp.status = p_status)
        AND (p_program_name IS NULL OR tp.program_name ILIKE '%' || p_program_name || '%')
        AND (p_program_code IS NULL OR tp.program_code ILIKE '%' || p_program_code || '%')
    ORDER BY tp.created_at DESC
    LIMIT p_limit OFFSET offset_count;
    
    RETURN COALESCE(result, '{"programs": [], "pagination": {"page": 1, "limit": 50, "total": 0, "totalPages": 0}}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- 5. 更新培养方案导入函数支持教师隔离
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
    
    -- 创建导入批次（关联教师）
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
            
            failure_count := failure_count + 1;
        END;
        
        row_number := row_number + 1;
    END LOOP;
    
    -- 更新批次状态
    UPDATE training_program_import_batches 
    SET 
        success_count = success_count,
        failure_count = failure_count,
        status = CASE WHEN failure_count = 0 THEN 'completed' ELSE 'completed' END,
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

-- 6. 更新培养方案分配函数，确保教师只能分配自己创建的培养方案
CREATE OR REPLACE FUNCTION assign_teacher_training_program_to_students(
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
            -- 调用原有分配函数（会验证教师学生关系）
            SELECT assign_training_program_to_student(student_uuid, p_program_id, p_teacher_id, p_notes)
            INTO assignment_result;
            
            -- 检查分配结果
            IF (assignment_result->>'success')::boolean THEN
                success_count := success_count + 1;
            ELSE
                failure_count := failure_count + 1;
                failed_students := failed_students || jsonb_build_object(
                    'student_id', student_uuid,
                    'error', assignment_result->>'message'
                );
            END IF;
            
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

-- 7. 获取教师可用的培养方案（用于分配界面）
CREATE OR REPLACE FUNCTION get_teacher_available_programs(p_teacher_id UUID)
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
        'course_count', course_count.course_count,
        'created_at', tp.created_at
    )
    FROM training_programs tp
    LEFT JOIN (
        SELECT tpc.program_id, COUNT(*) as course_count
        FROM training_program_courses tpc
        WHERE tpc.status = 'active'
        GROUP BY tpc.program_id
    ) course_count ON tp.id = course_count.program_id
    WHERE 
        tp.teacher_id = p_teacher_id 
        AND tp.status = 'active'
    ORDER BY tp.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 8. 获取教师导入历史
CREATE OR REPLACE FUNCTION get_teacher_import_history(p_teacher_id UUID)
RETURNS SETOF JSONB AS $$
BEGIN
    RETURN QUERY
    SELECT jsonb_build_object(
        'id', tpib.id,
        'batch_name', tpib.batch_name,
        'program_name', tp.program_name,
        'program_code', tp.program_code,
        'imported_by', tpib.imported_by,
        'total_records', tpib.total_records,
        'success_count', tpib.success_count,
        'failure_count', tpib.failure_count,
        'status', tpib.status,
        'error_summary', tpib.error_summary,
        'created_at', tpib.created_at,
        'updated_at', tpib.updated_at
    )
    FROM training_program_import_batches tpib
    LEFT JOIN training_programs tp ON tpib.program_id = tp.id
    WHERE tpib.teacher_id = p_teacher_id
    ORDER BY tpib.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 9. 数据迁移：将现有的全局培养方案分配给系统管理员（如果有管理员账号）
DO $$
DECLARE
    admin_user UUID;
BEGIN
    -- 尝试找到管理员用户（这里假设role_id为1的用户，如果没有则跳过）
    SELECT id INTO admin_user 
    FROM users 
    WHERE role_id = 1 
    LIMIT 1;
    
    IF admin_user IS NOT NULL THEN
        -- 将没有teacher_id的培养方案分配给管理员
        UPDATE training_programs 
        SET teacher_id = admin_user 
        WHERE teacher_id IS NULL;
        
        -- 将没有teacher_id的导入批次分配给管理员
        UPDATE training_program_import_batches 
        SET teacher_id = admin_user 
        WHERE teacher_id IS NULL;
        
        RAISE NOTICE '已将现有培养方案数据迁移到管理员账号: %', admin_user;
    ELSE
        -- 如果没有管理员，保持数据原样，但记录警告
        RAISE WARNING '未找到管理员账号，现有培养方案数据保持无teacher_id状态';
    END IF;
END $$;

-- 10. 创建视图简化API调用
CREATE OR REPLACE VIEW api_teacher_training_programs AS
SELECT * FROM get_teacher_training_programs(NULL::UUID);

CREATE OR REPLACE VIEW api_teacher_import_history AS
SELECT * FROM get_teacher_import_history(NULL::UUID);

COMMIT;