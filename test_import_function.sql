-- 测试导入函数是否正确排除已关联的学生

-- 1. 首先检查现有的师生关联
SELECT '现有师生关联数' as info, COUNT(*) as count FROM teacher_students;

-- 2. 检查活跃学生总数
SELECT '活跃学生总数' as info, COUNT(*) as count 
FROM users 
WHERE role_id = '3' AND status = 'active';

-- 3. 检查已被任何教师关联的学生数
SELECT '已被关联的学生数' as info, COUNT(DISTINCT student_id) as count 
FROM teacher_students;

-- 4. 检查未被任何教师关联的学生数
SELECT '未被关联的学生数' as info, 
       COUNT(*) as count 
FROM users u
WHERE u.role_id = '3' 
AND u.status = 'active'
AND u.id NOT IN (
    SELECT DISTINCT student_id 
    FROM teacher_students 
    WHERE student_id IS NOT NULL
);

-- 5. 测试函数 - 请将下面的教师ID替换为实际的教师ID
-- SELECT * FROM get_available_students_for_import('实际教师ID', '', '', '', 1, 20);

-- 6. 更详细的测试查询
SELECT 
    u.id,
    u.username,
    u.full_name,
    u.user_number,
    CASE 
        WHEN u.id IN (SELECT DISTINCT student_id FROM teacher_students WHERE student_id IS NOT NULL) 
        THEN '已关联' 
        ELSE '未关联' 
    END as status
FROM users u
WHERE u.role_id = '3' 
AND u.status = 'active'
ORDER BY u.created_at
LIMIT 30;