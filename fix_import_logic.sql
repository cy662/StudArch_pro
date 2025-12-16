-- 修复导入逻辑：确保新创建且未被任何教师导入的学生可以被导入

-- 1. 删除旧函数
DROP FUNCTION IF EXISTS get_available_students_for_import(UUID,TEXT,TEXT,TEXT,INTEGER,INTEGER) CASCADE;

-- 2. 创建修复后的函数
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
            ) FILTER (WHERE u.id IS NOT NULL),
            '[]'::jsonb
        ) as students,
        COUNT(*) as total_count
    FROM users u
    JOIN roles r ON u.role_id = r.id
    -- 关键修复：正确检查学生是否已被任何教师导入
    WHERE u.role_id = 3  -- 学生角色
    AND u.status = 'active'
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

-- 3. 授权执行权限
GRANT EXECUTE ON FUNCTION get_available_students_for_import(UUID,TEXT,TEXT,TEXT,INTEGER,INTEGER) TO authenticated;

-- 4. 验证函数创建成功
SELECT '✅ 函数创建完成' as status;

-- 5. 测试查询 - 检查哪些学生应该出现在导入列表中
SELECT 
    u.id,
    u.username,
    u.full_name,
    u.user_number,
    CASE 
        WHEN EXISTS (SELECT 1 FROM teacher_students ts WHERE ts.student_id = u.id) 
        THEN '已关联' 
        ELSE '未关联' 
    END as import_status
FROM users u
WHERE u.role_id = 3  -- 学生角色
AND u.status = 'active'
ORDER BY u.created_at DESC
LIMIT 20;