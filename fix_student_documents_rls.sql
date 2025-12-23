-- 修复学生文档表的RLS权限问题
-- 在Supabase SQL Editor中执行此脚本

-- 1. 检查表是否存在
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'student_documents';

-- 2. 删除可能存在的旧策略
DROP POLICY IF EXISTS "Students can view own documents" ON student_documents;
DROP POLICY IF EXISTS "Students can insert own documents" ON student_documents;
DROP POLICY IF EXISTS "Students can update own documents" ON student_documents;
DROP POLICY IF EXISTS "Students can delete own documents" ON student_documents;
DROP POLICY IF EXISTS "Teachers can view all documents" ON student_documents;
DROP POLICY IF EXISTS "Allow authenticated users to manage documents" ON student_documents;

-- 3. 确保RLS已启用
ALTER TABLE student_documents ENABLE ROW LEVEL SECURITY;

-- 4. 创建策略：学生可以查看自己的文档
CREATE POLICY "Students can view own documents" ON student_documents
    FOR SELECT 
    USING (user_id::text = auth.uid()::text);

-- 5. 创建策略：学生可以插入自己的文档
CREATE POLICY "Students can insert own documents" ON student_documents
    FOR INSERT 
    WITH CHECK (user_id::text = auth.uid()::text);

-- 6. 创建策略：学生可以更新自己的文档
CREATE POLICY "Students can update own documents" ON student_documents
    FOR UPDATE 
    USING (user_id::text = auth.uid()::text)
    WITH CHECK (user_id::text = auth.uid()::text);

-- 7. 创建策略：学生可以删除自己的文档（软删除）
CREATE POLICY "Students can delete own documents" ON student_documents
    FOR DELETE 
    USING (user_id::text = auth.uid()::text);

-- 8. （可选）创建策略：教师可以查看所有学生的文档
-- 如果需要教师查看功能，取消下面的注释
/*
CREATE POLICY "Teachers can view all documents" ON student_documents
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND (users.role = 'teacher' OR users.role_id = (SELECT id FROM roles WHERE role_name = 'teacher'))
        )
    );
*/

-- 9. 验证策略已创建
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'student_documents';

-- 10. 测试：检查当前用户是否可以插入文档
-- 注意：这需要在有认证用户的情况下执行
SELECT 
    'RLS策略已配置完成' as status,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'student_documents';

