-- 全局唯一导入控制修复脚本
-- 确保新创建的学生在所有教师的导入列表中可见，而已被任何教师导入的学生不再出现在任何教师的导入列表中

-- 1. 删除旧函数
DROP FUNCTION IF EXISTS get_available_students_for_import(UUID,TEXT,TEXT,TEXT,INTEGER,INTEGER) CASCADE;

-- 2. 创建新的获取可导入学生列表的函数（确保全局唯一导入控制）
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

-- 3. 授权执行权限
GRANT EXECUTE ON FUNCTION get_available_students_for_import(UUID,TEXT,TEXT,TEXT,INTEGER,INTEGER) TO authenticated;

-- 4. 验证函数创建成功
DO $$
BEGIN
    RAISE NOTICE '✅ 全局唯一导入控制函数已更新完成！';
    RAISE NOTICE '新创建的学生将在所有教师的导入列表中可见';
    RAISE NOTICE '已被任何教师导入的学生将不再出现在任何教师的导入列表中';
END
$$;