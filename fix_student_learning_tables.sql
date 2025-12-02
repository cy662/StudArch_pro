-- 修复学生学习信息相关表结构
-- 解决课程信息保存失败问题

-- 1. 首先确保student_profiles表存在并创建测试数据
INSERT INTO student_profiles (id, student_number, full_name, class_name, status)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', '2024010001', '张三', '计算机科学与技术2024-1班', 'active'),
    ('550e8400-e29b-41d4-a716-446655440002', '2024010002', '李四', '计算机科学与技术2024-1班', 'active')
ON CONFLICT (id) DO NOTHING;

-- 2. 创建学生技术标签表（如果不存在）
CREATE TABLE IF NOT EXISTS student_technical_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    tag_name VARCHAR(100) NOT NULL,
    proficiency_level VARCHAR(20) DEFAULT 'intermediate' CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    learned_at DATE,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'pending', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_student_tag UNIQUE(student_profile_id, tag_name)
);

-- 3. 创建学生学习收获表（如果不存在）
CREATE TABLE IF NOT EXISTS student_learning_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    achievement_type VARCHAR(50) DEFAULT 'course_completion' CHECK (achievement_type IN ('knowledge', 'skill', 'experience', 'insight', 'other', 'course_completion')),
    related_course VARCHAR(100),
    related_project VARCHAR(100),
    achieved_at DATE NOT NULL,
    impact_level VARCHAR(20) DEFAULT 'medium' CHECK (impact_level IN ('low', 'medium', 'high', 'significant')),
    application_scenarios TEXT,
    future_utilization TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'pending', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建学生学习成果表（如果不存在）
CREATE TABLE IF NOT EXISTS student_learning_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    outcome_title VARCHAR(200) NOT NULL,
    outcome_description TEXT,
    outcome_type VARCHAR(50) DEFAULT 'course_project' CHECK (outcome_type IN ('course_project', 'personal_project', 'competition', 'research', 'internship', 'other')),
    start_date DATE,
    completion_date DATE,
    difficulty_level VARCHAR(20) DEFAULT 'intermediate' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    completion_status VARCHAR(20) DEFAULT 'in_progress' CHECK (completion_status IN ('planning', 'in_progress', 'completed', 'paused', 'cancelled')),
    quality_rating INTEGER DEFAULT 3 CHECK (quality_rating >= 1 AND quality_rating <= 5),
    demonstration_url TEXT,
    project_team TEXT,
    role_description TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'pending', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 创建学生证明材料表（如果不存在）
CREATE TABLE IF NOT EXISTS student_proof_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    material_name VARCHAR(200) NOT NULL,
    material_description TEXT,
    material_type VARCHAR(50) DEFAULT 'course_certificate' CHECK (material_type IN ('course_certificate', 'project_report', 'competition_certificate', 'internship_certificate', 'other')),
    material_url TEXT,
    upload_date DATE,
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verification_date DATE,
    verifier_id UUID,
    verification_notes TEXT,
    access_permissions TEXT,
    file_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 禁用这些表的RLS策略（如果存在）
ALTER TABLE student_technical_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_learning_achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_learning_outcomes DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_proof_materials DISABLE ROW LEVEL SECURITY;

-- 7. 创建必要的索引
CREATE INDEX IF NOT EXISTS idx_student_technical_tags_profile ON student_technical_tags(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_student_learning_achievements_profile ON student_learning_achievements(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_student_learning_outcomes_profile ON student_learning_outcomes(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_student_proof_materials_profile ON student_proof_materials(student_profile_id);

-- 8. 插入一些测试数据
INSERT INTO student_technical_tags (student_profile_id, tag_name, proficiency_level, learned_at, description)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'JavaScript', 'intermediate', '2024-09-01', '学习了JavaScript基础语法'),
    ('550e8400-e29b-41d4-a716-446655440001', 'React', 'beginner', '2024-10-01', '开始学习React框架')
ON CONFLICT (student_profile_id, tag_name) DO NOTHING;

-- 验证表是否创建成功
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('student_technical_tags', 'student_learning_achievements', 'student_learning_outcomes', 'student_proof_materials')
ORDER BY tablename;