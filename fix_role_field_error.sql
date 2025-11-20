-- 修复 users.role 字段查询错误
-- 解决 "column role does not exist" 的问题

-- 步骤1: 检查当前表结构
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 步骤2: 如果role字段不存在，则添加它
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(20);
        RAISE NOTICE '已添加role字段到users表';
    ELSE
        RAISE NOTICE 'role字段已存在';
    END IF;
END $$;

-- 步骤3: 如果存在role_id字段，同步数据到role字段
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'role_id'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'roles' 
        AND column_name = 'role_name'
    ) THEN
        -- 从roles表同步角色名称
        UPDATE users SET role = (
            SELECT r.role_name 
            FROM roles r 
            WHERE r.id = users.role_id
        ) WHERE role_id IS NOT NULL;
        
        -- 为没有role_id的用户设置默认角色
        UPDATE users SET role = 'student' WHERE role IS NULL;
        
        RAISE NOTICE '已从roles表同步角色数据到role字段';
    ELSE
        -- 如果没有roles表，设置默认角色
        UPDATE users SET role = 'student' WHERE role IS NULL;
        RAISE NOTICE '已设置默认角色为student';
    END IF;
END $$;

-- 步骤4: 验证修复结果
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN role IS NOT NULL THEN 1 END) as users_with_role,
    COUNT(CASE WHEN role = 'student' THEN 1 END) as student_users,
    COUNT(CASE WHEN role = 'teacher' THEN 1 END) as teacher_users,
    COUNT(CASE WHEN role = 'super_admin' THEN 1 END) as admin_users
FROM users;

-- 步骤5: 显示用户角色分布
SELECT role, COUNT(*) as count 
FROM users 
WHERE role IS NOT NULL 
GROUP BY role 
ORDER BY count DESC;

SELECT 'role字段修复完成！' as status;