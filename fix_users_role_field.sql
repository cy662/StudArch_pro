-- 修复users表缺失role字段的问题
-- 为users表添加role字段作为兼容字段

-- 添加role字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'student';

-- 从roles表同步role_name到role字段
UPDATE users 
SET role = r.role_name 
FROM roles r 
WHERE users.role_id = r.id;

-- 为role字段创建索引
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 验证数据
SELECT 'Users table updated with role field' as status;

-- 注意：这是一个临时解决方案
-- 理想情况下应该使用JOIN查询或重新设计数据结构
-- 但为了快速修复功能，暂时添加这个字段