-- 为学生文档表添加文件夹名称字段，用于学生自定义归类文件
-- 在 Supabase SQL Editor 中执行本脚本

ALTER TABLE student_documents
ADD COLUMN IF NOT EXISTS folder_name TEXT;

-- 可选：为常用查询创建索引
CREATE INDEX IF NOT EXISTS idx_student_documents_folder_name
ON student_documents(user_id, folder_name);


