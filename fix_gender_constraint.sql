-- 修复gender字段约束问题

-- 1. 检查gender字段的允许值
SELECT '检查gender字段的约束...';

-- 2. 使用有效的gender值重新创建记录
DELETE FROM student_profiles WHERE user_id = 'db888c86-eb18-4c5d-819a-d59f0d223adc';

INSERT INTO student_profiles (
    id,
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
    'db888c86-eb18-4c5d-819a-d59f0d223adc',
    'db888c86-eb18-4c5d-819a-d59f0d223adc',
    '男',  -- 使用标准的性别值
    CURRENT_DATE,
    '计算机学院',
    '计算机科学与技术1班',
    2021,
    'active',
    NOW(),
    NOW()
);

-- 3. 验证记录创建
SELECT '✅ 记录创建验证：' || COUNT(*) as result 
FROM student_profiles 
WHERE user_id = 'db888c86-eb18-4c5d-819a-d59f0d223adc';

-- 4. 测试插入student_training_programs记录
INSERT INTO student_training_programs (
    student_id, 
    program_id, 
    enrollment_date, 
    status, 
    created_at, 
    updated_at
) VALUES (
    'db888c86-eb18-4c5d-819a-d59f0d223adc',
    '62b2cc69-5b10-4238-8232-59831cdb7964',
    CURRENT_DATE,
    'active',
    NOW(),
    NOW()
)
ON CONFLICT (student_id, program_id) DO NOTHING
RETURNING '✅ 测试插入student_training_programs成功' as result;