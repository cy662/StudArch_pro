-- ==========================================
-- Supabase 完整数据库备份脚本
-- 在Supabase SQL Editor中运行此脚本以生成完整的数据库备份
-- 包含表结构、数据和相关对象
-- ==========================================

-- 注意：此脚本仅用于备份目的，不应用于恢复数据
-- 恢复数据请使用Supabase的官方导入工具

-- ==================== 第一部分：备份信息 ====================
SELECT 
    '-- 备份时间: ' || NOW() AS backup_info,
    '-- 数据库名称: ' || CURRENT_DATABASE() AS db_info,
    '-- 用户: ' || CURRENT_USER AS user_info;

-- ==================== 第二部分：表结构和数据 ====================

-- 1. roles 表
-- 表结构
SELECT '-- ==================== roles 表结构 ====================' AS section;
SELECT 'DROP TABLE IF EXISTS roles CASCADE;' AS drop_statement;
SELECT 'CREATE TABLE roles (' AS create_statement;
SELECT '    id SERIAL PRIMARY KEY,' AS column_def;
SELECT '    role_name VARCHAR(50) NOT NULL UNIQUE,' AS column_def;
SELECT '    role_description TEXT,' AS column_def;
SELECT '    permissions JSONB DEFAULT ''[]'',' AS column_def;
SELECT '    is_system_default BOOLEAN DEFAULT FALSE,' AS column_def;
SELECT '    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),' AS column_def;
SELECT '    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()' AS column_def;
SELECT ');' AS end_statement;

