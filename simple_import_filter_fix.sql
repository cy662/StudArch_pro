-- 简化版批量导入筛选逻辑修复
-- 目标：排除已被任何教师导入的学生

-- 删除已存在的函数
DROP FUNCTION IF EXISTS get_available_students_for_import CASCADE;

-- 创建新函数
CREATE OR REPLACE FUNCTION get_available_students_for_import(
    p_teacher_id UUID,
    p_keyword TEXT DEFAULT '',
    p_grade TEXT DEFAULT '',
    p_department TEXT DEFAULT '',
    p_page INTEGER DEFAULT 1,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE(
    students JSONB,
    total_count BIGINT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
WITH filtered_students AS (
    SELECT 
        u.id,
        u.username,
        u.email,
        u.user_number,
        u.full_name,
        u.phone,
        u.department,
        u.grade,
        u.class_name,
        u.status,
        u.created_at,
        u.updated_at,
        r.id as role_id,
        r.role_name,
        r.role_description,
        r.is_system_default,
        r.created_at as role_created_at,
        r.updated_at as role_updated_at
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.role_id = '3'  -- 学生角色
      AND u.status = 'active'  -- 活跃状态
      AND NOT EXISTS (
          -- 关键修复：排除已被任何教师导入的学生
          SELECT 1 FROM teacher_students ts 
          WHERE ts.student_id = u.id
      )
      AND (
          p_keyword = '' OR 
          LOWER(u.full_name) LIKE LOWER('%' || p_keyword || '%') OR
          LOWER(u.user_number) LIKE LOWER('%' || p_keyword || '%') OR
          LOWER(u.email) LIKE LOWER('%' || p_keyword || '%')
      )
      AND (p_grade = '' OR u.grade = p_grade)
      AND (p_department = '' OR u.department = p_department)
),
paginated_students AS (
    SELECT * FROM filtered_students
    ORDER BY created_at DESC
    LIMIT p_limit OFFSET (p_page - 1) * p_limit
)
SELECT 
    (SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', id,
            'username', username,
            'email', email,
            'user_number', user_number,
            'full_name', full_name,
            'phone', phone,
            'department', department,
            'grade', grade,
            'class_name', class_name,
            'status', status,
            'created_at', created_at,
            'updated_at', updated_at,
            'role', jsonb_build_object(
                'id', role_id,
                'role_name', role_name,
                'role_description', role_description,
                'is_system_default', is_system_default,
                'created_at', role_created_at,
                'updated_at', role_updated_at
            )
        )
    ), '[]'::jsonb) FROM paginated_students) as students,
    (SELECT COUNT(*) FROM filtered_students) as total_count;
$$;

-- 授权
GRANT EXECUTE ON FUNCTION get_available_students_for_import TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_students_for_import TO anon;

-- 添加注释
COMMENT ON FUNCTION get_available_students_for_import IS '获取可导入学生列表，排除已被任何教师导入的学生，避免重复导入';

-- 创建验证函数
CREATE OR REPLACE FUNCTION check_student_import_status(p_student_id UUID)
RETURNS TABLE(
    student_id UUID,
    student_name TEXT,
    is_imported BOOLEAN,
    teacher_count BIGINT,
    importing_teachers JSONB
)
LANGUAGE sql
SECURITY DEFINER
AS $$
SELECT 
    u.id as student_id,
    u.full_name as student_name,
    COALESCE(EXISTS(SELECT 1 FROM teacher_students ts WHERE ts.student_id = u.id), false) as is_imported,
    (SELECT COUNT(*) FROM teacher_students ts WHERE ts.student_id = u.id) as teacher_count,
    COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'teacher_id', t.id,
                'teacher_name', t.full_name,
                'teacher_email', t.email
            )
        ) FILTER (WHERE t.id IS NOT NULL),
        '[]'::jsonb
    ) as importing_teachers
FROM users u
LEFT JOIN teacher_students ts ON u.id = ts.student_id
LEFT JOIN users t ON ts.teacher_id = t.id
WHERE u.id = p_student_id
GROUP BY u.id, u.full_name;
$$;

GRANT EXECUTE ON FUNCTION check_student_import_status TO authenticated;
GRANT EXECUTE ON FUNCTION check_student_import_status TO anon;

COMMENT ON FUNCTION check_student_import_status IS '检查学生导入状态，显示已被哪些教师导入';