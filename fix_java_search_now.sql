-- 修复Java标签搜索问题的SQL脚本

-- 1. 检查学号为2023015701的学生是否存在
SELECT '检查学生数据' as step, u.id, u.full_name, u.user_number, u.role_id
FROM users u 
WHERE u.user_number = '2023015701';

-- 2. 检查该学生是否有档案
SELECT '检查学生档案' as step, sp.id as profile_id, sp.user_id, sp.full_name, sp.class_name
FROM student_profiles sp
WHERE sp.user_id = (SELECT id FROM users WHERE user_number = '2023015701');

-- 3. 检查该学生是否有Java标签
SELECT '检查Java标签' as step, stt.id, stt.tag_name, stt.tag_category, stt.proficiency_level, stt.status
FROM student_technical_tags stt
WHERE stt.student_profile_id = (
    SELECT id FROM student_profiles 
    WHERE user_id = (SELECT id FROM users WHERE user_number = '2023015701')
)
AND stt.status = 'active';

-- 4. 如果没有Java标签，创建一个
INSERT INTO student_technical_tags (
    student_profile_id,
    tag_name,
    tag_category,
    proficiency_level,
    description,
    learned_at,
    learning_hours,
    practice_projects,
    confidence_score,
    status,
    created_at,
    updated_at
) 
SELECT 
    sp.id,
    'Java',
    'programming_language',
    'intermediate',
    'Java编程语言学习和项目开发',
    CURRENT_DATE,
    100,
    4,
    8,
    'active',
    NOW(),
    NOW()
FROM student_profiles sp
WHERE sp.user_id = (SELECT id FROM users WHERE user_number = '2023015701')
AND NOT EXISTS (
    SELECT 1 FROM student_technical_tags stt2 
    WHERE stt2.student_profile_id = sp.id 
    AND stt2.tag_name = 'Java'
    AND stt2.status = 'active'
);

-- 5. 检查教师数据
SELECT '检查教师数据' as step, u.id, u.full_name, u.username
FROM users u
WHERE u.role_id = '2'
LIMIT 3;

-- 6. 为教师和学生建立关联（如果不存在）
INSERT INTO teacher_students (teacher_id, student_id)
SELECT 
    t.id,
    s.id
FROM users t, users s
WHERE t.role_id = '2' 
AND s.user_number = '2023015701'
AND s.role_id = '3'
AND NOT EXISTS (
    SELECT 1 FROM teacher_students ts 
    WHERE ts.teacher_id = t.id 
    AND ts.student_id = s.id
)
LIMIT 1;

-- 7. 验证Java标签搜索结果
SELECT '验证Java搜索' as step, 
    u.user_number,
    u.full_name,
    sp.class_name,
    stt.tag_name,
    stt.tag_category,
    stt.proficiency_level,
    t.full_name as teacher_name
FROM student_technical_tags stt
JOIN student_profiles sp ON stt.student_profile_id = sp.id
JOIN users u ON sp.user_id = u.id
JOIN teacher_students ts_rel ON sp.user_id = ts_rel.student_id
JOIN users t ON ts_rel.teacher_id = t.id
WHERE stt.tag_name = 'Java'
AND stt.status = 'active'
AND t.role_id = '2'
AND u.role_id = '3';

-- 8. 显示所有技术标签数据用于调试
SELECT '所有技术标签数据' as step,
    u.user_number,
    u.full_name,
    stt.tag_name,
    stt.status
FROM student_technical_tags stt
JOIN student_profiles sp ON stt.student_profile_id = sp.id
JOIN users u ON sp.user_id = u.id
WHERE stt.status = 'active'
ORDER BY u.user_number, stt.tag_name;

-- 9. 显示师生关联数据
SELECT '师生关联数据' as step,
    t.full_name as teacher_name,
    s.user_number,
    s.full_name as student_name
FROM teacher_students ts
JOIN users t ON ts.teacher_id = t.id
JOIN users s ON ts.student_id = s.id
WHERE t.role_id = '2' AND s.role_id = '3'
ORDER BY t.full_name, s.user_number;