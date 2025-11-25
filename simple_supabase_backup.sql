-- ==========================================
-- Supabase 简化版数据库备份脚本
-- 在Supabase SQL Editor中运行此脚本以查看数据库结构和数据
-- ==========================================

-- ==================== 数据库信息 ====================
SELECT 
    '备份时间: ' || NOW() AS backup_time,
    '数据库名称: ' || CURRENT_DATABASE() AS database_name,
    '当前用户: ' || CURRENT_USER AS current_user;

-- ==================== 表清单 ====================
SELECT '==================== 表清单 ====================' AS section;

SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ==================== roles 表 ====================
SELECT '==================== roles 表 ====================' AS section;

-- 表结构
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'roles'
ORDER BY ordinal_position;

-- 表数据统计
SELECT 'roles表记录数: ' || COUNT(*) AS record_count FROM roles;

-- 表数据预览（前5条）
SELECT * FROM roles LIMIT 5;

-- ==================== users 表 ====================
SELECT '==================== users 表 ====================' AS section;

-- 表结构
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- 表数据统计
SELECT 'users表记录数: ' || COUNT(*) AS record_count FROM users;

-- 表数据预览（前5条）
SELECT * FROM users LIMIT 5;

-- ==================== system_settings 表 ====================
SELECT '==================== system_settings 表 ====================' AS section;

-- 表结构
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'system_settings'
ORDER BY ordinal_position;

-- 表数据统计
SELECT 'system_settings表记录数: ' || COUNT(*) AS record_count FROM system_settings;

-- 表数据预览（前5条）
SELECT * FROM system_settings LIMIT 5;

-- ==================== classes 表 ====================
SELECT '==================== classes 表 ====================' AS section;

-- 表结构
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'classes'
ORDER BY ordinal_position;

-- 表数据统计
SELECT 'classes表记录数: ' || COUNT(*) AS record_count FROM classes;

-- 表数据预览（前5条）
SELECT * FROM classes LIMIT 5;

-- ==================== student_profiles 表 ====================
SELECT '==================== student_profiles 表 ====================' AS section;

-- 表结构
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'student_profiles'
ORDER BY ordinal_position;

-- 表数据统计
SELECT 'student_profiles表记录数: ' || COUNT(*) AS record_count FROM student_profiles;

-- 表数据预览（前5条）
SELECT * FROM student_profiles LIMIT 5;

-- ==================== 索引信息 ====================
SELECT '==================== 索引信息 ====================' AS section;

SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ==================== 外键约束 ====================
SELECT '==================== 外键约束 ====================' AS section;

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
AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- ==================== 总结 ====================
SELECT '==================== 总结 ====================' AS section;

SELECT '总表数: ' || COUNT(*) AS total_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

SELECT 
    'roles表记录数: ' || (SELECT COUNT(*) FROM roles) AS roles_count,
    'users表记录数: ' || (SELECT COUNT(*) FROM users) AS users_count,
    'system_settings表记录数: ' || (SELECT COUNT(*) FROM system_settings) AS settings_count,
    'classes表记录数: ' || (SELECT COUNT(*) FROM classes) AS classes_count,
    'student_profiles表记录数: ' || (SELECT COUNT(*) FROM student_profiles) AS profiles_count;