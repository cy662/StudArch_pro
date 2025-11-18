-- 快速初始化你的Supabase数据库
-- 在Supabase SQL Editor中按顺序执行以下脚本

-- ==================== 第一步：创建基础表结构 ====================

-- 1. 角色表
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    role_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE,
    user_number VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    phone VARCHAR(20),
    department VARCHAR(100),
    grade VARCHAR(20),
    class_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 系统设置表
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    setting_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 班级表
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_name VARCHAR(100) NOT NULL UNIQUE,
    grade VARCHAR(20) NOT NULL,
    department VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 学生个人信息表
CREATE TABLE IF NOT EXISTS student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    birth_date DATE,
    id_card VARCHAR(20),
    nationality VARCHAR(50),
    political_status VARCHAR(20),
    phone VARCHAR(20),
    emergency_contact VARCHAR(50),
    emergency_phone VARCHAR(20),
    home_address TEXT,
    admission_date DATE,
    graduation_date DATE,
    student_type VARCHAR(20) DEFAULT '全日制',
    profile_status VARCHAR(20) DEFAULT 'incomplete' CHECK (profile_status IN ('incomplete', 'pending', 'approved', 'rejected')),
    edit_count INTEGER DEFAULT 0,
    last_edit_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_student_user UNIQUE(user_id)
);

-- ==================== 第二步：插入基础数据 ====================

-- 插入角色
INSERT INTO roles (role_name, role_description) VALUES
('super_admin', '超级管理员'),
('teacher', '教师用户'),
('student', '学生用户')
ON CONFLICT (role_name) DO NOTHING;

-- 插入系统设置
INSERT INTO system_settings (setting_key, setting_value, setting_description) VALUES
('student_profile_edit_enabled', 'true', '学生个人信息维护功能开关'),
('max_profile_edit_count', '3', '学生个人信息最大修改次数')
ON CONFLICT (setting_key) DO NOTHING;

-- 插入测试用户
INSERT INTO users (username, email, user_number, full_name, password_hash, role_id, status, phone, department, grade, class_name) VALUES
('admin', 'admin@example.com', 'A001', '系统管理员', '$2a$10$rOz8R7lTQyX3c8k8V7M8Ou', 1, 'active', '13800138001', '系统管理部', '', ''),
('teacher_zhang', 'teacher_zhang@example.com', 'T001', '张老师', '$2a$10$rOz8R7lTQyX3c8k8V7M8Ou', 2, 'active', '13800138002', '计算机学院', '', ''),
('student_2021001', 'student_2021001@example.com', '2021001', '李小明', '$2a$10$rOz8R7lTQyX3c8k8V7M8Ou', 3, 'active', '13800138000', '计算机学院', '2021级', '计算机科学与技术1班')
ON CONFLICT (username) DO NOTHING;

-- ==================== 第三步：创建RLS策略 ====================

-- 启用RLS并创建策略
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "允许所有人读取角色" ON roles FOR SELECT USING (true);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "允许所有人读取用户" ON users FOR SELECT USING (true);
CREATE POLICY "允许所有人创建用户" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "允许所有人更新用户" ON users FOR UPDATE USING (true);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "允许所有人读取系统设置" ON system_settings FOR SELECT USING (true);
CREATE POLICY "允许所有人更新系统设置" ON system_settings FOR UPDATE USING (true);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "允许所有人读取班级" ON classes FOR SELECT USING (true);
CREATE POLICY "允许所有人创建班级" ON classes FOR INSERT WITH CHECK (true);
CREATE POLICY "允许所有人更新班级" ON classes FOR UPDATE USING (true);

ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "允许所有人读取学生信息" ON student_profiles FOR SELECT USING (true);
CREATE POLICY "允许所有人创建学生信息" ON student_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "允许所有人更新学生信息" ON student_profiles FOR UPDATE USING (true);

-- ==================== 第四步：创建必要的RPC函数 ====================

-- 密码验证函数
CREATE OR REPLACE FUNCTION verify_password(user_id UUID, password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- 简化密码验证，开发环境下密码为 123456
    RETURN password = '123456';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 初始化学生个人信息函数
CREATE OR REPLACE FUNCTION initialize_student_profile(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
    v_profile_id UUID;
BEGIN
    INSERT INTO student_profiles (user_id, profile_status, edit_count)
    VALUES (p_user_id, 'incomplete', 0)
    RETURNING id INTO v_profile_id;
    
    RETURN v_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 提交学生个人信息函数
CREATE OR REPLACE FUNCTION submit_student_profile(
    p_profile_id UUID,
    p_profile_data JSONB,
    p_edit_reason TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE student_profiles SET
        gender = (p_profile_data->>'gender'),
        birth_date = (p_profile_data->>'birth_date')::DATE,
        id_card = (p_profile_data->>'id_card'),
        nationality = (p_profile_data->>'nationality'),
        political_status = (p_profile_data->>'political_status'),
        phone = (p_profile_data->>'phone'),
        emergency_contact = (p_profile_data->>'emergency_contact'),
        emergency_phone = (p_profile_data->>'emergency_phone'),
        home_address = (p_profile_data->>'home_address'),
        admission_date = (p_profile_data->>'admission_date')::DATE,
        graduation_date = (p_profile_data->>'graduation_date')::DATE,
        student_type = (p_profile_data->>'student_type'),
        profile_status = 'pending',
        edit_count = edit_count + 1,
        last_edit_at = NOW(),
        updated_at = NOW()
    WHERE id = p_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== 验证初始化 ====================

SELECT '数据库初始化完成！' as status;
SELECT 'users表记录数:' as info, COUNT(*) as count FROM users;
SELECT 'roles表记录数:' as info, COUNT(*) as count FROM roles;
SELECT 'system_settings表记录数:' as info, COUNT(*) as count FROM system_settings;