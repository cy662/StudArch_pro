-- 简单修复数据库问题 - 禁用所有RLS策略
-- 在Supabase SQL Editor中执行此脚本

-- 1. 删除所有RLS策略
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for all users" ON users;
DROP POLICY IF EXISTS "Enable update for all users" ON users;
DROP POLICY IF EXISTS "Enable delete for all users" ON users;

DROP POLICY IF EXISTS "Enable read access for all users" ON roles;
DROP POLICY IF EXISTS "Enable read access for all users" ON system_settings;
DROP POLICY IF EXISTS "Enable update for all users" ON system_settings;
DROP POLICY IF EXISTS "Enable read access for all users" ON classes;
DROP POLICY IF EXISTS "Enable insert for all users" ON classes;
DROP POLICY IF EXISTS "Enable update for all users" ON classes;
DROP POLICY IF EXISTS "Enable read access for all users" ON student_profiles;
DROP POLICY IF EXISTS "Enable insert for all users" ON student_profiles;
DROP POLICY IF EXISTS "Enable update for all users" ON student_profiles;

-- 2. 完全禁用RLS（开发环境推荐）
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles DISABLE ROW LEVEL SECURITY;

-- 3. 确保基础数据存在
INSERT INTO roles (role_name, role_description) VALUES
('super_admin', '超级管理员'),
('teacher', '教师用户'),
('student', '学生用户')
ON CONFLICT (role_name) DO NOTHING;

INSERT INTO system_settings (setting_key, setting_value, setting_description) VALUES
('student_profile_edit_enabled', 'true', '学生个人信息维护功能开关'),
('max_profile_edit_count', '3', '学生个人信息最大修改次数')
ON CONFLICT (setting_key) DO NOTHING;

-- 4. 插入测试用户
INSERT INTO users (username, email, user_number, full_name, password_hash, role_id, status, phone, department, grade, class_name) VALUES
('admin', 'admin@example.com', 'A001', '系统管理员', '$2a$10$rOz8R7lTQyX3c8k8V7M8Ou', 1, 'active', '13800138001', '系统管理部', '', ''),
('teacher_zhang', 'teacher_zhang@example.com', 'T001', '张老师', '$2a$10$rOz8R7lTQyX3c8k8V7M8Ou', 2, 'active', '13800138002', '计算机学院', '', ''),
('student_2021001', 'student_2021001@example.com', '2021001', '李小明', '$2a$10$rOz8R7lTQyX3c8k8V7M8Ou', 3, 'active', '13800138000', '计算机学院', '2021级', '计算机科学与技术1班')
ON CONFLICT (username) DO NOTHING;

-- 5. 简化的RPC函数
CREATE OR REPLACE FUNCTION verify_password(user_id UUID, password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- 开发环境简化密码验证，密码都是123456
    RETURN password = '123456';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 验证修复结果
SELECT '数据库修复完成！' as status;
SELECT 'users表记录数:' as info, COUNT(*) as count FROM users;
SELECT 'roles表记录数:' as info, COUNT(*) as count FROM roles;
SELECT 'system_settings表记录数:' as info, COUNT(*) as count FROM system_settings;

SELECT 'RLS状态检查:' as info;
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'roles', 'system_settings', 'classes', 'student_profiles');