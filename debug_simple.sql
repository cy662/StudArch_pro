-- 简化版数据库调试脚本
-- 避免复杂的PL/pgSQL语法

-- ==================== 1. 检查表是否存在 ====================
SELECT '=== 检查表是否存在 ===' as check_info;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_profiles') 
        THEN '✅ student_profiles 表存在'
        ELSE '❌ student_profiles 表不存在'
    END as table_status;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_technical_tags') 
        THEN '✅ student_technical_tags 表存在'
        ELSE '❌ student_technical_tags 表不存在'
    END as table_status;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_learning_achievements') 
        THEN '✅ student_learning_achievements 表存在'
        ELSE '❌ student_learning_achievements 表不存在'
    END as table_status;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_learning_outcomes') 
        THEN '✅ student_learning_outcomes 表存在'
        ELSE '❌ student_learning_outcomes 表不存在'
    END as table_status;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_proof_materials') 
        THEN '✅ student_proof_materials 表存在'
        ELSE '❌ student_proof_materials 表不存在'
    END as table_status;

-- ==================== 2. 检查数据记录数 ====================
SELECT '=== 检查数据记录数 ===' as data_info;

SELECT 'student_profiles 记录数: ' || COUNT(*) as count FROM student_profiles;
SELECT 'student_technical_tags 记录数: ' || COUNT(*) as count FROM student_technical_tags;
SELECT 'student_learning_achievements 记录数: ' || COUNT(*) as count FROM student_learning_achievements;
SELECT 'student_learning_outcomes 记录数: ' || COUNT(*) as count FROM student_learning_outcomes;
SELECT 'student_proof_materials 记录数: ' || COUNT(*) as count FROM student_proof_materials;

-- ==================== 3. 检查student_profiles数据 ====================
SELECT '=== student_profiles 数据 ===' as profile_info;

SELECT 
    id::text as profile_id,
    COALESCE(full_name, '无姓名') as name,
    COALESCE(class_name, '无班级') as class,
    COALESCE(user_id::text, '无user_id') as user_id
FROM student_profiles 
LIMIT 5;

-- ==================== 4. 检查users表 ====================
SELECT '=== users 表 ===' as user_info;

SELECT id::text as user_id, username, role_id::text as role_id 
FROM users 
LIMIT 5;

-- ==================== 5. 检查表字段结构 ====================
SELECT '=== student_technical_tags 字段 ===' as field_info;

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'student_technical_tags' AND table_schema = 'public'
ORDER BY ordinal_position;

-- ==================== 6. 检查RLS状态 ====================
SELECT '=== RLS 状态 ===' as rls_info;

SELECT 
    tablename as table_name,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename LIKE 'student_%'
ORDER BY tablename;

-- ==================== 7. 测试插入功能（简化版） ====================
SELECT '=== 测试插入功能 ===' as test_info;

-- 获取第一个学生ID
CREATE TEMPORARY TABLE temp_student_id AS 
SELECT id FROM student_profiles LIMIT 1;

-- 测试插入技术标签
DO $$
BEGIN
    PERFORM '开始测试插入...';
    
    -- 尝试插入技术标签
    INSERT INTO student_technical_tags (
        student_profile_id, tag_name, tag_category, proficiency_level, learned_at
    ) 
    SELECT id, '测试JavaScript', '编程语言', 'intermediate', CURRENT_DATE 
    FROM temp_student_id;
    
    PERFORM '✅ 成功插入测试技术标签';
EXCEPTION WHEN OTHERS THEN
    PERFORM '❌ 插入失败: ' || SQLERRM;
END $$;

-- 检查插入结果
SELECT '最新插入的技术标签:' as result;
SELECT * FROM student_technical_tags WHERE tag_name = '测试JavaScript';

-- 清理临时表
DROP TABLE IF EXISTS temp_student_id;

-- ==================== 8. 检查约束 ====================
SELECT '=== 外键约束 ===' as constraint_info;

SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name LIKE 'student_%'
ORDER BY tc.table_name, tc.constraint_name;

SELECT '=== 调试完成 ===' as final_info;