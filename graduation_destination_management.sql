-- 毕业去向管理功能 - 数据库表结构和SQL脚本
-- 为Supabase手动执行

-- ==================== 毕业去向信息表 ====================
CREATE TABLE IF NOT EXISTS graduation_destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES users(id) ON DELETE SET NULL, -- 审核教师
    
    -- 去向类型
    destination_type VARCHAR(20) NOT NULL CHECK (destination_type IN (
        'employment', -- 就业
        'furtherstudy', -- 国内升学
        'abroad', -- 出国留学
        'entrepreneurship', -- 创业
        'unemployed', -- 待业
        'other' -- 其他
    )),
    
    -- 就业相关信息
    company_name VARCHAR(200), -- 单位名称
    position VARCHAR(100), -- 职位
    salary DECIMAL(10,2), -- 薪资
    work_location VARCHAR(200), -- 工作地点
    
    -- 升学相关信息
    school_name VARCHAR(200), -- 学校名称
    major VARCHAR(100), -- 专业
    degree VARCHAR(50), -- 学历层次
    abroad_country VARCHAR(100), -- 留学国家
    
    -- 创业相关信息
    startup_name VARCHAR(200), -- 创业公司名称
    startup_role VARCHAR(100), -- 创业角色
    
    -- 其他去向描述
    other_description TEXT, -- 其他去向描述
    
    -- 审核状态
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', -- 待审核
        'approved', -- 已通过
        'rejected' -- 已驳回
    )),
    
    -- 审核相关
    review_comment TEXT, -- 审核意见
    reviewed_at TIMESTAMP WITH TIME ZONE, -- 审核时间
    reviewed_by UUID REFERENCES users(id), -- 审核人
    
    -- 证明材料
    proof_files JSONB DEFAULT '[]', -- 证明文件列表
    
    -- 提交信息
    submit_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- 提交时间
    batch_import_id UUID, -- 批量导入批次ID（如果有）
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 唯一约束：每个学生只能有一个有效的毕业去向记录
    CONSTRAINT unique_student_destination UNIQUE (student_id)
);

-- ==================== 批量导入记录表 ====================
CREATE TABLE IF NOT EXISTS graduation_import_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_name VARCHAR(200) NOT NULL, -- 批次名称
    filename VARCHAR(200), -- 文件名
    total_count INTEGER NOT NULL DEFAULT 0, -- 总记录数
    success_count INTEGER NOT NULL DEFAULT 0, -- 成功数量
    failed_count INTEGER NOT NULL DEFAULT 0, -- 失败数量
    status VARCHAR(20) DEFAULT 'processing' CHECK (status IN (
        'processing', -- 处理中
        'completed', -- 已完成
        'failed' -- 失败
    )),
    error_details JSONB DEFAULT '[]', -- 错误详情
    imported_by UUID NOT NULL REFERENCES users(id), -- 导入人
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== 批量导入失败记录表 ====================
CREATE TABLE IF NOT EXISTS graduation_import_failures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES graduation_import_batches(id) ON DELETE CASCADE,
    row_number INTEGER NOT NULL, -- 行号
    student_id VARCHAR(50), -- 学号
    error_message TEXT NOT NULL, -- 错误信息
    original_data JSONB, -- 原始数据
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== 索引优化 ====================
CREATE INDEX IF NOT EXISTS idx_graduation_destinations_student_id ON graduation_destinations(student_id);
CREATE INDEX IF NOT EXISTS idx_graduation_destinations_teacher_id ON graduation_destinations(teacher_id);
CREATE INDEX IF NOT EXISTS idx_graduation_destinations_status ON graduation_destinations(status);
CREATE INDEX IF NOT EXISTS idx_graduation_destinations_type ON graduation_destinations(destination_type);
CREATE INDEX IF NOT EXISTS idx_graduation_destinations_submit_time ON graduation_destinations(submit_time);
CREATE INDEX IF NOT EXISTS idx_graduation_destinations_batch_import ON graduation_destinations(batch_import_id);

