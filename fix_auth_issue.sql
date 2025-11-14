-- 修复学生个人信息认证和权限问题
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 查看当前RLS策略
SELECT tablename, schemaname, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'student_profiles';

-- 2. 查看现有的RLS策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'student_profiles';

-- 3. 删除可能存在的限制性策略
DROP POLICY IF EXISTS "student_profiles_anon_insert" ON student_profiles;
DROP POLICY IF EXISTS "student_profiles_anon_update" ON student_profiles;
DROP POLICY IF EXISTS "student_profiles_anon_select" ON student_profiles;

-- 4. 创建允许匿名访问的策略（仅用于测试和开发）
CREATE POLICY "student_profiles_anon_insert" ON student_profiles
FOR INSERT WITH CHECK (true);

CREATE POLICY "student_profiles_anon_update" ON student_profiles
FOR UPDATE USING (true);

CREATE POLICY "student_profiles_anon_select" ON student_profiles
FOR SELECT USING (true);

-- 5. 验证策略已创建
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'student_profiles';

-- 6. 测试匿名访问是否正常工作
-- 请在前端应用中重新测试保存功能

-- 注意：在生产环境中，应该使用更严格的认证策略，而不是允许匿名访问