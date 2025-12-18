-- 诊断脚本：检查教师学生关联问题

-- 1. 检查teacher_students表结构信息
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'teacher_students'
ORDER BY ordinal_position;

-- 2. 检查teacher_students表中的数据
SELECT 
    ts.id,
    ts.teacher_id,
    ts.student_id,
    ts.created_at,
    u1.username as teacher_username,
    u2.username as student_username
FROM teacher_students ts
LEFT JOIN users u1 ON ts.teacher_id = u1.id
LEFT JOIN users u2 ON ts.student_id = u2.id
ORDER BY ts.created_at DESC
LIMIT 20;

-- 3. 检查用户表中的教师和学生
SELECT 
    '教师' as user_type,
    id,
    username,
    user_number,
    full_name
FROM users 
WHERE role_id = '2'  -- 教师角色
ORDER BY created_at;

SELECT 
    '学生' as user_type,
    id,
    username,
    user_number,
    full_name,
    status
FROM users 
WHERE role_id = '3'  -- 学生角色
AND status = 'active'
ORDER BY created_at
LIMIT 20;

-- 4. 检查特定教师的关联学生
-- 请将下面的教师ID替换为实际的教师ID进行测试
SELECT 
    u.id as student_id,
    u.username as student_username,
    u.full_name as student_name,
    CASE 
        WHEN ts.student_id IS NOT NULL THEN '已关联'
        ELSE '未关联'
    END as association_status
FROM users u
LEFT JOIN teacher_students ts ON u.id = ts.student_id AND ts.teacher_id = '请替换为实际教师ID'
WHERE u.role_id = '3'  -- 学生角色
AND u.status = 'active'
ORDER BY u.created_at
LIMIT 20;

-- 5. 检查被任何教师关联的学生
SELECT 
    u.id as student_id,
    u.username as student_username,
    u.full_name as student_name,
    COUNT(ts.id) as associated_teachers_count
FROM users u
LEFT JOIN teacher_students ts ON u.id = ts.student_id
WHERE u.role_id = '3'  -- 学生角色
AND u.status = 'active'
GROUP BY u.id, u.username, u.full_name
ORDER BY associated_teachers_count DESC, u.created_at
LIMIT 20;

-- 6. 测试get_available_students_for_import函数
-- 请将下面的教师ID替换为实际的教师ID进行测试
-- SELECT * FROM get_available_students_for_import('请替换为实际教师ID', '', '', '', 1, 20);