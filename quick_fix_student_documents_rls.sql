-- 快速修复：临时禁用 student_documents 表的 RLS（仅用于开发环境）
-- ⚠️ 警告：此操作会禁用行级安全，仅用于开发和测试环境！

-- 临时禁用 RLS
ALTER TABLE student_documents DISABLE ROW LEVEL SECURITY;

-- 验证 RLS 已禁用
SELECT 
    tablename, 
    rowsecurity as rls_enabled,
    'RLS已禁用，现在可以插入文档' as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'student_documents';

