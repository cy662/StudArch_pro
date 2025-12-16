-- 修复批量导入学生筛选逻辑
-- 目标：排除已被任何教师导入的学生，避免重复导入和不同教师导入同一学生的风险

-- 删除已存在的函数（如果存在）
DROP FUNCTION IF EXISTS get_available_students_for_import;

CREATE FUNCTION get_available_students_for_import(
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
LANGUAGE plpgsql
SECURITY DEFINER
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
                    'created_at', u.created_at,
                    'updated_at', u.updated_at,
                    'role', jsonb_build_object(
                        'id', r.id,
                        'role_name', r.role_name,
                        'role_description', r.role_description,
                        'is_system_default', r.is_system_default,
                        'created_at', r.created_at,
                        'updated_at', r.updated_at
                    )
                )
            ),
            '[]'::jsonb
        ) as students,
        (
            SELECT COUNT(*)
            FROM users u_count
            WHERE u_count.role_id = '3'  -- 学生角色
              AND u_count.status = 'active'  -- 活跃状态
              AND NOT EXISTS (
                  -- 关键修复：排除已被任何教师导入的学生
                  SELECT 1 FROM teacher_students ts_count 
                  WHERE ts_count.student_id = u_count.id
              )
              AND (
                  p_keyword = '' OR 
                  LOWER(u_count.full_name) LIKE LOWER('%' || p_keyword || '%') OR
                  LOWER(u_count.user_number) LIKE LOWER('%' || p_keyword || '%') OR
                  LOWER(u_count.email) LIKE LOWER('%' || p_keyword || '%')
              )
              AND (p_grade = '' OR u_count.grade = p_grade)
              AND (p_department = '' OR u_count.department = p_department)
        ) as total_count
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.role_id = '3'  -- 学生角色
      AND u.status = 'active'  -- 活跃状态
      AND NOT EXISTS (
          -- 关键修复：排除已被任何教师导入的学生（而不仅仅是当前教师）
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
    ORDER BY u.created_at DESC
    LIMIT p_limit OFFSET v_offset;
END;
$$;

-- 授权执行权限
GRANT EXECUTE ON FUNCTION get_available_students_for_import TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_students_for_import TO anon;

-- 添加注释说明修复内容
COMMENT ON FUNCTION get_available_students_for_import IS '获取可导入学生列表，排除已被任何教师导入的学生，避免重复导入';

-- 创建一个辅助函数用于验证修复效果
CREATE OR REPLACE FUNCTION check_student_import_status(
    p_student_id UUID
)
RETURNS TABLE(
    student_id UUID,
    student_name TEXT,
    is_already_imported BOOLEAN,
    importing_teachers JSONB,
    available_for_import BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as student_id,
        u.full_name as student_name,
        COALESCE(EXISTS(SELECT 1 FROM teacher_students ts WHERE ts.student_id = u.id), false) as is_already_imported,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'teacher_id', t.id,
                    'teacher_name', t.full_name
                )
            ) FILTER (WHERE t.id IS NOT NULL),
            '[]'::jsonb
        ) as importing_teachers,
        NOT EXISTS(SELECT 1 FROM teacher_students ts WHERE ts.student_id = u.id) as available_for_import
    FROM users u
    LEFT JOIN teacher_students ts ON u.id = ts.student_id
    LEFT JOIN users t ON ts.teacher_id = t.id
    WHERE u.id = p_student_id
    GROUP BY u.id, u.full_name;
END;
$$;

-- 授权执行权限
GRANT EXECUTE ON FUNCTION check_student_import_status TO authenticated;
GRANT EXECUTE ON FUNCTION check_student_import_status TO anon;

COMMENT ON FUNCTION check_student_import_status IS '检查学生的导入状态，显示已被哪些教师导入';