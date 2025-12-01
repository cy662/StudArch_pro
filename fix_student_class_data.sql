-- 修复学生班级数据脚本
-- 确保学生有正确的班级信息

-- 1. 创建基础班级数据
INSERT INTO classes (class_name, class_code, grade, department) VALUES
('计算机科学与技术1班', 'CS202101', '2021级', '计算机学院'),
('计算机科学与技术2班', 'CS202102', '2021级', '计算机学院'),
('计算机科学与技术3班', 'CS202103', '2021级', '计算机学院'),
('软件工程1班', 'SE202101', '2021级', '软件学院'),
('软件工程2班', 'SE202102', '2021级', '软件学院'),
('数据科学1班', 'DS202101', '2021级', '数据科学学院'),
('人工智能1班', 'AI202101', '2021级', '人工智能学院'),
('网络工程1班', 'NE202101', '2021级', '网络空间安全学院')
ON CONFLICT (class_name) DO NOTHING;

-- 2. 为学生创建档案记录（如果不存在）
DO $$
DECLARE
    v_user_id UUID;
    v_class_name VARCHAR;
    v_class_id UUID;
    v_profile_count INTEGER := 0;
BEGIN
    -- 为每个学生用户创建档案记录
    FOR v_user_id, v_class_name IN 
        SELECT id, COALESCE(class_name, '计算机科学与技术1班') 
        FROM users 
        WHERE role_id = '3' 
        AND status = 'active'
        AND id NOT IN (SELECT user_id FROM student_profiles)
    LOOP
        -- 根据班级名称获取班级ID
        SELECT id INTO v_class_id 
        FROM classes 
        WHERE class_name = v_class_name 
        LIMIT 1;
        
        -- 如果找不到班级ID，使用默认班级
        IF v_class_id IS NULL THEN
            SELECT id INTO v_class_id 
            FROM classes 
            WHERE class_name = '计算机科学与技术1班' 
            LIMIT 1;
        END IF;
        
        -- 插入学生档案记录
        INSERT INTO student_profiles (
            user_id,
            class_id,
            class_name,
            profile_status,
            edit_count
        ) VALUES (
            v_user_id,
            v_class_id,
            v_class_name,
            'approved',
            0
        );
        
        v_profile_count := v_profile_count + 1;
    END LOOP;
    
    RAISE NOTICE '为学生创建了 % 个档案记录', v_profile_count;
END $$;

-- 3. 更新用户表中的班级信息（基于学号推断）
UPDATE users 
SET class_name = CASE
    WHEN user_number LIKE '2021%' THEN 
        CASE
            WHEN SUBSTRING(user_number, 9, 1) = '1' THEN '计算机科学与技术1班'
            WHEN SUBSTRING(user_number, 9, 1) = '2' THEN '计算机科学与技术2班'
            WHEN SUBSTRING(user_number, 9, 1) = '3' THEN '计算机科学与技术3班'
            WHEN SUBSTRING(user_number, 9, 1) = '4' THEN '软件工程1班'
            WHEN SUBSTRING(user_number, 9, 1) = '5' THEN '软件工程2班'
            WHEN SUBSTRING(user_number, 9, 1) = '6' THEN '数据科学1班'
            WHEN SUBSTRING(user_number, 9, 1) = '7' THEN '人工智能1班'
            WHEN SUBSTRING(user_number, 9, 1) = '8' THEN '网络工程1班'
            ELSE '计算机科学与技术1班'
        END
    ELSE '计算机科学与技术1班'
END,
grade = CASE
    WHEN user_number LIKE '2021%' THEN '2021级'
    WHEN user_number LIKE '2022%' THEN '2022级'
    WHEN user_number LIKE '2023%' THEN '2023级'
    WHEN user_number LIKE '2024%' THEN '2024级'
    ELSE '2021级'
END,
department = CASE
    WHEN SUBSTRING(user_number, 9, 1) IN ('1', '2', '3') THEN '计算机学院'
    WHEN SUBSTRING(user_number, 9, 1) IN ('4', '5') THEN '软件学院'
    WHEN SUBSTRING(user_number, 9, 1) = '6' THEN '数据科学学院'
    WHEN SUBSTRING(user_number, 9, 1) = '7' THEN '人工智能学院'
    WHEN SUBSTRING(user_number, 9, 1) = '8' THEN '网络空间安全学院'
    ELSE '计算机学院'
END
WHERE role_id = '3' 
AND (class_name IS NULL OR class_name = '');

-- 4. 同步更新student_profiles中的班级信息
UPDATE student_profiles sp
SET 
    class_name = u.class_name,
    class_id = c.id
FROM users u
LEFT JOIN classes c ON c.class_name = u.class_name
WHERE sp.user_id = u.id
AND u.role_id = '3';

-- 5. 创建一些示例师生关联关系（如果不存在）
DO $$
DECLARE
    v_teacher_id UUID;
    v_student_count INTEGER := 0;
BEGIN
    -- 获取第一个教师ID
    SELECT id INTO v_teacher_id 
    FROM users 
    WHERE role_id = '2' 
    AND status = 'active'
    LIMIT 1;
    
    IF v_teacher_id IS NOT NULL THEN
        -- 为教师分配前10个学生
        INSERT INTO teacher_students (teacher_id, student_id, created_by)
        SELECT v_teacher_id, u.id, v_teacher_id
        FROM users u
        WHERE u.role_id = '3'
        AND u.status = 'active'
        AND u.id NOT IN (
            SELECT student_id 
            FROM teacher_students 
            WHERE teacher_id = v_teacher_id
        )
        LIMIT 10
        ON CONFLICT (teacher_id, student_id) DO NOTHING;
        
        GET DIAGNOSTICS v_student_count = ROW_COUNT;
        RAISE NOTICE '为教师分配了 % 个学生', v_student_count;
    END IF;
END $$;

-- 6. 验证数据修复结果
DO $$
DECLARE
    v_total_students INTEGER;
    v_students_with_class INTEGER;
    v_students_with_profile INTEGER;
    v_teacher_relations INTEGER;
BEGIN
    -- 统计学生数量
    SELECT COUNT(*) INTO v_total_students
    FROM users 
    WHERE role_id = '3' 
    AND status = 'active';
    
    -- 统计有班级信息的学生数量
    SELECT COUNT(*) INTO v_students_with_class
    FROM users 
    WHERE role_id = '3' 
    AND status = 'active'
    AND class_name IS NOT NULL 
    AND class_name != '';
    
    -- 统计有档案记录的学生数量
    SELECT COUNT(*) INTO v_students_with_profile
    FROM student_profiles sp
    JOIN users u ON sp.user_id = u.id
    WHERE u.role_id = '3' 
    AND u.status = 'active';
    
    -- 统计师生关联数量
    SELECT COUNT(*) INTO v_teacher_relations
    FROM teacher_students;
    
    RAISE NOTICE '=== 数据修复结果 ===';
    RAISE NOTICE '学生总数: %', v_total_students;
    RAISE NOTICE '有班级信息的学生: %', v_students_with_class;
    RAISE NOTICE '有档案记录的学生: %', v_students_with_profile;
    RAISE NOTICE '师生关联数量: %', v_teacher_relations;
    RAISE NOTICE '=== 修复完成 ===';
    
    IF v_students_with_class = v_total_students AND v_students_with_profile = v_total_students THEN
        RAISE NOTICE '✅ 所有学生都有正确的班级和档案信息';
    ELSE
        RAISE NOTICE '⚠️  仍有部分学生缺少班级或档案信息';
    END IF;
END $$;