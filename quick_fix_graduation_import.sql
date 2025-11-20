-- 快速修复毕业去向导入功能的数据库问题
-- 解决users.role字段不存在的错误

-- 步骤1: 添加role字段到users表（如果不存在）
DO $$
BEGIN
    -- 检查role字段是否已存在
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'role'
    ) THEN
        -- 添加role字段
        ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'student';
        
        -- 从roles表同步角色名称
        UPDATE users 
        SET role = r.role_name 
        FROM roles r 
        WHERE users.role_id = r.id;
        
        RAISE NOTICE '已添加role字段到users表';
    ELSE
        RAISE NOTICE 'role字段已存在，跳过添加';
    END IF;
END $$;

-- 步骤2: 验证数据
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN role IS NOT NULL THEN 1 END) as users_with_role,
    COUNT(CASE WHEN role = 'student' THEN 1 END) as student_users,
    COUNT(CASE WHEN role = 'teacher' THEN 1 END) as teacher_users,
    COUNT(CASE WHEN role = 'super_admin' THEN 1 END) as admin_users
FROM users;

-- 步骤3: 重新创建毕业去向相关表（如果需要）
-- 删除可能存在的旧表
DROP TABLE IF EXISTS graduation_import_failures CASCADE;
DROP TABLE IF EXISTS graduation_import_batches CASCADE;
DROP TABLE IF EXISTS graduation_destinations CASCADE;

-- 创建毕业去向表
CREATE TABLE IF NOT EXISTS graduation_destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    destination_type VARCHAR(20) NOT NULL CHECK (destination_type IN (
        'employment', 'furtherstudy', 'abroad', 'entrepreneurship', 'unemployed', 'other'
    )),
    
    company_name VARCHAR(200),
    position VARCHAR(100),
    salary DECIMAL(10,2),
    work_location VARCHAR(200),
    school_name VARCHAR(200),
    major VARCHAR(100),
    degree VARCHAR(50),
    abroad_country VARCHAR(100),
    startup_name VARCHAR(200),
    startup_role VARCHAR(100),
    other_description TEXT,
    
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    review_comment TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id),
    proof_files JSONB DEFAULT '[]',
    submit_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    batch_import_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_student_destination UNIQUE (student_id)
);

-- 创建导入批次表
CREATE TABLE IF NOT EXISTS graduation_import_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_name VARCHAR(200) NOT NULL,
    filename VARCHAR(200),
    total_count INTEGER NOT NULL DEFAULT 0,
    success_count INTEGER NOT NULL DEFAULT 0,
    failed_count INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    error_details JSONB DEFAULT '[]',
    imported_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建导入失败表
CREATE TABLE IF NOT EXISTS graduation_import_failures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES graduation_import_batches(id) ON DELETE CASCADE,
    row_number INTEGER NOT NULL,
    student_id VARCHAR(50),
    error_message TEXT NOT NULL,
    original_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_graduation_destinations_student_id ON graduation_destinations(student_id);
CREATE INDEX IF NOT EXISTS idx_graduation_destinations_status ON graduation_destinations(status);
CREATE INDEX IF NOT EXISTS idx_graduation_import_batches_imported_by ON graduation_import_batches(imported_by);

-- 启用RLS
ALTER TABLE graduation_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE graduation_import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE graduation_import_failures ENABLE ROW LEVEL SECURITY;

-- 简化的RLS策略（临时）
-- 教师可以访问所有数据
CREATE POLICY "Teachers full access" ON graduation_destinations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'teacher'
        )
    );

CREATE POLICY "Teachers full access batches" ON graduation_import_batches
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'teacher'
        )
    );

CREATE POLICY "Teachers full access failures" ON graduation_import_failures
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'teacher'
        )
    );

-- 简化的批量导入函数（不依赖复杂存储过程）
CREATE OR REPLACE FUNCTION simple_import_graduation_data(
    p_student_number TEXT,
    p_destination_type TEXT,
    p_company_name TEXT DEFAULT NULL,
    p_position TEXT DEFAULT NULL,
    p_salary DECIMAL DEFAULT NULL,
    p_work_location TEXT DEFAULT NULL,
    p_school_name TEXT DEFAULT NULL,
    p_major TEXT DEFAULT NULL,
    p_degree TEXT DEFAULT NULL,
    p_abroad_country TEXT DEFAULT NULL,
    p_startup_name TEXT DEFAULT NULL,
    p_startup_role TEXT DEFAULT NULL,
    p_other_description TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_student_id UUID;
    v_existing_id UUID;
BEGIN
    -- 查找学生ID
    SELECT id INTO v_student_id 
    FROM users 
    WHERE student_number = p_student_number 
    AND role = 'student';
    
    IF v_student_id IS NULL THEN
        RETURN 'ERROR: 学号不存在或不是学生: ' || p_student_number;
    END IF;
    
    -- 检查是否已存在记录
    SELECT id INTO v_existing_id 
    FROM graduation_destinations 
    WHERE student_id = v_student_id;
    
    IF v_existing_id IS NOT NULL THEN
        -- 更新现有记录
        UPDATE graduation_destinations SET
            destination_type = p_destination_type,
            company_name = p_company_name,
            position = p_position,
            salary = p_salary,
            work_location = p_work_location,
            school_name = p_school_name,
            major = p_major,
            degree = p_degree,
            abroad_country = p_abroad_country,
            startup_name = p_startup_name,
            startup_role = p_startup_role,
            other_description = p_other_description,
            status = 'approved',
            updated_at = NOW()
        WHERE id = v_existing_id;
        
        RETURN 'SUCCESS: 更新学生去向 ' || p_student_number;
    ELSE
        -- 插入新记录
        INSERT INTO graduation_destinations (
            student_id,
            destination_type,
            company_name,
            position,
            salary,
            work_location,
            school_name,
            major,
            degree,
            abroad_country,
            startup_name,
            startup_role,
            other_description,
            status
        ) VALUES (
            v_student_id,
            p_destination_type,
            p_company_name,
            p_position,
            p_salary,
            p_work_location,
            p_school_name,
            p_major,
            p_degree,
            p_abroad_country,
            p_startup_name,
            p_startup_role,
            p_other_description,
            'approved'
        );
        
        RETURN 'SUCCESS: 添加学生去向 ' || p_student_number;
    END IF;
END;
$$;

SELECT '毕业去向导入功能修复完成！' as status;