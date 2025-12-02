-- 调试数据保存问题的检查脚本
-- 运行此脚本来诊断为什么填写的信息没有保存

-- ==================== 1. 检查表是否存在且有数据 ====================
DO $$
DECLARE
    v_record RECORD;
    RAISE NOTICE '=== 检查表是否存在 ===';
    
    -- 检查主要表是否存在
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_technical_tags') THEN
        RAISE NOTICE '✅ student_technical_tags 表存在，记录数: %', (SELECT COUNT(*) FROM student_technical_tags);
    ELSE
        RAISE NOTICE '❌ student_technical_tags 表不存在';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_learning_achievements') THEN
        RAISE NOTICE '✅ student_learning_achievements 表存在，记录数: %', (SELECT COUNT(*) FROM student_learning_achievements);
    ELSE
        RAISE NOTICE '❌ student_learning_achievements 表不存在';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_learning_outcomes') THEN
        RAISE NOTICE '✅ student_learning_outcomes 表存在，记录数: %', (SELECT COUNT(*) FROM student_learning_outcomes);
    ELSE
        RAISE NOTICE '❌ student_learning_outcomes 表不存在';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_proof_materials') THEN
        RAISE NOTICE '✅ student_proof_materials 表存在，记录数: %', (SELECT COUNT(*) FROM student_proof_materials);
    ELSE
        RAISE NOTICE '❌ student_proof_materials 表不存在';
    END IF;
    
    RAISE NOTICE '=== 检查student_profiles表 ===';
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_profiles') THEN
        RAISE NOTICE '✅ student_profiles 表存在，记录数: %', (SELECT COUNT(*) FROM student_profiles);
        
        -- 显示前5条学生记录
        RAISE NOTICE 'student_profiles表前5条记录:';
        FOR v_record IN 
            SELECT id, COALESCE(full_name, '无姓名') as name, COALESCE(class_name, '无班级') as class, user_id 
                FROM student_profiles 
                LIMIT 5
        LOOP
            RAISE NOTICE '  ID: %, 姓名: %, 班级: %, user_id: %', v_record.id, v_record.name, v_record.class, v_record.user_id;
        END LOOP;
    ELSE
        RAISE NOTICE '❌ student_profiles 表不存在';
    END IF;
END $$;

-- ==================== 2. 检查用户表和关联关系 ====================
SELECT '=== 检查users表 ===' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '=== users表数据 ===' as info;
SELECT id, username, COALESCE(full_name, username) as display_name, role_id 
FROM users 
LIMIT 5;

-- ==================== 3. 检查表字段 ====================
SELECT '=== student_technical_tags表字段 ===' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'student_technical_tags' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '=== student_learning_achievements表字段 ===' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'student_learning_achievements' AND table_schema = 'public'
ORDER BY ordinal_position;

-- ==================== 4. 测试插入功能 ====================
DO $$
DECLARE
    v_test_student_id UUID;
    v_test_tag_id UUID;
BEGIN
    RAISE NOTICE '=== 测试插入功能 ===';
    
    -- 获取第一个学生ID
    SELECT id INTO v_test_student_id FROM student_profiles LIMIT 1;
    
    IF v_test_student_id IS NOT NULL THEN
        RAISE NOTICE '找到测试学生ID: %', v_test_student_id;
        
        -- 测试插入技术标签
        BEGIN
            INSERT INTO student_technical_tags (
                student_profile_id, tag_name, tag_category, proficiency_level, learned_at
            ) VALUES (
                v_test_student_id, 'JavaScript', '编程语言', 'intermediate', CURRENT_DATE
            );
            RAISE NOTICE '✅ 成功插入测试技术标签';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ 插入技术标签失败: %', SQLERRM;
        END;
        
        -- 测试插入学习收获
        BEGIN
            INSERT INTO student_learning_achievements (
                student_profile_id, title, content, achievement_type, achieved_at
            ) VALUES (
                v_test_student_id, '测试收获', '这是一个测试学习收获', 'skill', CURRENT_DATE
            );
            RAISE NOTICE '✅ 成功插入测试学习收获';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ 插入学习收获失败: %', SQLERRM;
        END;
        
        -- 测试插入学习成果
        BEGIN
            INSERT INTO student_learning_outcomes (
                student_profile_id, outcome_title, outcome_description, outcome_type, quality_rating
            ) VALUES (
                v_test_student_id, '测试项目', '这是一个测试项目', 'project', 5
            );
            RAISE NOTICE '✅ 成功插入测试学习成果';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ 插入学习成果失败: %', SQLERRM;
        END;
        
    ELSE
        RAISE NOTICE '❌ 没有找到学生记录，无法测试插入';
    END IF;
END $$;

-- ==================== 5. 检查约束和触发器 ====================
SELECT '=== 检查触发器 ===' as info;
SELECT trigger_name, event_manipulation, action_timing, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public' AND event_object_table LIKE 'student_%'
ORDER BY trigger_name;

-- ==================== 6. 检查RLS策略 ====================
SELECT '=== 检查RLS策略 ===' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename LIKE 'student_%'
ORDER BY tablename;

SELECT '=== RLS策略详情 ===' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename LIKE 'student_%'
ORDER BY tablename, policyname;

-- ==================== 7. 显示最新数据 ====================
SELECT '=== 最新的技术标签数据 ===' as info;
SELECT stt.*, sp.full_name, sp.class_name 
FROM student_technical_tags stt
JOIN student_profiles sp ON stt.student_profile_id = sp.id
ORDER BY stt.created_at DESC
LIMIT 5;

SELECT '=== 最新的学习收获数据 ===' as info;
SELECT sla.*, sp.full_name, sp.class_name 
FROM student_learning_achievements sla
JOIN student_profiles sp ON sla.student_profile_id = sp.id
ORDER BY sla.created_at DESC
LIMIT 5;

-- ==================== 8. 检查外键约束 ====================
SELECT '=== 外键约束检查 ===' as info;
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