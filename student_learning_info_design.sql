-- 学生教学任务与安排相关数据库设计
-- 包含：技术标签、学习收获、学习成果、证明材料

-- ==================== 学生技术标签表 ====================
CREATE TABLE IF NOT EXISTS student_technical_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    
    -- 标签信息
    tag_name VARCHAR(100) NOT NULL, -- 标签名称，如：JavaScript、React、Python等
    tag_category VARCHAR(50) NOT NULL, -- 标签分类：programming_language, framework, tool, database等
    proficiency_level VARCHAR(20) NOT NULL CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')), -- 掌握程度
    description TEXT, -- 标签描述或学习说明
    
    -- 学习信息
    learned_at DATE, -- 学习该标签的时间
    learning_hours INTEGER DEFAULT 0, -- 学习时长（小时）
    practice_projects INTEGER DEFAULT 0, -- 练习项目数量
    confidence_score INTEGER DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 10), -- 自信度评分 0-10
    
    -- 状态和审核
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'pending', 'rejected')),
    verified_by UUID REFERENCES users(id), -- 验证人（教师）
    verified_at TIMESTAMP WITH TIME ZONE, -- 验证时间
    verification_notes TEXT, -- 验证备注
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_student_tag UNIQUE(student_profile_id, tag_name)
);

