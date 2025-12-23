-- 修复技术标签和毕业去向的RLS权限问题
-- 执行这个脚本来禁用相关表的RLS策略

-- 1. 禁用student_learning_summary表的RLS
ALTER TABLE student_learning_summary DISABLE ROW LEVEL SECURITY;

-- 2. 禁用graduation_destinations表的RLS  
ALTER TABLE graduation_destinations DISABLE ROW LEVEL SECURITY;

-- 3. 禁用student_technical_tags表的RLS
ALTER TABLE student_technical_tags DISABLE ROW LEVEL SECURITY;

-- 4. 禁用reward_punishments表的RLS
ALTER TABLE reward_punishments DISABLE ROW LEVEL SECURITY;

-- 显示执行结果
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN (
    'student_learning_summary', 
    'graduation_destinations', 
    'student_technical_tags',
    'reward_punishments'
);

-- 提示信息
SELECT '✅ 技术标签相关表的RLS已禁用，教师端现在可以正常查看学生数据' as status;