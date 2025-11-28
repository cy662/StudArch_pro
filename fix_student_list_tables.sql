-- 修复学生列表显示问题
-- 添加缺失的字段

-- 1. 为users表添加role字段（如果不存在）
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';

-- 2. 为student_profiles表添加status字段（如果不存在）  
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- 3. 更新现有数据 - 设置学生用户的role
UPDATE users 
SET role = 'student' 
WHERE id IN (SELECT DISTINCT user_id FROM student_profiles);

-- 4. 更新学生档案的status字段
UPDATE student_profiles 
SET status = 'active' 
WHERE status IS NULL OR status = '';

-- 5. 显示修复结果
SELECT 'users表字段修复完成' as message;
SELECT COUNT(*) as student_users FROM users WHERE role = 'student';
SELECT COUNT(*) as active_profiles FROM student_profiles WHERE status = 'active';