-- ==================== 学生学习收获表 ====================
CREATE TABLE IF NOT EXISTS student_learning_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    
    -- 收获信息
    title VARCHAR(200) NOT NULL, -- 收获标题
    content TEXT NOT NULL, -- 收获详细内容
    achievement_type VARCHAR(50) NOT NULL CHECK (achievement_type IN ('knowledge', 'skill', 'experience', 'insight', 'other')), -- 收获类型
    
    -- 关联信息
    related_course VARCHAR(100), -- 相关课程
    related_project VARCHAR(100), -- 相关项目
    related_tags TEXT[], -- 相关技术标签数组
    
    -- 时间信息
    achieved_at DATE NOT NULL, -- 获得收获的日期
    duration_period VARCHAR(50), -- 学习周期（如：2个月、1学期等）
    
    -- 影响评估
    impact_level VARCHAR(20) DEFAULT 'medium' CHECK (impact_level IN ('low', 'medium', 'high', 'significant')), -- 影响程度
    application_scenarios TEXT, -- 应用场景描述
    future_utilization TEXT, -- 未来应用计划
    
    -- 状态和审核
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'pending', 'rejected')),
    reviewed_by UUID REFERENCES users(id), -- 审核人（教师）
    reviewed_at TIMESTAMP WITH TIME ZONE, -- 审核时间
    review_notes TEXT, -- 审核意见
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== 学生学习成果表 ====================
CREATE TABLE IF NOT EXISTS student_learning_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    
    -- 成果基本信息
    outcome_title VARCHAR(200) NOT NULL, -- 成果标题
    outcome_description TEXT, -- 成果描述
    outcome_type VARCHAR(50) NOT NULL CHECK (outcome_type IN ('project', 'competition', 'certification', 'research', 'internship', 'other')), -- 成果类型
    
    -- 详细信息
    domain VARCHAR(100), -- 领域（如：Web开发、人工智能、数据分析等）
    difficulty_level VARCHAR(20) DEFAULT 'medium' CHECK (difficulty_level IN ('basic', 'medium', 'advanced', 'expert')), -- 难度等级
    completion_status VARCHAR(20) DEFAULT 'completed' CHECK (completion_status IN ('planning', 'in_progress', 'completed', 'abandoned')), -- 完成状态
    
    -- 时间信息
    start_date DATE, -- 开始时间
    completion_date DATE, -- 完成时间
    duration_days INTEGER, -- 持续天数
    
    -- 成果评估
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5), -- 质量评分 1-5
    innovation_score INTEGER CHECK (innovation_score >= 1 AND innovation_score <= 5), -- 创新性评分 1-5
    practical_value INTEGER CHECK (practical_value >= 1 AND practical_value <= 5), -- 实用价值评分 1-5
    
    -- 关联信息
    related_course VARCHAR(100), -- 相关课程
    related_tags TEXT[], -- 相关技术标签
    team_members TEXT, -- 团队成员（如果是团队项目）
    supervisor_instructor TEXT, -- 指导教师
    
    -- 成果展示
    demo_url VARCHAR(500), -- 演示链接
    github_url VARCHAR(500), -- 代码仓库链接
    presentation_file VARCHAR(500), -- 演示文件路径
    
    -- 状态和审核
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'pending', 'rejected')),
    verified_by UUID REFERENCES users(id), -- 验证人（教师）
    verified_at TIMESTAMP WITH TIME ZONE, -- 验证时间
    verification_notes TEXT, -- 验证备注
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== 学生证明材料表 ====================
CREATE TABLE IF NOT EXISTS student_proof_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    
    -- 材料基本信息
    material_name VARCHAR(200) NOT NULL, -- 材料名称
    material_type VARCHAR(50) NOT NULL CHECK (material_type IN ('certificate', 'award', 'project_report', 'transcript', 'recommendation', 'work_sample', 'other')), -- 材料类型
    material_description TEXT, -- 材料描述
    
    -- 文件信息
    file_name VARCHAR(500), -- 文件名
    file_path VARCHAR(1000), -- 文件存储路径
    file_size BIGINT, -- 文件大小（字节）
    file_type VARCHAR(50), -- 文件类型（pdf, jpg, png等）
    file_hash VARCHAR(128), -- 文件哈希值，用于防篡改
    
    -- 材料详情
    issuing_authority VARCHAR(200), -- 发证机构
    issue_date DATE, -- 颁发日期
    expiry_date DATE, -- 过期日期（如果适用）
    credential_id VARCHAR(100), -- 证书编号/凭证ID
    
    -- 关联信息
    related_outcome_id UUID REFERENCES student_learning_outcomes(id) ON DELETE SET NULL, -- 关联的学习成果
    related_achievement_id UUID REFERENCES student_learning_achievements(id) ON DELETE SET NULL, -- 关联的学习收获
    related_tags TEXT[], -- 相关技术标签
    
    -- 访问控制
    is_public BOOLEAN DEFAULT false, -- 是否公开（其他同学可见）
    access_permissions TEXT[], -- 访问权限控制
    
    -- 状态和审核
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired')),
    verified_by UUID REFERENCES users(id), -- 验证人
    verified_at TIMESTAMP WITH TIME ZONE, -- 验证时间
    verification_notes TEXT, -- 验证备注
    rejection_reason TEXT, -- 拒绝原因（如果被拒绝）
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== 技术标签分类表 ====================
CREATE TABLE IF NOT EXISTS technical_tag_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name VARCHAR(50) NOT NULL UNIQUE,
    category_code VARCHAR(20) UNIQUE,
    parent_category_id UUID REFERENCES technical_tag_categories(id), -- 支持层级分类
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== 学习记录综合表（便于查询） ====================
CREATE OR REPLACE VIEW student_learning_summary AS
SELECT 
    sp.id as student_profile_id,
    sp.full_name,
    sp.class_name,
    
    -- 技术标签统计
    COUNT(DISTINCT stt.id) as total_tags,
    COUNT(DISTINCT CASE WHEN stt.proficiency_level IN ('advanced', 'expert') THEN stt.id END) as advanced_tags,
    STRING_AGG(DISTINCT stt.tag_name, ', ') as tag_names,
    
    -- 学习收获统计
    COUNT(DISTINCT sla.id) as total_achievements,
    COUNT(DISTINCT CASE WHEN sla.impact_level = 'significant' THEN sla.id END) as significant_achievements,
    
    -- 学习成果统计
    COUNT(DISTINCT slo.id) as total_outcomes,
    COUNT(DISTINCT CASE WHEN slo.quality_rating >= 4 THEN slo.id END) as high_quality_outcomes,
    AVG(slo.quality_rating) as avg_quality_rating,
    
    -- 证明材料统计
    COUNT(DISTINCT spm.id) as total_materials,
    COUNT(DISTINCT CASE WHEN spm.verification_status = 'verified' THEN spm.id END) as verified_materials,
    
    -- 最后更新时间
    GREATEST(
        COALESCE(MAX(stt.updated_at), '1970-01-01'::timestamp),
        COALESCE(MAX(sla.updated_at), '1970-01-01'::timestamp),
        COALESCE(MAX(slo.updated_at), '1970-01-01'::timestamp),
        COALESCE(MAX(spm.updated_at), '1970-01-01'::timestamp)
    ) as last_updated_at
    
