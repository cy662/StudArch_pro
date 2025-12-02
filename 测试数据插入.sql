-- 测试数据插入脚本
-- 用于验证数据库保存功能是否正常

-- ==================== 1. 确保有测试学生数据 ====================
DO $$
DECLARE
    v_test_user_id UUID;
    v_test_profile_id UUID;
    v_student_count INTEGER;
BEGIN
    -- 检查是否已有学生数据
    SELECT COUNT(*) INTO v_student_count FROM student_profiles;
    
    IF v_student_count = 0 THEN
        -- 创建测试用户（如果不存在）
        INSERT INTO users (username, email, full_name, password_hash, role_id)
        VALUES (
            'test_student',
            'test@example.com',
            '测试学生',
            'hashed_password',
            (SELECT id FROM roles WHERE role_name = 'student' LIMIT 1)
        )
        ON CONFLICT (username) DO NOTHING
        RETURNING id INTO v_test_user_id;
        
        -- 如果用户已存在，获取其ID
        IF v_test_user_id IS NULL THEN
            SELECT id INTO v_test_user_id FROM users WHERE username = 'test_student';
        END IF;
        
        -- 创建测试学生profile
        INSERT INTO student_profiles (
            user_id,
            student_number,
            full_name,
            class_name
        ) VALUES (
            v_test_user_id,
            'TEST2024001',
            '测试学生',
            '计算机科学与技术1班'
        )
        RETURNING id INTO v_test_profile_id;
        
        RAISE NOTICE '✅ 创建测试学生数据，profile_id: %', v_test_profile_id;
    ELSE
        -- 获取第一个学生profile_id
        SELECT id INTO v_test_profile_id FROM student_profiles LIMIT 1;
        RAISE NOTICE '✅ 使用现有学生数据，profile_id: %', v_test_profile_id;
    END IF;
END $$;

-- ==================== 2. 插入测试技术标签 ====================
DO $$
DECLARE
    v_test_profile_id UUID;
BEGIN
    SELECT id INTO v_test_profile_id FROM student_profiles LIMIT 1;
    
    IF v_test_profile_id IS NOT NULL THEN
        -- 删除旧的测试数据
        DELETE FROM student_technical_tags 
        WHERE student_profile_id = v_test_profile_id 
        AND tag_name LIKE '测试%';
        
        -- 插入新的测试技术标签
        INSERT INTO student_technical_tags (
            student_profile_id, tag_name, tag_category, proficiency_level, 
            learned_at, learning_hours, confidence_score, description
        ) VALUES 
        (v_test_profile_id, '测试JavaScript', '编程语言', 'intermediate', 
         CURRENT_DATE - INTERVAL '30 days', 20, 7, '学习了JavaScript基础语法'),
        (v_test_profile_id, '测试React', '前端框架', 'intermediate', 
         CURRENT_DATE - INTERVAL '20 days', 15, 6, '学习了React框架开发'),
        (v_test_profile_id, '测试Node.js', '后端框架', 'beginner', 
         CURRENT_DATE - INTERVAL '10 days', 10, 4, '开始学习Node.js');
        
        RAISE NOTICE '✅ 插入3个测试技术标签';
    END IF;
END $$;

-- ==================== 3. 插入测试学习收获 ====================
DO $$
DECLARE
    v_test_profile_id UUID;
BEGIN
    SELECT id INTO v_test_profile_id FROM student_profiles LIMIT 1;
    
    IF v_test_profile_id IS NOT NULL THEN
        -- 删除旧的测试数据
        DELETE FROM student_learning_achievements 
        WHERE student_profile_id = v_test_profile_id 
        AND title LIKE '测试%';
        
        -- 插入新的测试学习收获
        INSERT INTO student_learning_achievements (
            student_profile_id, title, content, achievement_type,
            achieved_at, impact_level, application_scenarios
        ) VALUES 
        (v_test_profile_id, '测试JavaScript学习收获', 
         '通过学习JavaScript，掌握了前端开发的基础技能，能够开发简单的交互页面', 
         'skill', CURRENT_DATE - INTERVAL '25 days', 'medium',
         '可用于个人项目开发和前端页面开发'),
        (v_test_profile_id, '测试项目实战经验', 
         '通过参与实际项目，提升了代码组织和团队协作能力', 
         'experience', CURRENT_DATE - INTERVAL '15 days', 'high',
         '可应用到未来的软件开发工作中');
        
        RAISE NOTICE '✅ 插入2个测试学习收获';
    END IF;
END $$;

-- ==================== 4. 插入测试学习成果 ====================
DO $$
DECLARE
    v_test_profile_id UUID;
