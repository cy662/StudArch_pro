-- 强制创建和验证student_profiles记录（修复语法错误）

-- 1. 先删除可能存在的记录，然后重新创建
DELETE FROM student_profiles WHERE user_id = 'db888c86-eb18-4c5d-819a-d59f0d223adc';

-- 2. 重新创建记录，确保所有必填字段都有值
INSERT INTO student_profiles (
    id,  -- 添加id字段，使用与user_id相同的值
    user_id, 
    gender,
    admission_date,
    department,
    class_info,
    enrollment_year,
    profile_status,
    created_at, 
    updated_at
) VALUES (
    'db888c86-eb18-4c5d-819a-d59f0d223adc',  -- id
    'db888c86-eb18-4c5d-819a-d59f0d223adc',  -- user_id
    'unknown',  -- gender
    CURRENT_DATE,  -- admission_date
    '计算机学院',  -- department
    '计算机科学与技术1班',  -- class_info
    2021,  -- enrollment_year
    'active',  -- profile_status
    NOW(),  -- created_at
    NOW()   -- updated_at
);

-- 3. 验证记录创建
SELECT '✅ 记录创建验证：' || COUNT(*) as result 
FROM student_profiles 
WHERE user_id = 'db888c86-eb18-4c5d-819a-d59f0d223adc';

-- 4. 显示该记录的详细信息
SELECT 
    id, 
    user_id, 
    profile_status, 
    department, 
    created_at
FROM student_profiles 
WHERE user_id = 'db888c86-eb18-4c5d-819a-d59f0d223adc';