CREATE INDEX IF NOT EXISTS idx_graduation_import_batches_imported_by ON graduation_import_batches(imported_by);
CREATE INDEX IF NOT EXISTS idx_graduation_import_batches_status ON graduation_import_batches(status);
CREATE INDEX IF NOT EXISTS idx_graduation_import_batches_created_at ON graduation_import_batches(created_at);

CREATE INDEX IF NOT EXISTS idx_graduation_import_failures_batch_id ON graduation_import_failures(batch_id);

-- ==================== RLS权限策略 ====================
-- 启用RLS
ALTER TABLE graduation_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE graduation_import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE graduation_import_failures ENABLE ROW LEVEL SECURITY;

-- 毕业去向表权限策略
-- 教师可以查看所有学生的毕业去向
CREATE POLICY "Teachers can view all graduation destinations" ON graduation_destinations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'teacher'
        )
    );

-- 学生只能查看自己的毕业去向
CREATE POLICY "Students can view own graduation destination" ON graduation_destinations
    FOR SELECT USING (student_id = auth.uid());

-- 学生可以插入/更新自己的毕业去向
CREATE POLICY "Students can insert own graduation destination" ON graduation_destinations
    FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update own graduation destination" ON graduation_destinations
    FOR UPDATE USING (student_id = auth.uid());

-- 教师可以更新所有学生的毕业去向（包括审核）
CREATE POLICY "Teachers can update all graduation destinations" ON graduation_destinations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'teacher'
        )
    );

-- 批量导入记录表权限策略
-- 教师可以查看所有导入记录
CREATE POLICY "Teachers can view all import batches" ON graduation_import_batches
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'teacher'
        )
    );

-- 教师可以插入导入记录
CREATE POLICY "Teachers can insert import batches" ON graduation_import_batches
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = imported_by 
            AND users.role = 'teacher'
        )
    );

-- 导入失败记录表权限策略
-- 教师可以查看所有失败记录
CREATE POLICY "Teachers can view all import failures" ON graduation_import_failures
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'teacher'
        )
    );

-- ==================== 触发器：自动更新 updated_at ====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_graduation_destinations_updated_at 
    BEFORE UPDATE ON graduation_destinations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_graduation_import_batches_updated_at 
    BEFORE UPDATE ON graduation_import_batches 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== 存储过程：批量导入毕业去向 ====================
