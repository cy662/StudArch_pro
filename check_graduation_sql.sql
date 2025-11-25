-- 检查毕业去向数据的SQL脚本

-- 1. 检查毕业去向表数据
SELECT 
    id,
    student_id,
    destination_type,
    company_name,
    school_name,
    startup_name,
    status,
    submit_time
FROM graduation_destinations
LIMIT 5;

-- 2. 检查相关学生信息
SELECT 
    gd.id as destination_id,
    gd.student_id,
    u.id as user_id,
    u.user_number,  -- 修正字段名：student_number -> user_number
    u.full_name,
    u.class_name
FROM graduation_destinations gd
LEFT JOIN users u ON gd.student_id = u.id
LIMIT 5;

-- 3. 检查表结构
-- 毕业去向表结构
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'graduation_destinations'
ORDER BY ordinal_position;

-- 用户表结构
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 4. 检查数据统计
SELECT 
    COUNT(*) as total_destinations,
    COUNT(DISTINCT student_id) as unique_students
FROM graduation_destinations;

SELECT 
    destination_type,
    COUNT(*) as count
FROM graduation_destinations
GROUP BY destination_type;

SELECT 
    status,
    COUNT(*) as count
FROM graduation_destinations
GROUP BY status;