-- 表数据
SELECT '-- ==================== roles 表数据 ====================' AS section;
SELECT 'INSERT INTO roles (id, role_name, role_description, permissions, is_system_default, created_at, updated_at) VALUES' AS insert_statement;
SELECT '(' || id || ', ''' || role_name || ''', ' || 
       COALESCE('''' || REPLACE(role_description, '''', '''''') || '''', 'NULL') || ', ' ||
       '''' || REPLACE(permissions::text, '''', '''''') || ''', ' ||
       COALESCE(is_system_default::text, 'NULL') || ', ' ||
       COALESCE('''' || created_at::text || '''', 'NULL') || ', ' ||
       COALESCE('''' || updated_at::text || '''', 'NULL') || ')' ||
       CASE WHEN LEAD(id) OVER (ORDER BY id) IS NOT NULL THEN ',' ELSE ';' END
FROM roles
ORDER BY id;

-- 2. users 表
-- 表结构
SELECT '-- ==================== users 表结构 ====================' AS section;
SELECT 'DROP TABLE IF EXISTS users CASCADE;' AS drop_statement;
SELECT 'CREATE TABLE users (' AS create_statement;
SELECT '    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),' AS column_def;
SELECT '    username VARCHAR(50) NOT NULL UNIQUE,' AS column_def;
SELECT '    email VARCHAR(255) UNIQUE,' AS column_def;
SELECT '    user_number VARCHAR(50) NOT NULL,' AS column_def;
SELECT '    full_name VARCHAR(100) NOT NULL,' AS column_def;
SELECT '    password_hash VARCHAR(255) NOT NULL,' AS column_def;
SELECT '    role_id INTEGER NOT NULL REFERENCES roles(id),' AS column_def;
SELECT '    status VARCHAR(20) DEFAULT ''active'' CHECK (status IN (''active'', ''inactive'', ''pending'')),' AS column_def;
SELECT '    phone VARCHAR(20),' AS column_def;
SELECT '    department VARCHAR(100),' AS column_def;
SELECT '    grade VARCHAR(20),' AS column_def;
SELECT '    class_name VARCHAR(100),' AS column_def;
SELECT '    last_login TIMESTAMP WITH TIME ZONE,' AS column_def;
SELECT '    password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),' AS column_def;
SELECT '    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),' AS column_def;
SELECT '    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),' AS column_def;
SELECT '    CONSTRAINT unique_user_number UNIQUE(user_number)' AS constraint_def;
SELECT ');' AS end_statement;

-- 表数据
SELECT '-- ==================== users 表数据 ====================' AS section;
SELECT 'INSERT INTO users (id, username, email, user_number, full_name, password_hash, role_id, status, phone, department, grade, class_name, last_login, password_changed_at, created_at, updated_at) VALUES' AS insert_statement;
SELECT '(''' || id || ''', ''' || username || ''', ' || 
       COALESCE('''' || REPLACE(email, '''', '''''') || '''', 'NULL') || ', ' ||
       '''' || user_number || ''', ' ||
       '''' || REPLACE(full_name, '''', '''''') || ''', ' ||
       '''' || REPLACE(password_hash, '''', '''''') || ''', ' ||
       role_id || ', ' ||
       COALESCE('''' || status || '''', 'NULL') || ', ' ||
       COALESCE('''' || REPLACE(phone, '''', '''''') || '''', 'NULL') || ', ' ||
       COALESCE('''' || REPLACE(department, '''', '''''') || '''', 'NULL') || ', ' ||
       COALESCE('''' || REPLACE(grade, '''', '''''') || '''', 'NULL') || ', ' ||
       COALESCE('''' || REPLACE(class_name, '''', '''''') || '''', 'NULL') || ', ' ||
       COALESCE('''' || last_login::text || '''', 'NULL') || ', ' ||
       COALESCE('''' || password_changed_at::text || '''', 'NULL') || ', ' ||
       COALESCE('''' || created_at::text || '''', 'NULL') || ', ' ||
       COALESCE('''' || updated_at::text || '''', 'NULL') || ')' ||
       CASE WHEN LEAD(id) OVER (ORDER BY id) IS NOT NULL THEN ',' ELSE ';' END
FROM users
ORDER BY id;

-- 3. system_settings 表
-- 表结构
SELECT '-- ==================== system_settings 表结构 ====================' AS section;
SELECT 'DROP TABLE IF EXISTS system_settings CASCADE;' AS drop_statement;
SELECT 'CREATE TABLE system_settings (' AS create_statement;
SELECT '    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),' AS column_def;
SELECT '    setting_key VARCHAR(100) NOT NULL UNIQUE,' AS column_def;
SELECT '    setting_value TEXT NOT NULL,' AS column_def;
SELECT '    setting_description TEXT,' AS column_def;
SELECT '    is_editable BOOLEAN DEFAULT TRUE,' AS column_def;
SELECT '    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),' AS column_def;
SELECT '    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()' AS column_def;
SELECT ');' AS end_statement;

-- 表数据
SELECT '-- ==================== system_settings 表数据 ====================' AS section;
SELECT 'INSERT INTO system_settings (id, setting_key, setting_value, setting_description, is_editable, created_at, updated_at) VALUES' AS insert_statement;
SELECT '(''' || id || ''', ''' || setting_key || ''', ' || 
       '''' || REPLACE(setting_value, '''', '''''') || ''', ' ||
       COALESCE('''' || REPLACE(setting_description, '''', '''''') || '''', 'NULL') || ', ' ||
       COALESCE(is_editable::text, 'NULL') || ', ' ||
       COALESCE('''' || created_at::text || '''', 'NULL') || ', ' ||
       COALESCE('''' || updated_at::text || '''', 'NULL') || ')' ||
       CASE WHEN LEAD(id) OVER (ORDER BY id) IS NOT NULL THEN ',' ELSE ';' END
FROM system_settings
ORDER BY id;

-- 4. classes 表
-- 表结构
SELECT '-- ==================== classes 表结构 ====================' AS section;
SELECT 'DROP TABLE IF EXISTS classes CASCADE;' AS drop_statement;
SELECT 'CREATE TABLE classes (' AS create_statement;
SELECT '    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),' AS column_def;
SELECT '    class_name VARCHAR(100) NOT NULL UNIQUE,' AS column_def;
SELECT '    class_code VARCHAR(50) UNIQUE,' AS column_def;
SELECT '    grade VARCHAR(20) NOT NULL,' AS column_def;
SELECT '    department VARCHAR(100),' AS column_def;
SELECT '    head_teacher_id UUID REFERENCES users(id),' AS column_def;
SELECT '    student_count INTEGER DEFAULT 0,' AS column_def;
SELECT '    status VARCHAR(20) DEFAULT ''active'' CHECK (status IN (''active'', ''inactive'')),' AS column_def;
SELECT '    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),' AS column_def;
SELECT '    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()' AS column_def;
SELECT ');' AS end_statement;

-- 表数据
SELECT '-- ==================== classes 表数据 ====================' AS section;
SELECT 'INSERT INTO classes (id, class_name, class_code, grade, department, head_teacher_id, student_count, status, created_at, updated_at) VALUES' AS insert_statement;
SELECT '(''' || id || ''', ''' || REPLACE(class_name, '''', '''''') || ''', ' || 
       COALESCE('''' || REPLACE(class_code, '''', '''''') || '''', 'NULL') || ', ' ||
       '''' || grade || ''', ' ||
       COALESCE('''' || REPLACE(department, '''', '''''') || '''', 'NULL') || ', ' ||
       COALESCE('''' || head_teacher_id::text || '''', 'NULL') || ', ' ||
       COALESCE(student_count::text, 'NULL') || ', ' ||
       COALESCE('''' || status || '''', 'NULL') || ', ' ||
       COALESCE('''' || created_at::text || '''', 'NULL') || ', ' ||
       COALESCE('''' || updated_at::text || '''', 'NULL') || ')' ||
       CASE WHEN LEAD(id) OVER (ORDER BY id) IS NOT NULL THEN ',' ELSE ';' END
FROM classes
ORDER BY id;

-- 5. student_profiles 表
-- 表结构
SELECT '-- ==================== student_profiles 表结构 ====================' AS section;
SELECT 'DROP TABLE IF EXISTS student_profiles CASCADE;' AS drop_statement;
SELECT 'CREATE TABLE student_profiles (' AS create_statement;
SELECT '    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),' AS column_def;
SELECT '    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,' AS column_def;
SELECT '    gender VARCHAR(10) CHECK (gender IN (''male'', ''female'', ''other'')),' AS column_def;
SELECT '    birth_date DATE,' AS column_def;
SELECT '    id_card VARCHAR(20),' AS column_def;
SELECT '    nationality VARCHAR(50),' AS column_def;
SELECT '    political_status VARCHAR(20),' AS column_def;
SELECT '    phone VARCHAR(20),' AS column_def;
SELECT '    emergency_contact VARCHAR(50),' AS column_def;
SELECT '    emergency_phone VARCHAR(20),' AS column_def;
SELECT '    home_address TEXT,' AS column_def;
SELECT '    admission_date DATE,' AS column_def;
SELECT '    graduation_date DATE,' AS column_def;
SELECT '    student_type VARCHAR(20),' AS column_def;
SELECT '    class_id UUID REFERENCES classes(id),' AS column_def;
SELECT '    class_name VARCHAR(100),' AS column_def;
SELECT '    profile_status VARCHAR(20) DEFAULT ''incomplete'' CHECK (profile_status IN (''incomplete'', ''pending'', ''approved'', ''rejected'')),' AS column_def;
SELECT '    edit_count INTEGER DEFAULT 0,' AS column_def;
SELECT '    last_edit_at TIMESTAMP WITH TIME ZONE,' AS column_def;
SELECT '    reviewed_by UUID REFERENCES users(id),' AS column_def;
SELECT '    reviewed_at TIMESTAMP WITH TIME ZONE,' AS column_def;
SELECT '    review_notes TEXT,' AS column_def;
SELECT '    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),' AS column_def;
SELECT '    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),' AS column_def;
SELECT '    CONSTRAINT unique_student_user UNIQUE(user_id)' AS constraint_def;
SELECT ');' AS end_statement;

-- 表数据
SELECT '-- ==================== student_profiles 表数据 ====================' AS section;
SELECT 'INSERT INTO student_profiles (id, user_id, gender, birth_date, id_card, nationality, political_status, phone, emergency_contact, emergency_phone, home_address, admission_date, graduation_date, student_type, class_id, class_name, profile_status, edit_count, last_edit_at, reviewed_by, reviewed_at, review_notes, created_at, updated_at) VALUES' AS insert_statement;
SELECT '(''' || id || ''', ''' || user_id || ''', ' || 
       COALESCE('''' || REPLACE(gender, '''', '''''') || '''', 'NULL') || ', ' ||
       COALESCE('''' || birth_date::text || '''', 'NULL') || ', ' ||
       COALESCE('''' || REPLACE(id_card, '''', '''''') || '''', 'NULL') || ', ' ||
       COALESCE('''' || REPLACE(nationality, '''', '''''') || '''', 'NULL') || ', ' ||
       COALESCE('''' || REPLACE(political_status, '''', '''''') || '''', 'NULL') || ', ' ||
       COALESCE('''' || REPLACE(phone, '''', '''''') || '''', 'NULL') || ', ' ||
       COALESCE('''' || REPLACE(emergency_contact, '''', '''''') || '''', 'NULL') || ', ' ||
       COALESCE('''' || REPLACE(emergency_phone, '''', '''''') || '''', 'NULL') || ', ' ||
       COALESCE('''' || REPLACE(home_address, '''', '''''') || '''', 'NULL') || ', ' ||
       COALESCE('''' || admission_date::text || '''', 'NULL') || ', ' ||
       COALESCE('''' || graduation_date::text || '''', 'NULL') || ', ' ||
       COALESCE('''' || REPLACE(student_type, '''', '''''') || '''', 'NULL') || ', ' ||
       COALESCE('''' || class_id::text || '''', 'NULL') || ', ' ||
       COALESCE('''' || REPLACE(class_name, '''', '''''') || '''', 'NULL') || ', ' ||
       COALESCE('''' || profile_status || '''', 'NULL') || ', ' ||
       COALESCE(edit_count::text, 'NULL') || ', ' ||
       COALESCE('''' || last_edit_at::text || '''', 'NULL') || ', ' ||
       COALESCE('''' || reviewed_by::text || '''', 'NULL') || ', ' ||
       COALESCE('''' || reviewed_at::text || '''', 'NULL') || ', ' ||
       COALESCE('''' || REPLACE(review_notes, '''', '''''') || '''', 'NULL') || ', ' ||
       COALESCE('''' || created_at::text || '''', 'NULL') || ', ' ||
       COALESCE('''' || updated_at::text || '''', 'NULL') || ')' ||
       CASE WHEN LEAD(id) OVER (ORDER BY id) IS NOT NULL THEN ',' ELSE ';' END
FROM student_profiles
ORDER BY id;

-- ==================== 第三部分：索引和约束 ====================
SELECT '-- ==================== 索引和约束 ====================' AS section;

-- roles 表索引
SELECT 'CREATE INDEX IF NOT EXISTS idx_roles_role_name ON roles(role_name);' AS index_statement;

-- users 表索引
SELECT 'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);' AS index_statement;
SELECT 'CREATE INDEX IF NOT EXISTS idx_users_user_number ON users(user_number);' AS index_statement;
SELECT 'CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);' AS index_statement;
SELECT 'CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);' AS index_statement;

-- classes 表索引
SELECT 'CREATE INDEX IF NOT EXISTS idx_classes_grade ON classes(grade);' AS index_statement;
SELECT 'CREATE INDEX IF NOT EXISTS idx_classes_department ON classes(department);' AS index_statement;

-- student_profiles 表索引
SELECT 'CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);' AS index_statement;
SELECT 'CREATE INDEX IF NOT EXISTS idx_student_profiles_class_id ON student_profiles(class_id);' AS index_statement;
SELECT 'CREATE INDEX IF NOT EXISTS idx_student_profiles_status ON student_profiles(profile_status);' AS index_statement;

-- ==================== 第四部分：触发器函数 ====================
SELECT '-- ==================== 触发器函数 ====================' AS section;

-- 更新时间戳函数
SELECT 'CREATE OR REPLACE FUNCTION update_updated_at_column()' AS function_statement;
SELECT 'RETURNS TRIGGER AS $$' AS function_body;
SELECT 'BEGIN' AS function_body;
SELECT '    NEW.updated_at = NOW();' AS function_body;
SELECT '    RETURN NEW;' AS function_body;
SELECT 'END;' AS function_body;
SELECT '$$ language ''plpgsql'';' AS function_end;

-- ==================== 第五部分：视图 ====================
SELECT '-- ==================== 视图 ====================' AS section;

-- user_details 视图
SELECT 'CREATE OR REPLACE VIEW user_details AS' AS view_statement;
SELECT 'SELECT ' AS view_body;
SELECT '    u.id, u.username, u.email, u.user_number, u.full_name, u.status,' AS view_body;
SELECT '    u.phone, u.department, u.grade, u.class_name,' AS view_body;
SELECT '    u.created_at, r.role_name, r.role_description' AS view_body;
SELECT 'FROM users u' AS view_body;
SELECT 'JOIN roles r ON u.role_id = r.id;' AS view_end;

-- ==================== 第六部分：统计信息 ====================
SELECT '-- ==================== 统计信息 ====================' AS section;
SELECT 'SELECT ''备份完成!'' AS backup_status;' AS status_statement;
SELECT 'SELECT ''总表数:'' AS info, COUNT(*) AS count FROM information_schema.tables WHERE table_schema = ''public'' AND table_type = ''BASE TABLE'';' AS table_count;
SELECT 'SELECT ''roles表记录数:'' AS info, COUNT(*) AS count FROM roles;' AS roles_count;
SELECT 'SELECT ''users表记录数:'' AS info, COUNT(*) AS count FROM users;' AS users_count;
SELECT 'SELECT ''classes表记录数:'' AS info, COUNT(*) AS count FROM classes;' AS classes_count;
SELECT 'SELECT ''student_profiles表记录数:'' AS info, COUNT(*) AS count FROM student_profiles;' AS profiles_count;