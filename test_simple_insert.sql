-- 简单测试插入脚本
-- 用于验证数据库基本保存功能

-- ==================== 1. 确保有学生数据 ====================
-- 检查是否有学生记录
SELECT '=== 检查学生数据 ===' as info;
SELECT COUNT(*) as student_count FROM student_profiles;

-- 如果没有学生，创建一个测试学生
INSERT INTO student_profiles (user_id, student_number, full_name, class_name)
SELECT 
    (SELECT id FROM users LIMIT 1),
    'TEST2024001',
    '测试学生',
    '测试班级'
WHERE NOT EXISTS (SELECT 1 FROM student_profiles LIMIT 1);

-- ==================== 2. 获取测试学生ID ====================
CREATE TEMPORARY TABLE test_student AS
SELECT id FROM student_profiles LIMIT 1;

-- ==================== 3. 测试插入技术标签 ====================
SELECT '=== 测试插入技术标签 ===' as info;

DELETE FROM student_technical_tags WHERE tag_name = '测试JavaScript';

INSERT INTO student_technical_tags (
    student_profile_id, tag_name, tag_category, proficiency_level, 
    learned_at, learning_hours, confidence_score
) 
SELECT 
    id, '测试JavaScript', '编程语言', 'intermediate',
    CURRENT_DATE - INTERVAL '30 days', 20, 7
FROM test_student;

SELECT '技术标签插入完成，记录数: ' || COUNT(*) as result 
FROM student_technical_tags WHERE tag_name = '测试JavaScript';

-- ==================== 4. 测试插入学习收获 ====================
SELECT '=== 测试插入学习收获 ===' as info;

DELETE FROM student_learning_achievements WHERE title = '测试JavaScript收获';

INSERT INTO student_learning_achievements (
    student_profile_id, title, content, achievement_type,
    achieved_at, impact_level
) 
SELECT 
    id, '测试JavaScript收获', '通过学习JavaScript掌握了基础的前端开发技能', 
    'skill', CURRENT_DATE - INTERVAL '25 days', 'medium'
FROM test_student;

SELECT '学习收获插入完成，记录数: ' || COUNT(*) as result 
FROM student_learning_achievements WHERE title = '测试JavaScript收获';

-- ==================== 5. 测试插入学习成果 ====================
SELECT '=== 测试插入学习成果 ===' as info;

DELETE FROM student_learning_outcomes WHERE outcome_title = '测试个人项目';

INSERT INTO student_learning_outcomes (
    student_profile_id, outcome_title, outcome_description, outcome_type,
    quality_rating, innovation_score, practical_value
) 
SELECT 
    id, '测试个人项目', '使用JavaScript开发的个人网站', 'project',
    4, 3, 4
FROM test_student;

SELECT '学习成果插入完成，记录数: ' || COUNT(*) as result 
FROM student_learning_outcomes WHERE outcome_title = '测试个人项目';

-- ==================== 6. 测试插入证明材料 ====================
SELECT '=== 测试插入证明材料 ===' as info;

DELETE FROM student_proof_materials WHERE material_name = '测试证书';

INSERT INTO student_proof_materials (
    student_profile_id, material_name, material_type,
    file_name, verification_status
) 
SELECT 
    id, '测试证书', 'certificate',
    'test_cert.pdf', 'pending'
FROM test_student;

SELECT '证明材料插入完成，记录数: ' || COUNT(*) as result 
FROM student_proof_materials WHERE material_name = '测试证书';

-- ==================== 7. 显示所有测试数据 ====================
SELECT '=== 显示插入的测试数据 ===' as final_info;

SELECT '技术标签:' as section;
SELECT stt.*, sp.full_name, sp.class_name 
FROM student_technical_tags stt
JOIN student_profiles sp ON stt.student_profile_id = sp.id
WHERE stt.tag_name LIKE '测试%';

SELECT '学习收获:' as section;
SELECT sla.*, sp.full_name, sp.class_name 
FROM student_learning_achievements sla
JOIN student_profiles sp ON sla.student_profile_id = sp.id
WHERE sla.title LIKE '测试%';

SELECT '学习成果:' as section;
SELECT slo.*, sp.full_name, sp.class_name 
FROM student_learning_outcomes slo
JOIN student_profiles sp ON slo.student_profile_id = sp.id
WHERE slo.outcome_title LIKE '测试%';

SELECT '证明材料:' as section;
SELECT spm.*, sp.full_name, sp.class_name 
FROM student_proof_materials spm
JOIN student_profiles sp ON spm.student_profile_id = sp.id
WHERE spm.material_name LIKE '测试%';

-- ==================== 8. 统计测试结果 ====================
SELECT '=== 测试结果统计 ===' as summary;

SELECT 
    '总测试记录数' as type,
    (
        SELECT COUNT(*) FROM student_technical_tags WHERE tag_name LIKE '测试%'
    ) +
    (
        SELECT COUNT(*) FROM student_learning_achievements WHERE title LIKE '测试%'
    ) +
    (
        SELECT COUNT(*) FROM student_learning_outcomes WHERE outcome_title LIKE '测试%'
    ) +
    (
        SELECT COUNT(*) FROM student_proof_materials WHERE material_name LIKE '测试%'
    ) as count
UNION ALL
SELECT '技术标签' as type, COUNT(*) as count
FROM student_technical_tags WHERE tag_name LIKE '测试%'
UNION ALL
SELECT '学习收获' as type, COUNT(*) as count
FROM student_learning_achievements WHERE title LIKE '测试%'
UNION ALL
SELECT '学习成果' as type, COUNT(*) as count
FROM student_learning_outcomes WHERE outcome_title LIKE '测试%'
UNION ALL
SELECT '证明材料' as type, COUNT(*) as count
FROM student_proof_materials WHERE material_name LIKE '测试%';

-- 清理临时表
DROP TABLE IF EXISTS test_student;

SELECT '=== 测试完成 ===' as complete_info;