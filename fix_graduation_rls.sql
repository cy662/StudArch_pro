-- 修复毕业去向管理的RLS策略
-- 在Supabase SQL Editor中执行此脚本

-- 1. 删除可能存在的冲突策略
DROP POLICY IF EXISTS "Teachers can view all graduation destinations" ON graduation_destinations;
DROP POLICY IF EXISTS "Students can view own graduation destination" ON graduation_destinations;
DROP POLICY IF EXISTS "Students can insert own graduation destination" ON graduation_destinations;
DROP POLICY IF EXISTS "Students can update own graduation destination" ON graduation_destinations;
DROP POLICY IF EXISTS "Teachers can update all graduation destinations" ON graduation_destinations;

-- 2. 创建正确的毕业去向表RLS策略
-- 教师可以查看所有学生的毕业去向
CREATE POLICY "Teachers can view all graduation destinations" ON graduation_destinations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = auth.uid() 
            AND r.role_name = 'teacher'
        )
    );

-- 学生只能查看自己的毕业去向
CREATE POLICY "Students can view own graduation destination" ON graduation_destinations
    FOR SELECT USING (student_id = auth.uid());

-- 学生可以插入/更新自己的毕业去向
CREATE POLICY "Students can insert own graduation destination" ON graduation_destinations
    FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update own graduation destination" ON graduation_destinations
    FOR UPDATE USING (student_id = auth.uid());

-- 教师可以更新所有学生的毕业去向（包括审核）
CREATE POLICY "Teachers can update all graduation destinations" ON graduation_destinations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = auth.uid() 
            AND r.role_name = 'teacher'
        )
    );

-- 3. 删除users表上可能限制教师查询的策略
DROP POLICY IF EXISTS "教师可查看学生" ON users;
DROP POLICY IF EXISTS "用户可查看自己" ON users;
DROP POLICY IF EXISTS "超级管理员可访问所有用户" ON users;

-- 4. 创建允许教师查询学生信息的策略
-- 教师可以查看所有学生用户
CREATE POLICY "Teachers can view all students" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = auth.uid() 
            AND r.role_name = 'teacher'
        )
        AND role_id = (SELECT id FROM roles WHERE role_name = 'student')
    );

-- 用户可以查看自己的信息
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (id = auth.uid());

-- 超级管理员可以查看所有用户
CREATE POLICY "Super admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = auth.uid() 
            AND r.role_name = 'super_admin'
        )
    );

-- 5. 验证策略
SELECT 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('graduation_destinations', 'users')
ORDER BY tablename, policyname;