-- 测试学生学习信息数据库设置
-- 先执行这个脚本验证修复是否成功

-- 1. 检查现有student_profiles表结构
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'student_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. 执行修复版本的数据库设计（简化版本）
-- 注意：这里只创建必要的表来测试

-- 添加缺失的字段（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_profiles' AND column_name = 'full_name') THEN
        ALTER TABLE student_profiles ADD COLUMN full_name TEXT;
        RAISE NOTICE '已添加full_name字段';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_profiles' AND column_name = 'student_number') THEN
        ALTER TABLE student_profiles ADD COLUMN student_number TEXT;
        RAISE NOTICE '已添加student_number字段';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_profiles' AND column_name = 'class_name') THEN
        ALTER TABLE student_profiles ADD COLUMN class_name TEXT;
        RAISE NOTICE '已添加class_name字段';
    END IF;
END $$;

-- 3. 创建测试用的技术标签表（简化版）
CREATE TABLE IF NOT EXISTS student_technical_tags_test (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_profile_id UUID NOT NULL,
    tag_name VARCHAR(100) NOT NULL,
    tag_category VARCHAR(50) NOT NULL,
    proficiency_level VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 测试视图创建（修复版本）
DROP VIEW IF EXISTS student_learning_summary_test;
CREATE OR REPLACE VIEW student_learning_summary_test AS
SELECT 
    sp.id as student_profile_id,
    COALESCE(sp.full_name, u.full_name, u.username, '未知学生') as full_name,
    COALESCE(sp.class_name, u.class_name, '未分配班级') as class_name,
    COUNT(DISTINCT stt.id) as total_tags
FROM student_profiles sp
LEFT JOIN users u ON sp.user_id = u.id
LEFT JOIN student_technical_tags_test stt ON sp.id = stt.student_profile_id
GROUP BY sp.id, u.full_name, u.username, u.class_name, sp.full_name, sp.class_name;

-- 5. 测试查询是否正常工作
SELECT '=== 测试视图查询 ===' as test_info;
SELECT * FROM student_learning_summary_test LIMIT 5;

-- 6. 检查student_profiles表的数据
SELECT '=== student_profiles表数据检查 ===' as test_info;
SELECT id, 
       COALESCE(full_name, '无full_name') as full_name,
       COALESCE(student_number, '无student_number') as student_number,
       COALESCE(class_name, '无class_name') as class_name,
       user_id
FROM student_profiles 
LIMIT 5;

-- 7. 检查users表结构（看看有哪些字段可用）
SELECT '=== users表结构检查 ===' as test_info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. 如果student_profiles为空，插入一些测试数据
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM student_profiles) = 0 THEN
        -- 先检查users表中是否有学生用户
        INSERT INTO student_profiles (id, user_id, student_number, full_name, class_name)
        SELECT 
            gen_random_uuid(),
            id,
            COALESCE(user_number, 'TEST' || EXTRACT(EPOCH FROM NOW())::text),
            COALESCE(full_name, username, '测试学生'),
            COALESCE(class_name, '测试班级')
        FROM users 
        WHERE role_id IN (SELECT id FROM roles WHERE role_name = 'student')
        LIMIT 3;
        
        RAISE NOTICE '已插入测试学生数据';
    END IF;
END $$;

SELECT '=== 最终检查 ===' as test_info;
SELECT 'student_profiles记录数: ' || COUNT(*) as info FROM student_profiles;

-- 如果一切正常，现在可以执行完整的修复版本
SELECT '=== 修复脚本准备就绪 ===' as status;
SELECT '现在可以执行: \i student_learning_info_design_fixed.sql' as next_step;