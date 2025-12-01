-- 修复student_profiles表的外键约束问题

-- 1. 检查teacher_student_relationships中的学生是否在student_profiles表中存在（通过user_id列）
SELECT '📋 关系表中但不在student_profiles表中的学生数量：' || COUNT(*) as info
FROM teacher_student_relationships tsr
LEFT JOIN student_profiles sp ON tsr.student_id = sp.user_id
WHERE tsr.teacher_id = '00000000-0000-0000-0000-000000000001'
AND sp.user_id IS NULL;

-- 2. 为缺失的学生创建student_profiles记录
INSERT INTO student_profiles (
    user_id, 
    name, 
    gender, 
    enrollment_year,
    department,
    class_info,
    created_at, 
    updated_at
)
SELECT 
    tsr.student_id,
    u.username as name,
    'unknown' as gender,
    2021 as enrollment_year,
    '计算机学院' as department,
    '计算机科学与技术1班' as class_info,
    NOW() as created_at,
    NOW() as updated_at
FROM teacher_student_relationships tsr
JOIN users u ON tsr.student_id = u.id
LEFT JOIN student_profiles sp ON tsr.student_id = sp.user_id
WHERE tsr.teacher_id = '00000000-0000-0000-0000-000000000001'
AND sp.user_id IS NULL;

-- 3. 验证创建结果
DO $$
DECLARE
    created_count INTEGER;
    total_profiles INTEGER;
BEGIN
    GET DIAGNOSTICS created_count = ROW_COUNT;
    
    SELECT COUNT(*) INTO total_profiles FROM student_profiles;
    
    RAISE NOTICE '✅ 创建了 %s 条student_profiles记录', created_count;
    RAISE NOTICE '📊 现在student_profiles表中共有 %s 条记录', total_profiles;
END $$;

-- 4. 测试插入student_training_programs记录（使用正确的student_id）
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