FROM student_profiles sp
LEFT JOIN student_technical_tags stt ON sp.id = stt.student_profile_id AND stt.status = 'active'
LEFT JOIN student_learning_achievements sla ON sp.id = sla.student_profile_id AND sla.status = 'active'
LEFT JOIN student_learning_outcomes slo ON sp.id = slo.student_profile_id AND slo.status = 'active'
LEFT JOIN student_proof_materials spm ON sp.id = spm.student_profile_id AND spm.verification_status = 'verified'
GROUP BY sp.id, sp.full_name, sp.class_name;

-- ==================== 创建索引 ====================
-- 技术标签相关索引
CREATE INDEX IF NOT EXISTS idx_student_technical_tags_student_id ON student_technical_tags(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_student_technical_tags_category ON student_technical_tags(tag_category);
CREATE INDEX IF NOT EXISTS idx_student_technical_tags_proficiency ON student_technical_tags(proficiency_level);
CREATE INDEX IF NOT EXISTS idx_student_technical_tags_status ON student_technical_tags(status);

-- 学习收获相关索引
CREATE INDEX IF NOT EXISTS idx_learning_achievements_student_id ON student_learning_achievements(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_learning_achievements_type ON student_learning_achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_learning_achievements_impact ON student_learning_achievements(impact_level);
CREATE INDEX IF NOT EXISTS idx_learning_achievements_status ON student_learning_achievements(status);

-- 学习成果相关索引
CREATE INDEX IF NOT EXISTS idx_learning_outcomes_student_id ON student_learning_outcomes(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_learning_outcomes_type ON student_learning_outcomes(outcome_type);
CREATE INDEX IF NOT EXISTS idx_learning_outcomes_status ON student_learning_outcomes(status);
CREATE INDEX IF NOT EXISTS idx_learning_outcomes_quality ON student_learning_outcomes(quality_rating);

-- 证明材料相关索引
CREATE INDEX IF NOT EXISTS idx_proof_materials_student_id ON student_proof_materials(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_proof_materials_type ON student_proof_materials(material_type);
CREATE INDEX IF NOT EXISTS idx_proof_materials_verification ON student_proof_materials(verification_status);
CREATE INDEX IF NOT EXISTS idx_proof_materials_public ON student_proof_materials(is_public);

-- 标签分类索引
CREATE INDEX IF NOT EXISTS idx_tag_categories_parent ON technical_tag_categories(parent_category_id);
CREATE INDEX IF NOT EXISTS idx_tag_categories_active ON technical_tag_categories(is_active);

-- ==================== 触发器函数 ====================
-- 更新技术标签时间戳
CREATE TRIGGER update_student_technical_tags_updated_at 
    BEFORE UPDATE ON student_technical_tags 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 更新学习收获时间戳
CREATE TRIGGER update_student_learning_achievements_updated_at 
    BEFORE UPDATE ON student_learning_achievements 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 更新学习成果时间戳
CREATE TRIGGER update_student_learning_outcomes_updated_at 
    BEFORE UPDATE ON student_learning_outcomes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 更新证明材料时间戳
CREATE TRIGGER update_student_proof_materials_updated_at 
    BEFORE UPDATE ON student_proof_materials 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 更新标签分类时间戳
CREATE TRIGGER update_technical_tag_categories_updated_at 
    BEFORE UPDATE ON technical_tag_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== 存储过程：添加学生技术标签 ====================
CREATE OR REPLACE FUNCTION add_student_technical_tag(
    p_student_profile_id UUID,
    p_tag_name VARCHAR(100),
    p_tag_category VARCHAR(50),
    p_proficiency_level VARCHAR(20),
    p_description TEXT DEFAULT NULL,
    p_learned_at DATE DEFAULT NULL,
    p_learning_hours INTEGER DEFAULT 0,
    p_practice_projects INTEGER DEFAULT 0,
    p_confidence_score INTEGER DEFAULT 0
) RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_tag_id UUID;
BEGIN
    INSERT INTO student_technical_tags (
        student_profile_id,
        tag_name,
        tag_category,
        proficiency_level,
        description,
        learned_at,
        learning_hours,
        practice_projects,
        confidence_score
    ) VALUES (
        p_student_profile_id,
        p_tag_name,
        p_tag_category,
        p_proficiency_level,
        p_description,
        p_learned_at,
        p_learning_hours,
        p_practice_projects,
        p_confidence_score
    )
    RETURNING id INTO v_tag_id;
    
    RETURN v_tag_id;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION '该学生已添加相同的技术标签: %', p_tag_name;
END;
$$;

-- ==================== 存储过程：添加学习收获 ====================
CREATE OR REPLACE FUNCTION add_learning_achievement(
    p_student_profile_id UUID,
    p_title VARCHAR(200),
    p_content TEXT,
    p_achievement_type VARCHAR(50),
    p_related_course VARCHAR(100) DEFAULT NULL,
    p_related_project VARCHAR(100) DEFAULT NULL,
    p_related_tags TEXT[] DEFAULT NULL,
    p_achieved_at DATE,
    p_duration_period VARCHAR(50) DEFAULT NULL,
    p_impact_level VARCHAR(20) DEFAULT 'medium',
    p_application_scenarios TEXT DEFAULT NULL,
    p_future_utilization TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_achievement_id UUID;
BEGIN
    INSERT INTO student_learning_achievements (
        student_profile_id,
        title,
        content,
        achievement_type,
        related_course,
        related_project,
        related_tags,
        achieved_at,
        duration_period,
        impact_level,
        application_scenarios,
        future_utilization
    ) VALUES (
        p_student_profile_id,
        p_title,
        p_content,
        p_achievement_type,
        p_related_course,
        p_related_project,
        p_related_tags,
        p_achieved_at,
        p_duration_period,
        p_impact_level,
        p_application_scenarios,
        p_future_utilization
    )
    RETURNING id INTO v_achievement_id;
    
    RETURN v_achievement_id;
END;
$$;

-- ==================== 存储过程：添加学习成果 ====================
CREATE OR REPLACE FUNCTION add_learning_outcome(
    p_student_profile_id UUID,
    p_outcome_title VARCHAR(200),
    p_outcome_description TEXT,
    p_outcome_type VARCHAR(50),
    p_domain VARCHAR(100) DEFAULT NULL,
    p_difficulty_level VARCHAR(20) DEFAULT 'medium',
    p_completion_status VARCHAR(20) DEFAULT 'completed',
    p_start_date DATE DEFAULT NULL,
    p_completion_date DATE DEFAULT NULL,
    p_quality_rating INTEGER DEFAULT NULL,
    p_innovation_score INTEGER DEFAULT NULL,
    p_practical_value INTEGER DEFAULT NULL,
    p_related_course VARCHAR(100) DEFAULT NULL,
    p_related_tags TEXT[] DEFAULT NULL,
    p_demo_url VARCHAR(500) DEFAULT NULL,
    p_github_url VARCHAR(500) DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_outcome_id UUID;
    v_duration_days INTEGER;
BEGIN
    -- 计算持续天数
    IF p_start_date IS NOT NULL AND p_completion_date IS NOT NULL THEN
        v_duration_days := p_completion_date - p_start_date;
    END IF;
    
    INSERT INTO student_learning_outcomes (
        student_profile_id,
        outcome_title,
        outcome_description,
        outcome_type,
        domain,
        difficulty_level,
        completion_status,
        start_date,
        completion_date,
        duration_days,
        quality_rating,
        innovation_score,
        practical_value,
        related_course,
        related_tags,
        demo_url,
        github_url
    ) VALUES (
        p_student_profile_id,
        p_outcome_title,
        p_outcome_description,
        p_outcome_type,
        p_domain,
        p_difficulty_level,
        p_completion_status,
        p_start_date,
        p_completion_date,
        v_duration_days,
        p_quality_rating,
        p_innovation_score,
        p_practical_value,
        p_related_course,
        p_related_tags,
        p_demo_url,
        p_github_url
    )
    RETURNING id INTO v_outcome_id;
    
    RETURN v_outcome_id;
END;
$$;

-- ==================== 存储过程：添加证明材料 ====================
CREATE OR REPLACE FUNCTION add_proof_material(
    p_student_profile_id UUID,
    p_material_name VARCHAR(200),
    p_material_type VARCHAR(50),
    p_material_description TEXT DEFAULT NULL,
    p_file_name VARCHAR(500) DEFAULT NULL,
    p_file_path VARCHAR(1000) DEFAULT NULL,
    p_file_size BIGINT DEFAULT NULL,
    p_file_type VARCHAR(50) DEFAULT NULL,
    p_issuing_authority VARCHAR(200) DEFAULT NULL,
    p_issue_date DATE DEFAULT NULL,
    p_expiry_date DATE DEFAULT NULL,
    p_credential_id VARCHAR(100) DEFAULT NULL,
    p_related_outcome_id UUID DEFAULT NULL,
    p_related_achievement_id UUID DEFAULT NULL,
    p_related_tags TEXT[] DEFAULT NULL,
    p_is_public BOOLEAN DEFAULT false,
    p_access_permissions TEXT[] DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_material_id UUID;
BEGIN
    INSERT INTO student_proof_materials (
        student_profile_id,
        material_name,
        material_type,
        material_description,
        file_name,
        file_path,
        file_size,
        file_type,
        issuing_authority,
        issue_date,
        expiry_date,
        credential_id,
        related_outcome_id,
        related_achievement_id,
        related_tags,
        is_public,
        access_permissions
    ) VALUES (
        p_student_profile_id,
        p_material_name,
        p_material_type,
        p_material_description,
        p_file_name,
        p_file_path,
        p_file_size,
        p_file_type,
        p_issuing_authority,
        p_issue_date,
        p_expiry_date,
        p_credential_id,
        p_related_outcome_id,
        p_related_achievement_id,
        p_related_tags,
        p_is_public,
        p_access_permissions
    )
    RETURNING id INTO v_material_id;
    
    RETURN v_material_id;
END;
$$;

-- ==================== 插入基础数据 ====================
-- 插入技术标签分类
INSERT INTO technical_tag_categories (category_name, category_code, description, sort_order) VALUES
('编程语言', 'programming_language', '各种编程语言和脚本语言', 1),
('前端框架', 'frontend_framework', '前端开发框架和库', 2),
('后端框架', 'backend_framework', '后端开发框架和技术', 3),
('数据库', 'database', '数据库相关技术', 4),
('开发工具', 'development_tool', '开发工具和环境', 5),
('云计算', 'cloud_computing', '云计算平台和服务', 6),
('人工智能', 'artificial_intelligence', '人工智能和机器学习', 7),
('移动开发', 'mobile_development', '移动应用开发技术', 8),
('DevOps', 'devops', 'DevOps相关技术和工具', 9),
('其他', 'other', '其他技术标签', 10)
ON CONFLICT (category_name) DO NOTHING;

-- ==================== 启用行级安全策略 ====================
ALTER TABLE student_technical_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_learning_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_learning_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_proof_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE technical_tag_categories ENABLE ROW LEVEL SECURITY;

-- 学生只能操作自己的数据
CREATE POLICY "学生技术标签策略" ON student_technical_tags
    FOR ALL USING (student_profile_id IN (
        SELECT id FROM student_profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "学生学习收获策略" ON student_learning_achievements
    FOR ALL USING (student_profile_id IN (
        SELECT id FROM student_profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "学生学习成果策略" ON student_learning_outcomes
    FOR ALL USING (student_profile_id IN (
        SELECT id FROM student_profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "学生证明材料策略" ON student_proof_materials
    FOR ALL USING (student_profile_id IN (
        SELECT id FROM student_profiles WHERE user_id = auth.uid()
    ));

-- 教师可以查看所有学生数据
CREATE POLICY "教师查看技术标签" ON student_technical_tags
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role_id IN (
            SELECT id FROM roles WHERE role_name IN ('super_admin', 'teacher')
        )
    ));

CREATE POLICY "教师查看学习收获" ON student_learning_achievements
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role_id IN (
            SELECT id FROM roles WHERE role_name IN ('super_admin', 'teacher')
        )
    ));

CREATE POLICY "教师查看学习成果" ON student_learning_outcomes
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role_id IN (
            SELECT id FROM roles WHERE role_name IN ('super_admin', 'teacher')
        )
    ));

CREATE POLICY "教师查看证明材料" ON student_proof_materials
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role_id IN (
            SELECT id FROM roles WHERE role_name IN ('super_admin', 'teacher')
        )
    ));

-- 标签分类所有人可查看，管理员可修改
CREATE POLICY "标签分类查看策略" ON technical_tag_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "标签分类管理策略" ON technical_tag_categories
    FOR ALL USING (EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role_id = (SELECT id FROM roles WHERE role_name = 'super_admin')
    ));

COMMIT;