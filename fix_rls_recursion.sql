-- 修复RLS策略递归问题
-- 在Supabase SQL Editor中执行此脚本

-- 1. 先删除所有有问题的RLS策略
DROP POLICY IF EXISTS "允许所有人读取用户" ON users;
DROP POLICY IF EXISTS "允许所有人创建用户" ON users;
DROP POLICY IF EXISTS "允许所有人更新用户" ON users;
DROP POLICY IF EXISTS "允许所有人删除用户" ON users;

DROP POLICY IF EXISTS "允许所有人读取角色" ON roles;
DROP POLICY IF EXISTS "允许所有人读取系统设置" ON system_settings;
DROP POLICY IF EXISTS "允许所有人更新系统设置" ON system_settings;
DROP POLICY IF EXISTS "允许所有人读取班级" ON classes;
DROP POLICY IF EXISTS "允许所有人创建班级" ON classes;
DROP POLICY IF EXISTS "允许所有人更新班级" ON classes;

DROP POLICY IF EXISTS "允许所有人读取学生信息" ON student_profiles;
DROP POLICY IF EXISTS "允许所有人创建学生信息" ON student_profiles;
DROP POLICY IF EXISTS "允许所有人更新学生信息" ON student_profiles;

-- 2. 临时禁用RLS（开发环境推荐）
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles DISABLE ROW LEVEL SECURITY;

-- 3. 重新创建简化的RLS策略（如果需要的话）

-- 为roles表创建简单策略
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON roles FOR SELECT USING (true);

-- 为users表创建简单策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON users FOR UPDATE USING (true);

-- 为system_settings表创建简单策略
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON system_settings FOR SELECT USING (true);
CREATE POLICY "Enable update for all users" ON system_settings FOR UPDATE USING (true);

-- 为classes表创建简单策略
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON classes FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON classes FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON classes FOR UPDATE USING (true);

-- 为student_profiles表创建简单策略
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON student_profiles FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON student_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON student_profiles FOR UPDATE USING (true);

-- 4. 验证策略配置
SELECT 'RLS策略修复完成' as status;
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- 5. 测试数据访问
SELECT '测试用户表访问:' as test, COUNT(*) as count FROM users;
SELECT '测试角色表访问:' as test, COUNT(*) as count FROM roles;
SELECT '测试系统设置表访问:' as test, COUNT(*) as count FROM system_settings;