-- 最终导入修复 - 完全避免有歧义的字段
-- 使用本地变量替代数据库字段操作

CREATE OR REPLACE FUNCTION import_training_program_courses_final(
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
    program_uuid UUID;
    local_success INTEGER := 0;
    local_failed INTEGER := 0;
    course_record JSONB;
    result JSONB;
    final_program_code TEXT;
    course_counter INTEGER := 1;
BEGIN
    -- 生成唯一的培养方案代码
    final_program_code := p_program_code || '_' || SUBSTRING(p_teacher_id::TEXT, 1, 8);
    
    -- 创建新的培养方案
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
    
    -- 完全不使用批次表，直接处理课程
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
                course_counter,
                'active',
                NOW(),
                NOW()
            );
            
            local_success := local_success + 1;
            course_counter := course_counter + 1;
            
        EXCEPTION WHEN OTHERS THEN
            local_failed := local_failed + 1;
            course_counter := course_counter + 1;
        END;
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
        'message', '培养方案导入成功（最终版）',
        'data', jsonb_build_object(
            'success', local_success,
            'failed', local_failed,
            'total', local_success + local_failed,
            'program_id', program_uuid,
            'program_code', final_program_code,
            'teacher_id', p_teacher_id,
            'note', '使用最终版导入函数，完全避开字段冲突'
        )
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 更新API函数调用
-- 将函数名改为最终的版本

COMMIT;

-- 测试函数
SELECT import_training_program_courses_final(
    '[{"course_number": "CS101", "course_name": "计算机基础", "credits": 3, "recommended_grade": "大一", "semester": "第一学期", "exam_method": "笔试", "course_nature": "必修课"}]'::jsonb,
    'FINAL_TEST',
    '最终测试方案',
    '11111111-1111-1111-1111-111111111121'
);