BEGIN
    SELECT id INTO v_test_profile_id FROM student_profiles LIMIT 1;
    
    IF v_test_profile_id IS NOT NULL THEN
        -- 删除旧的测试数据
        DELETE FROM student_learning_outcomes 
        WHERE student_profile_id = v_test_profile_id 
        AND outcome_title LIKE '测试%';
        
        -- 插入新的测试学习成果
        INSERT INTO student_learning_outcomes (
            student_profile_id, outcome_title, outcome_description, outcome_type,
            domain, difficulty_level, start_date, completion_date,
            quality_rating, innovation_score, practical_value, github_url
        ) VALUES 
        (v_test_profile_id, '测试个人网站项目', 
         '使用React和Node.js开发的个人博客网站，具有文章发布、评论等功能', 
         'project', 'Web开发', 'basic',
         CURRENT_DATE - INTERVAL '40 days', CURRENT_DATE - INTERVAL '20 days',
         4, 3, 4, 'https://github.com/test/personal-blog'),
        (v_test_profile_id, '测试算法竞赛获奖', 
         '在校园编程竞赛中获得三等奖，解决了3道算法题', 
         'competition', '算法', 'medium',
         CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '30 days',
         4, 4, 3, NULL);
        
        RAISE NOTICE '✅ 插入2个测试学习成果';
    END IF;
END $$;

-- ==================== 5. 插入测试证明材料 ====================
DO $$
DECLARE
    v_test_profile_id UUID;
BEGIN
    SELECT id INTO v_test_profile_id FROM student_profiles LIMIT 1;
    
    IF v_test_profile_id IS NOT NULL THEN
        -- 删除旧的测试数据
        DELETE FROM student_proof_materials 
        WHERE student_profile_id = v_test_profile_id 
        AND material_name LIKE '测试%';
        
        -- 插入新的测试证明材料
        INSERT INTO student_proof_materials (
            student_profile_id, material_name, material_type,
            file_name, file_path, file_size, file_type,
            issuing_authority, issue_date, verification_status
        ) VALUES 
        (v_test_profile_id, '测试JavaScript证书', 'certificate',
         'javascript_certificate.pdf', '/uploads/certificates/js_cert.pdf', 
         1024000, 'application/pdf', '在线教育平台', 
         CURRENT_DATE - INTERVAL '20 days', 'verified'),
        (v_test_profile_id, '测试编程竞赛证书', 'award',
         'programming_competition.pdf', '/uploads/awards/competition.pdf',
         512000, 'application/pdf', '学校教务处',
         CURRENT_DATE - INTERVAL '10 days', 'pending');
        
        RAISE NOTICE '✅ 插入2个测试证明材料';
    END IF;
END $$;

-- ==================== 6. 验证测试数据 ====================
SELECT '=== 验证测试数据插入结果 ===' as info;

SELECT '技术标签数据：' as section;
SELECT stt.*, sp.full_name as student_name, sp.class_name 
FROM student_technical_tags stt
JOIN student_profiles sp ON stt.student_profile_id = sp.id
WHERE stt.tag_name LIKE '测试%'
ORDER BY stt.created_at DESC;

SELECT '学习收获数据：' as section;
SELECT sla.*, sp.full_name as student_name, sp.class_name 
FROM student_learning_achievements sla
JOIN student_profiles sp ON sla.student_profile_id = sp.id
WHERE sla.title LIKE '测试%'
ORDER BY sla.created_at DESC;

SELECT '学习成果数据：' as section;
SELECT slo.*, sp.full_name as student_name, sp.class_name 
FROM student_learning_outcomes slo
JOIN student_profiles sp ON slo.student_profile_id = sp.id
WHERE slo.outcome_title LIKE '测试%'
ORDER BY slo.created_at DESC;

SELECT '证明材料数据：' as section;
SELECT spm.*, sp.full_name as student_name, sp.class_name 
FROM student_proof_materials spm
JOIN student_profiles sp ON spm.student_profile_id = sp.id
WHERE spm.material_name LIKE '测试%'
ORDER BY spm.created_at DESC;

-- ==================== 7. 显示统计信息 ====================
SELECT '=== 数据统计 ===' as info;
SELECT 
    '技术标签' as type, COUNT(*) as count
FROM student_technical_tags WHERE tag_name LIKE '测试%'
UNION ALL
SELECT 
    '学习收获' as type, COUNT(*) as count
FROM student_learning_achievements WHERE title LIKE '测试%'
UNION ALL
SELECT 
    '学习成果' as type, COUNT(*) as count
FROM student_learning_outcomes WHERE outcome_title LIKE '测试%'
UNION ALL
SELECT 
    '证明材料' as type, COUNT(*) as count
FROM student_proof_materials WHERE material_name LIKE '测试%';

RAISE NOTICE '=== 测试数据插入完成 ===';
RAISE NOTICE '如果看到测试数据，说明数据库保存功能正常';
RAISE NOTICE '如果前端仍然无法保存数据，请检查前端API调用逻辑';