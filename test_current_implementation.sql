-- 测试当前实现是否符合需求

-- 1. 检查当前所有学生状态
SELECT 
    u.id,
    u.username,
    u.full_name,
    u.user_number,
    CASE 
        WHEN EXISTS (SELECT 1 FROM teacher_students ts WHERE ts.student_id = u.id) 
        THEN '已关联' 
        ELSE '未关联' 
    END as import_status,
    COALESCE((
        SELECT string_agg(u2.username, ', ') 
        FROM teacher_students ts 
        JOIN users u2 ON ts.teacher_id = u2.id
        WHERE ts.student_id = u.id
    ), '无') as associated_teachers
FROM users u
WHERE u.role_id = 3  -- 学生角色
AND u.status = 'active'
ORDER BY u.created_at DESC;

-- 2. 测试不同教师的可导入学生列表
-- 请将下面的教师ID替换为实际的教师ID进行测试

-- 教师A的可导入学生列表
SELECT '教师A可导入学生' as teacher, count(*) as count FROM (
    SELECT u.id
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.role_id = 3  -- 学生角色
    AND u.status = 'active'
    AND NOT EXISTS (
        SELECT 1 
        FROM teacher_students ts 
        WHERE ts.student_id = u.id
    )
) as teacher_a_students;

-- 教师B的可导入学生列表
SELECT '教师B可导入学生' as teacher, count(*) as count FROM (
    SELECT u.id
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.role_id = 3  -- 学生角色
    AND u.status = 'active'
    AND NOT EXISTS (
        SELECT 1 
        FROM teacher_students ts 
        WHERE ts.student_id = u.id
    )
) as teacher_b_students;

-- 3. 验证函数是否正确工作
-- 请将教师ID替换为实际的教师ID
-- SELECT * FROM get_available_students_for_import('教师A的实际ID'::UUID, '', '', '', 1, 10);
-- SELECT * FROM get_available_students_for_import('教师B的实际ID'::UUID, '', '', '', 1, 10);