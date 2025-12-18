-- 完整的教师学生管理功能修复脚本
-- 确保新创建的教师账号学生列表为空

-- 1. 确保teacher_students表存在正确的结构
CREATE TABLE IF NOT EXISTS teacher_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    UNIQUE(teacher_id, student_id)
);

-- 2. 创建索引提高查询性能
CREATE INDEX IF NOT EXISTS idx_teacher_students_teacher_id ON teacher_students(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_students_student_id ON teacher_students(student_id);

-- 3. 确保行级安全策略正确配置
ALTER TABLE teacher_students ENABLE ROW LEVEL SECURITY;

-- 4. 创建或更新策略：教师只能查看和管理自己的学生关联记录
DROP POLICY IF EXISTS "Teachers can view their own student associations" ON teacher_students;
CREATE POLICY "Teachers can view their own student associations"
    ON teacher_students FOR SELECT
    USING (
        auth.uid() = teacher_id OR
        (EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role_id = (SELECT id FROM roles WHERE role_name = 'super_admin')
        ))
    );

DROP POLICY IF EXISTS "Teachers can manage their own student associations" ON teacher_students;
CREATE POLICY "Teachers can manage their own student associations"
    ON teacher_students FOR ALL
    USING (
        auth.uid() = teacher_id OR
        (EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role_id = (SELECT id FROM roles WHERE role_name = 'super_admin')
        ))
    );

-- 5. 删除所有可能存在的冲突函数（包括所有重载版本）
DO $$
DECLARE
    func RECORD;
BEGIN
    -- 删除所有可能的 batch_add_students_to_teacher 函数变体
    FOR func IN 
        SELECT proname, oidvectortypes(proargtypes) as argtypes
        FROM pg_proc 
        WHERE proname = 'batch_add_students_to_teacher'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func.proname || '(' || func.argtypes || ') CASCADE';
    END LOOP;
    
    -- 删除所有可能的 get_teacher_students 函数变体
    FOR func IN 
        SELECT proname, oidvectortypes(proargtypes) as argtypes
        FROM pg_proc 
        WHERE proname = 'get_teacher_students'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func.proname || '(' || func.argtypes || ') CASCADE';
    END LOOP;
    
    -- 删除所有可能的 get_available_students_for_import 函数变体
    FOR func IN 
        SELECT proname, oidvectortypes(proargtypes) as argtypes
        FROM pg_proc 
        WHERE proname = 'get_available_students_for_import'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func.proname || '(' || func.argtypes || ') CASCADE';
    END LOOP;
    
    -- 删除所有可能的 remove_student_from_teacher 函数变体
    FOR func IN 
        SELECT proname, oidvectortypes(proargtypes) as argtypes
        FROM pg_proc 
        WHERE proname = 'remove_student_from_teacher'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func.proname || '(' || func.argtypes || ') CASCADE';
    END LOOP;
END $$;

-- 6. 创建获取教师学生列表的函数（确保返回空列表给新教师）
CREATE OR REPLACE FUNCTION get_teacher_students(
    p_teacher_id UUID,
    p_keyword TEXT DEFAULT '',
    p_page INTEGER DEFAULT 1,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    students JSONB,
    total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', u.id,
                    'username', u.username,
                    'email', u.email,
                    'user_number', u.user_number,
                    'full_name', u.full_name,
                    'phone', u.phone,
                    'department', u.department,
                    'grade', u.grade,
                    'class_name', u.class_name,
                    'status', u.status,
                    'role', r,
                    'associated_at', ts.created_at
                )
            ) FILTER (WHERE u.id IS NOT NULL),
            '[]'::jsonb
        ) as students,
        COUNT(u.id) as total_count
    FROM teacher_students ts
    JOIN users u ON ts.student_id = u.id
    JOIN roles r ON u.role_id = r.id
    WHERE ts.teacher_id = p_teacher_id
    AND r.role_name = 'student'
    AND (p_keyword = '' OR 
         u.full_name ILIKE '%' || p_keyword || '%' OR
         u.user_number ILIKE '%' || p_keyword || '%' OR
         u.email ILIKE '%' || p_keyword || '%')
    ORDER BY ts.created_at DESC
    LIMIT p_limit OFFSET ((p_page - 1) * p_limit);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 创建获取可导入学生列表的函数（确保全局唯一导入控制）