CREATE OR REPLACE FUNCTION batch_import_graduation_destinations(
    p_batch_name VARCHAR(200),
    p_filename VARCHAR(200),
    p_data JSONB,
    p_imported_by UUID
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_batch_id UUID;
    v_total_count INTEGER := 0;
    v_success_count INTEGER := 0;
    v_failed_count INTEGER := 0;
    v_row_data JSONB;
    v_student_id UUID;
    v_destination_id UUID;
    v_error_message TEXT;
BEGIN
    -- 创建导入批次记录
    INSERT INTO graduation_import_batches (
        batch_name, 
        filename, 
        total_count, 
        imported_by
    ) VALUES (
        p_batch_name, 
        p_filename, 
        json_array_length(p_data), 
        p_imported_by
    ) RETURNING id INTO v_batch_id;
    
    -- 处理每一行数据
    FOR v_row_data IN SELECT * FROM jsonb_array_elements(p_data)
    LOOP
        v_total_count := v_total_count + 1;
        v_error_message := NULL;
        v_student_id := NULL;
        
        BEGIN
            -- 根据学号查找学生ID
            SELECT u.id INTO v_student_id 
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.student_number = v_row_data->>'student_number' 
            AND r.role_name = 'student';
            
            IF v_student_id IS NULL THEN
                v_error_message := '学号不存在：' || (v_row_data->>'student_number');
            ELSE
                -- 检查是否已存在毕业去向记录
                SELECT id INTO v_destination_id 
                FROM graduation_destinations 
                WHERE student_id = v_student_id;
                
                IF v_destination_id IS NOT NULL THEN
                    -- 更新现有记录
                    UPDATE graduation_destinations SET
                        destination_type = v_row_data->>'destination_type',
                        company_name = v_row_data->>'company_name',
                        position = v_row_data->>'position',
                        salary = CASE WHEN v_row_data->>'salary' = '' THEN NULL ELSE (v_row_data->>'salary')::DECIMAL END,
                        work_location = v_row_data->>'work_location',
                        school_name = v_row_data->>'school_name',
                        major = v_row_data->>'major',
                        degree = v_row_data->>'degree',
                        abroad_country = v_row_data->>'abroad_country',
                        startup_name = v_row_data->>'startup_name',
                        startup_role = v_row_data->>'startup_role',
                        other_description = v_row_data->>'other_description',
                        status = 'approved', -- 批量导入的直接设为已通过
                        batch_import_id = v_batch_id,
                        updated_at = NOW()
                    WHERE id = v_destination_id;
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
                        status,
                        batch_import_id
                    ) VALUES (
                        v_student_id,
                        v_row_data->>'destination_type',
                        v_row_data->>'company_name',
                        v_row_data->>'position',
                        CASE WHEN v_row_data->>'salary' = '' THEN NULL ELSE (v_row_data->>'salary')::DECIMAL END,
                        v_row_data->>'work_location',
                        v_row_data->>'school_name',
                        v_row_data->>'major',
                        v_row_data->>'degree',
                        v_row_data->>'abroad_country',
                        v_row_data->>'startup_name',
                        v_row_data->>'startup_role',
                        v_row_data->>'other_description',
                        'approved', -- 批量导入的直接设为已通过
                        v_batch_id
                    );
                END IF;
                
                v_success_count := v_success_count + 1;
            END IF;
            
        EXCEPTION
            WHEN OTHERS THEN
                v_error_message := SQLERRM;
        END;
        
        -- 如果有错误，记录失败信息
        IF v_error_message IS NOT NULL THEN
            v_failed_count := v_failed_count + 1;
            
            INSERT INTO graduation_import_failures (
                batch_id,
                row_number,
                student_id,
                error_message,
                original_data
            ) VALUES (
                v_batch_id,
                v_total_count,
                v_row_data->>'student_number',
                v_error_message,
                v_row_data
            );
        END IF;
    END LOOP;
    
    -- 更新批次状态
    UPDATE graduation_import_batches SET
        success_count = v_success_count,
        failed_count = v_failed_count,
        status = CASE 
            WHEN v_failed_count = 0 THEN 'completed'
            WHEN v_success_count = 0 THEN 'failed'
            ELSE 'completed'
        END,
        updated_at = NOW()
    WHERE id = v_batch_id;
    
    RETURN v_batch_id;
END;
$$;

-- ==================== 存储过程：获取毕业去向统计 ====================
CREATE OR REPLACE FUNCTION get_graduation_stats(
    p_teacher_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_students', COUNT(DISTINCT gd.student_id),
        'by_status', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'status', status,
                    'count', COUNT(*)
                )
            )
            FROM graduation_destinations
            WHERE (p_teacher_id IS NULL OR teacher_id = p_teacher_id)
        ),
        'by_type', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'type', destination_type,
                    'count', COUNT(*)
                )
            )
            FROM graduation_destinations
            WHERE (p_teacher_id IS NULL OR teacher_id = p_teacher_id)
        )
    ) INTO v_result
    FROM graduation_destinations gd
    WHERE (p_teacher_id IS NULL OR gd.teacher_id = p_teacher_id);
    
    RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- ==================== 示例数据（可选） ====================
-- 注意：生产环境中应该删除这部分示例数据

-- 插入一些示例毕业去向数据（仅用于演示）
INSERT INTO graduation_destinations (student_id, destination_type, company_name, position, salary, work_location, status) VALUES
    ((SELECT id FROM users WHERE student_number = '2021001' LIMIT 1), 'employment', '阿里巴巴（中国）有限公司', '前端开发工程师', 15000.00, '杭州', 'approved'),
    ((SELECT id FROM users WHERE student_number = '2021002' LIMIT 1), 'furtherstudy', '清华大学', '计算机应用技术', NULL, NULL, 'approved'),
    ((SELECT id FROM users WHERE student_number = '2021003' LIMIT 1), 'entrepreneurship', '北京创新科技有限公司', '创始人兼CEO', NULL, '北京', 'approved')
ON CONFLICT (student_id) DO NOTHING;

-- ==================== 完成 ====================
-- 毕业去向管理功能数据库结构创建完成