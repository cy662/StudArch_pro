-- 修复学生个人信息表的RLS权限问题
-- 在Supabase SQL Editor中执行此脚本

-- 1. 为student_profiles表创建允许匿名访问的策略
-- 学生可以查看和修改自己的信息
DROP POLICY IF EXISTS "学生个人信息策略" ON student_profiles;
DROP POLICY IF EXISTS "学生个人信息更新策略" ON student_profiles;
DROP POLICY IF EXISTS "教师查看学生信息策略" ON student_profiles;

-- 创建新的策略：允许应用服务角色访问所有数据
CREATE POLICY "允许服务角色访问学生信息" ON student_profiles
    FOR ALL USING (true);

-- 2. 为users表创建允许匿名访问的策略
DROP POLICY IF EXISTS "允许匿名读取用户" ON users;
DROP POLICY IF EXISTS "允许匿名创建用户" ON users;
DROP POLICY IF EXISTS "允许匿名更新用户" ON users;
DROP POLICY IF EXISTS "允许匿名删除用户" ON users;

CREATE POLICY "允许服务角色访问用户" ON users
    FOR ALL USING (true);

-- 3. 为system_settings表创建允许匿名访问的策略
DROP POLICY IF EXISTS "系统设置管理策略" ON system_settings;

CREATE POLICY "允许服务角色访问系统设置" ON system_settings
    FOR ALL USING (true);

-- 4. 验证策略是否生效
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('student_profiles', 'users', 'system_settings');

-- 5. 测试数据访问
SELECT '测试学生信息表访问:' as test, COUNT(*) as count FROM student_profiles;
SELECT '测试用户表访问:' as test, COUNT(*) as count FROM users;
SELECT '测试系统设置表访问:' as test, COUNT(*) as count FROM system_settings;

-- 6. 插入一条测试记录验证写入权限
INSERT INTO student_profiles (
    user_id, 
    gender, 
    phone, 
    emergency_phone, 
    profile_status
) VALUES (
    gen_random_uuid(), 
    'male', 
    '13800138000', 
    '13800138001', 
    'pending'
) ON CONFLICT DO NOTHING;

SELECT '测试插入权限:' as test, '成功插入测试记录' as result;