CREATE OR REPLACE FUNCTION get_available_students_for_import(
    p_teacher_id UUID,
    p_keyword TEXT DEFAULT '',
    p_grade TEXT DEFAULT '',
    p_department TEXT DEFAULT '',
    p_page INTEGER DEFAULT 1,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    students JSONB,
    total_count BIGINT
)
AS $$
DECLARE
    v_offset INTEGER := (p_page - 1) * p_limit;
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', u.id,
                    'username', u.username,
                    'email', u.email,
                    'user_number', u.user_number,
                    'full_name', u.full_name,
                    'phone', u.phone,
                    'department', u.department,
                    'grade', u.grade,
                    'class_name', u.class_name,
                    'status', u.status,
                    'role', r
                )
                ORDER BY u.created_at DESC
            ) FILTER (WHERE u.id IS NOT NULL),
            '[]'::jsonb
        ) as students,
        COUNT(*) as total_count
    FROM users u
    JOIN roles r ON u.role_id = r.id
    -- 核心逻辑：只选择未被任何教师关联的学生
    WHERE u.role_id = 3  -- 学生角色
    AND u.status = 'active'
    -- 确保学生未被任何教师导入（全局唯一控制）
    AND NOT EXISTS (
        SELECT 1 
        FROM teacher_students ts 
        WHERE ts.student_id = u.id
    )
    AND (p_keyword = '' OR 
         u.full_name ILIKE '%' || p_keyword || '%' OR 
         u.user_number ILIKE '%' || p_keyword || '%' OR
         u.email ILIKE '%' || p_keyword || '%')
    AND (p_grade = '' OR u.grade ILIKE '%' || p_grade || '%')
    AND (p_department = '' OR u.department ILIKE '%' || p_department || '%')
    ORDER BY u.created_at DESC
    LIMIT p_limit
    OFFSET v_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 创建批量添加学生到教师管理列表的函数
CREATE OR REPLACE FUNCTION batch_add_students_to_teacher(
    p_teacher_id UUID,
    p_student_ids UUID[]
)
RETURNS JSONB AS $$
DECLARE
    v_success_count INTEGER := 0;
    v_failed_count INTEGER := 0;
    v_student_id UUID;
BEGIN
    -- 验证教师是否存在
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = p_teacher_id 
        AND role_id = (SELECT id FROM roles WHERE role_name = 'teacher')
    ) THEN
        RETURN jsonb_build_object(
            'success', 0,
            'failed', 0,
            'error', '无效的教师ID或权限不足'
        );
    END IF;

    -- 批量插入学生关联
    FOREACH v_student_id IN ARRAY p_student_ids LOOP
        BEGIN
            -- 验证学生是否存在且状态正常
            IF EXISTS (
                SELECT 1 FROM users u
                JOIN roles r ON u.role_id = r.id
                WHERE u.id = v_student_id 
                AND r.role_name = 'student'
                AND u.status = 'active'
            ) THEN
                -- 插入关联记录（忽略重复）
                INSERT INTO teacher_students (teacher_id, student_id, created_by)
                VALUES (p_teacher_id, v_student_id, p_teacher_id)
                ON CONFLICT (teacher_id, student_id) DO NOTHING;
                
                v_success_count := v_success_count + 1;
            ELSE
                v_failed_count := v_failed_count + 1;
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                v_failed_count := v_failed_count + 1;
        END;
    END LOOP;

    RETURN jsonb_build_object(
        'success', v_success_count,
        'failed', v_failed_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. 创建移除学生关联的函数
CREATE OR REPLACE FUNCTION remove_student_from_teacher(
    p_teacher_id UUID,
    p_student_id UUID
)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    DELETE FROM teacher_students 
    WHERE teacher_id = p_teacher_id 
    AND student_id = p_student_id;
    
    RETURN FOUND;
END;
$$;

-- 10. 授权执行权限
GRANT EXECUTE ON FUNCTION get_teacher_students(UUID,TEXT,INTEGER,INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_students_for_import(UUID,TEXT,TEXT,TEXT,INTEGER,INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION batch_add_students_to_teacher(UUID,UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION remove_student_from_teacher(UUID,UUID) TO authenticated;

-- 11. 验证和测试
DO $$
DECLARE
    v_teacher_count INTEGER;
    v_student_count INTEGER;
    v_relation_count INTEGER;
BEGIN
    -- 统计数据
    SELECT COUNT(*) INTO v_teacher_count FROM users u WHERE u.role_id = '2';
    SELECT COUNT(*) INTO v_student_count FROM users u WHERE u.role_id = '3' AND u.status = 'active';
    SELECT COUNT(*) INTO v_relation_count FROM teacher_students;
    
    RAISE NOTICE '=== 验证结果 ===';
    RAISE NOTICE '教师数量: %', v_teacher_count;
    RAISE NOTICE '活跃学生数量: %', v_student_count;
    RAISE NOTICE '师生关联数量: %', v_relation_count;
    
    RAISE NOTICE '✅ 数据库结构和函数已更新完成！新教师账号将拥有空的学生列表。';
    RAISE NOTICE '✅ 全局唯一导入控制已启用：新创建的学生在所有教师的导入列表中可见，而已被任何教师导入的学生不再出现在任何教师的导入列表中。';
END
$$;