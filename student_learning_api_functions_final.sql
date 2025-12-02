-- 学生教学任务与安排相关的API接口函数（最终修复版本）
-- 供后端应用调用的数据库函数

-- ==================== 技术标签相关API函数 ====================

-- 获取学生的所有技术标签
CREATE OR REPLACE FUNCTION get_student_technical_tags(
    p_student_profile_id UUID
) RETURNS TABLE (
    id UUID,
    tag_name VARCHAR(100),
    tag_category VARCHAR(50),
    proficiency_level VARCHAR(20),
    description TEXT,
    learned_at DATE,
    learning_hours INTEGER,
    practice_projects INTEGER,
    confidence_score INTEGER,
    status VARCHAR(20),
    verified_by UUID,
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        stt.id,
        stt.tag_name,
        stt.tag_category,
        stt.proficiency_level,
        stt.description,
        stt.learned_at,
        stt.learning_hours,
        stt.practice_projects,
        stt.confidence_score,
        stt.status,
        stt.verified_by,
        stt.verified_at,
        stt.verification_notes,
        stt.created_at,
        stt.updated_at
    FROM student_technical_tags stt
    WHERE stt.student_profile_id = p_student_profile_id
    ORDER BY stt.created_at DESC;
END;
$$;

-- 更新技术标签验证状态
CREATE OR REPLACE FUNCTION verify_technical_tag(
    p_tag_id UUID,
    p_verified_by UUID,
    p_verification_status VARCHAR(20), -- 'verified' or 'rejected'
    p_verification_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE student_technical_tags 
    SET 
        status = p_verification_status,
        verified_by = p_verified_by,
        verified_at = NOW(),
        verification_notes = p_verification_notes,
        updated_at = NOW()
    WHERE id = p_tag_id;
    
    RETURN FOUND;
END;
$$;

-- 获取技术标签统计信息
CREATE OR REPLACE FUNCTION get_technical_tags_statistics(
    p_student_profile_id UUID
) RETURNS TABLE (
    category VARCHAR(50),
    total_count INTEGER,
    beginner_count INTEGER,
    intermediate_count INTEGER,
    advanced_count INTEGER,
    expert_count INTEGER,
    avg_confidence_score NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        stt.tag_category as category,
        COUNT(*) as total_count,
        COUNT(CASE WHEN stt.proficiency_level = 'beginner' THEN 1 END) as beginner_count,
        COUNT(CASE WHEN stt.proficiency_level = 'intermediate' THEN 1 END) as intermediate_count,
        COUNT(CASE WHEN stt.proficiency_level = 'advanced' THEN 1 END) as advanced_count,
        COUNT(CASE WHEN stt.proficiency_level = 'expert' THEN 1 END) as expert_count,
        ROUND(AVG(stt.confidence_score), 2) as avg_confidence_score
    FROM student_technical_tags stt
    WHERE stt.student_profile_id = p_student_profile_id AND stt.status = 'active'
    GROUP BY stt.tag_category
    ORDER BY stt.tag_category;
END;
$$;

-- ==================== 学习收获相关API函数 ====================

-- 获取学生的学习收获列表
CREATE OR REPLACE FUNCTION get_student_learning_achievements(
    p_student_profile_id UUID,
    p_achievement_type VARCHAR(50) DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
    id UUID,
    title VARCHAR(200),
    content TEXT,
    achievement_type VARCHAR(50),
    related_course VARCHAR(100),
    related_project VARCHAR(100),
    related_tags TEXT[],
    achieved_at DATE,
    duration_period VARCHAR(50),
    impact_level VARCHAR(20),
    application_scenarios TEXT,
    future_utilization TEXT,
    status VARCHAR(20),
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sla.id,
        sla.title,
        sla.content,
        sla.achievement_type,
        sla.related_course,
        sla.related_project,
        sla.related_tags,
        sla.achieved_at,
        sla.duration_period,
        sla.impact_level,
        sla.application_scenarios,
        sla.future_utilization,
        sla.status,
        sla.reviewed_by,
        sla.reviewed_at,
        sla.review_notes,
        sla.created_at
    FROM student_learning_achievements sla
    WHERE sla.student_profile_id = p_student_profile_id
    AND (p_achievement_type IS NULL OR sla.achievement_type = p_achievement_type)
    ORDER BY sla.achieved_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$;

-- 审核学习收获
CREATE OR REPLACE FUNCTION review_learning_achievement(
    p_achievement_id UUID,
    p_reviewed_by UUID,
    p_review_result VARCHAR(20), -- 'approved' or 'rejected'
    p_review_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE student_learning_achievements 
    SET 
        status = p_review_result,
        reviewed_by = p_reviewed_by,
        reviewed_at = NOW(),
        review_notes = p_review_notes,
        updated_at = NOW()
    WHERE id = p_achievement_id;
    
    RETURN FOUND;
END;
$$;

-- 获取学习收获统计
CREATE OR REPLACE FUNCTION get_achievement_statistics(
    p_student_profile_id UUID
) RETURNS TABLE (
    achievement_type VARCHAR(50),
    total_count INTEGER,
    high_impact_count INTEGER,
    avg_impact_score NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sla.achievement_type,
        COUNT(*) as total_count,
        COUNT(CASE WHEN sla.impact_level IN ('high', 'significant') THEN 1 END) as high_impact_count,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND(
                    AVG(
                        CASE sla.impact_level
                            WHEN 'low' THEN 1
                            WHEN 'medium' THEN 2
                            WHEN 'high' THEN 3
                            WHEN 'significant' THEN 4
                            ELSE 2
                        END
                    ), 2
                )
            ELSE 0
        END as avg_impact_score
    FROM student_learning_achievements sla
    WHERE sla.student_profile_id = p_student_profile_id AND sla.status = 'active'
    GROUP BY sla.achievement_type
    ORDER BY sla.achievement_type;
END;
$$;

-- ==================== 学习成果相关API函数 ====================

-- 获取学生学习成果列表
CREATE OR REPLACE FUNCTION get_student_learning_outcomes(
    p_student_profile_id UUID,
    p_outcome_type VARCHAR(50) DEFAULT NULL,
    p_completion_status VARCHAR(20) DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
    id UUID,
    outcome_title VARCHAR(200),
    outcome_description TEXT,
    outcome_type VARCHAR(50),
    domain VARCHAR(100),
    difficulty_level VARCHAR(20),
    completion_status VARCHAR(20),
    start_date DATE,
    completion_date DATE,
    duration_days INTEGER,
    quality_rating INTEGER,
    innovation_score INTEGER,
    practical_value INTEGER,
    related_course VARCHAR(100),
    related_tags TEXT[],
    demo_url VARCHAR(500),
    github_url VARCHAR(500),
    status VARCHAR(20),
    verified_by UUID,
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        slo.id,
        slo.outcome_title,
        slo.outcome_description,
        slo.outcome_type,
        slo.domain,
        slo.difficulty_level,
        slo.completion_status,
        slo.start_date,
        slo.completion_date,
        slo.duration_days,
        slo.quality_rating,
        slo.innovation_score,
        slo.practical_value,
        slo.related_course,
        slo.related_tags,
        slo.demo_url,
        slo.github_url,
        slo.status,
        slo.verified_by,
        slo.verified_at,
        slo.verification_notes,
        slo.created_at
    FROM student_learning_outcomes slo
    WHERE slo.student_profile_id = p_student_profile_id
    AND (p_outcome_type IS NULL OR slo.outcome_type = p_outcome_type)
    AND (p_completion_status IS NULL OR slo.completion_status = p_completion_status)
    ORDER BY slo.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$;

-- 验证学习成果
CREATE OR REPLACE FUNCTION verify_learning_outcome(
    p_outcome_id UUID,
    p_verified_by UUID,
    p_verification_status VARCHAR(20), -- 'verified' or 'rejected'
    p_verification_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE student_learning_outcomes 
    SET 
        status = p_verification_status,
        verified_by = p_verified_by,
        verified_at = NOW(),
        verification_notes = p_verification_notes,
        updated_at = NOW()
    WHERE id = p_outcome_id;
    
    RETURN FOUND;
END;
$$;

-- 获取学习成果统计
CREATE OR REPLACE FUNCTION get_outcome_statistics(
    p_student_profile_id UUID
) RETURNS TABLE (
    outcome_type VARCHAR(50),
    total_count INTEGER,
    completed_count INTEGER,
    avg_quality_rating NUMERIC,
    avg_innovation_score NUMERIC,
    avg_practical_value NUMERIC,
    high_quality_count INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        slo.outcome_type,
        COUNT(*) as total_count,
        COUNT(CASE WHEN slo.completion_status = 'completed' THEN 1 END) as completed_count,
        ROUND(AVG(slo.quality_rating), 2) as avg_quality_rating,
        ROUND(AVG(slo.innovation_score), 2) as avg_innovation_score,
        ROUND(AVG(slo.practical_value), 2) as avg_practical_value,
        COUNT(CASE WHEN slo.quality_rating >= 4 THEN 1 END) as high_quality_count
    FROM student_learning_outcomes slo
    WHERE slo.student_profile_id = p_student_profile_id AND slo.status = 'active'
    GROUP BY slo.outcome_type
    ORDER BY slo.outcome_type;
END;
$$;

-- ==================== 证明材料相关API函数 ====================

-- 获取学生证明材料列表
CREATE OR REPLACE FUNCTION get_student_proof_materials(
    p_student_profile_id UUID,
    p_material_type VARCHAR(50) DEFAULT NULL,
    p_verification_status VARCHAR(20) DEFAULT NULL,
    p_is_public BOOLEAN DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
    id UUID,
    material_name VARCHAR(200),
    material_type VARCHAR(50),
    material_description TEXT,
    file_name VARCHAR(500),
    file_path VARCHAR(1000),
    file_size BIGINT,
    file_type VARCHAR(50),
    issuing_authority VARCHAR(200),
    issue_date DATE,
    expiry_date DATE,
    credential_id VARCHAR(100),
    related_outcome_id UUID,
    related_achievement_id UUID,
    related_tags TEXT[],
    is_public BOOLEAN,
    access_permissions TEXT[],
    verification_status VARCHAR(20),
    verified_by UUID,
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        spm.id,
        spm.material_name,
        spm.material_type,
        spm.material_description,
        spm.file_name,
        spm.file_path,
        spm.file_size,
        spm.file_type,
        spm.issuing_authority,
        spm.issue_date,
        spm.expiry_date,
        spm.credential_id,
        spm.related_outcome_id,
        spm.related_achievement_id,
        spm.related_tags,
        spm.is_public,
        spm.access_permissions,
        spm.verification_status,
        spm.verified_by,
        spm.verified_at,
        spm.verification_notes,
        spm.created_at
    FROM student_proof_materials spm
    WHERE spm.student_profile_id = p_student_profile_id
    AND (p_material_type IS NULL OR spm.material_type = p_material_type)
    AND (p_verification_status IS NULL OR spm.verification_status = p_verification_status)
    AND (p_is_public IS NULL OR spm.is_public = p_is_public)
    ORDER BY spm.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$;

-- 验证证明材料
CREATE OR REPLACE FUNCTION verify_proof_material(
    p_material_id UUID,
    p_verified_by UUID,
    p_verification_status VARCHAR(20), -- 'verified', 'rejected', or 'expired'
    p_verification_notes TEXT DEFAULT NULL,
    p_rejection_reason TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE student_proof_materials 
    SET 
        verification_status = p_verification_status,
        verified_by = p_verified_by,
        verified_at = NOW(),
        verification_notes = p_verification_notes,
        rejection_reason = p_rejection_reason,
        updated_at = NOW()
    WHERE id = p_material_id;
    
    RETURN FOUND;
END;
$$;

-- 获取证明材料统计
CREATE OR REPLACE FUNCTION get_material_statistics(
    p_student_profile_id UUID
) RETURNS TABLE (
    material_type VARCHAR(50),
    total_count INTEGER,
    verified_count INTEGER,
    pending_count INTEGER,
    rejected_count INTEGER,
    public_count INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        spm.material_type,
        COUNT(*) as total_count,
        COUNT(CASE WHEN spm.verification_status = 'verified' THEN 1 END) as verified_count,
        COUNT(CASE WHEN spm.verification_status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN spm.verification_status = 'rejected' THEN 1 END) as rejected_count,
        COUNT(CASE WHEN spm.is_public = true THEN 1 END) as public_count
    FROM student_proof_materials spm
    WHERE spm.student_profile_id = p_student_profile_id
    GROUP BY spm.material_type
    ORDER BY spm.material_type;
END;
$$;

-- ==================== 综合查询API函数 ====================

-- 获取学生学习完整信息（教师查看用）
CREATE OR REPLACE FUNCTION get_student_complete_learning_info(
    p_student_profile_id UUID
) RETURNS TABLE (
    student_id UUID,
    student_name VARCHAR(200),
    class_name VARCHAR(100),
    
    -- 技术标签汇总
    total_tags INTEGER,
    advanced_tags INTEGER,
    tag_categories TEXT[],
    
    -- 学习收获汇总
    total_achievements INTEGER,
    significant_achievements INTEGER,
    achievement_types TEXT[],
    
    -- 学习成果汇总
    total_outcomes INTEGER,
    completed_outcomes INTEGER,
    high_quality_outcomes INTEGER,
    avg_quality_score NUMERIC,
    outcome_domains TEXT[],
    
    -- 证明材料汇总
    total_materials INTEGER,
    verified_materials INTEGER,
    material_types TEXT[],
    
    -- 时间信息
    last_updated_at TIMESTAMP WITH TIME ZONE,
    total_learning_days INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_student_info RECORD;
    v_first_date DATE;
BEGIN
    -- 获取学生基本信息
    SELECT 
        sp.id,
        COALESCE(sp.full_name, u.full_name, u.username, '未知学生') as full_name,
        COALESCE(sp.class_name, u.class_name, '未分配班级') as class_name
    INTO v_student_info
    FROM student_profiles sp
    LEFT JOIN users u ON sp.user_id = u.id
    WHERE sp.id = p_student_profile_id;
    
    -- 获取最早的学习记录日期
    SELECT LEAST(
        COALESCE(MIN(stt.learned_at), '9999-12-31'::date),
        COALESCE(MIN(sla.achieved_at), '9999-12-31'::date),
        COALESCE(MIN(slo.start_date), '9999-12-31'::date)
    ) INTO v_first_date
    FROM student_technical_tags stt
    FULL OUTER JOIN student_learning_achievements sla ON 1=1
    FULL OUTER JOIN student_learning_outcomes slo ON 1=1
    WHERE stt.student_profile_id = p_student_profile_id AND stt.status = 'active'
       OR sla.student_profile_id = p_student_profile_id AND sla.status = 'active'  
       OR slo.student_profile_id = p_student_profile_id AND slo.status = 'active';
    
    RETURN QUERY
    SELECT 
        v_student_info.id as student_id,
        v_student_info.full_name as student_name,
        v_student_info.class_name as class_name,
        
        -- 技术标签汇总
        COUNT(DISTINCT stt.id) as total_tags,
        COUNT(DISTINCT CASE WHEN stt.proficiency_level IN ('advanced', 'expert') THEN stt.id END) as advanced_tags,
        ARRAY_AGG(DISTINCT stt.tag_category) FILTER (WHERE stt.tag_category IS NOT NULL) as tag_categories,
        
        -- 学习收获汇总
        COUNT(DISTINCT sla.id) as total_achievements,
        COUNT(DISTINCT CASE WHEN sla.impact_level = 'significant' THEN sla.id END) as significant_achievements,
        ARRAY_AGG(DISTINCT sla.achievement_type) FILTER (WHERE sla.achievement_type IS NOT NULL) as achievement_types,
        
        -- 学习成果汇总
        COUNT(DISTINCT slo.id) as total_outcomes,
        COUNT(DISTINCT CASE WHEN slo.completion_status = 'completed' THEN slo.id END) as completed_outcomes,
        COUNT(DISTINCT CASE WHEN slo.quality_rating >= 4 THEN slo.id END) as high_quality_outcomes,
        AVG(slo.quality_rating) as avg_quality_score,
        ARRAY_AGG(DISTINCT slo.domain) FILTER (WHERE slo.domain IS NOT NULL) as outcome_domains,
        
        -- 证明材料汇总
        COUNT(DISTINCT spm.id) as total_materials,
        COUNT(DISTINCT CASE WHEN spm.verification_status = 'verified' THEN spm.id END) as verified_materials,
        ARRAY_AGG(DISTINCT spm.material_type) FILTER (WHERE spm.material_type IS NOT NULL) as material_types,
        
        -- 时间信息
        GREATEST(
            COALESCE(MAX(stt.updated_at), '1970-01-01'::timestamp),
            COALESCE(MAX(sla.updated_at), '1970-01-01'::timestamp),
            COALESCE(MAX(slo.updated_at), '1970-01-01'::timestamp),
            COALESCE(MAX(spm.updated_at), '1970-01-01'::timestamp)
        ) as last_updated_at,
        CASE 
            WHEN v_first_date IS NOT NULL AND v_first_date != '9999-12-31'::date 
            THEN CURRENT_DATE - v_first_date 
            ELSE 0 
        END as total_learning_days
        
    FROM student_profiles sp
    LEFT JOIN users u ON sp.user_id = u.id
    LEFT JOIN student_technical_tags stt ON sp.id = stt.student_profile_id AND stt.status = 'active'
    LEFT JOIN student_learning_achievements sla ON sp.id = sla.student_profile_id AND sla.status = 'active'
    LEFT JOIN student_learning_outcomes slo ON sp.id = slo.student_profile_id AND slo.status = 'active'
    LEFT JOIN student_proof_materials spm ON sp.id = spm.student_profile_id
    WHERE sp.id = p_student_profile_id
    GROUP BY sp.id;
END;
$$;

-- 获取班级学生学习统计（教师查看用）
CREATE OR REPLACE FUNCTION get_class_learning_statistics(
    p_class_name VARCHAR(100)
) RETURNS TABLE (
    student_id UUID,
    student_name VARCHAR(200),
    
    -- 技术标签统计
    total_tags INTEGER,
    advanced_tags_count INTEGER,
    
    -- 学习收获统计
    total_achievements INTEGER,
    high_impact_achievements INTEGER,
    
    -- 学习成果统计
    total_outcomes INTEGER,
    high_quality_outcomes INTEGER,
    avg_quality_rating NUMERIC,
    
    -- 证明材料统计
    total_materials INTEGER,
    verified_materials INTEGER,
    
    -- 综合评分
    learning_score INTEGER, -- 0-100的综合学习评分
    rank_in_class INTEGER -- 班级排名
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH student_stats AS (
        SELECT 
            sp.id,
            COALESCE(sp.full_name, u.full_name, u.username, '未知学生') as full_name,
            COUNT(DISTINCT stt.id) as tags_count,
            COUNT(DISTINCT CASE WHEN stt.proficiency_level IN ('advanced', 'expert') THEN stt.id END) as advanced_tags,
            COUNT(DISTINCT sla.id) as achievements_count,
            COUNT(DISTINCT CASE WHEN sla.impact_level = 'significant' THEN sla.id END) as high_impact,
            COUNT(DISTINCT slo.id) as outcomes_count,
            COUNT(DISTINCT CASE WHEN slo.quality_rating >= 4 THEN slo.id END) as high_quality,
            COALESCE(AVG(slo.quality_rating), 0) as avg_quality,
            COUNT(DISTINCT spm.id) as materials_count,
            COUNT(DISTINCT CASE WHEN spm.verification_status = 'verified' THEN spm.id END) as verified_materials
        FROM student_profiles sp
        LEFT JOIN users u ON sp.user_id = u.id
        LEFT JOIN student_technical_tags stt ON sp.id = stt.student_profile_id AND stt.status = 'active'
        LEFT JOIN student_learning_achievements sla ON sp.id = sla.student_profile_id AND sla.status = 'active'
        LEFT JOIN student_learning_outcomes slo ON sp.id = slo.student_profile_id AND slo.status = 'active'
        LEFT JOIN student_proof_materials spm ON sp.id = spm.student_profile_id AND spm.verification_status = 'verified'
        WHERE sp.class_name = p_class_name OR u.class_name = p_class_name
        GROUP BY sp.id, u.full_name, u.username
    ),
    scored_stats AS (
        SELECT *,
            -- 计算综合学习评分（0-100）
            LEAST(100, 
                (advanced_tags * 8 +              -- 高级技术标签权重高
                 (tags_count - advanced_tags) * 3 + -- 普通技术标签
                 high_impact * 6 +               -- 高影响学习收获
                 (achievements_count - high_impact) * 2 + -- 普通学习收获
                 high_quality * 10 +             -- 高质量学习成果权重最高
                 COALESCE(avg_quality, 0) * 5 +  -- 平均质量评分
                 verified_materials * 4          -- 已验证证明材料
                )
            )::INTEGER as learning_score
        FROM student_stats
    )
    SELECT 
        id as student_id,
        full_name as student_name,
        tags_count as total_tags,
        advanced_tags as advanced_tags_count,
        achievements_count as total_achievements,
        high_impact as high_impact_achievements,
        outcomes_count as total_outcomes,
        high_quality as high_quality_outcomes,
        avg_quality as avg_quality_rating,
        materials_count as total_materials,
        verified_materials as verified_materials,
        learning_score,
        RANK() OVER (ORDER BY learning_score DESC) as rank_in_class
    FROM scored_stats
    ORDER BY rank_in_class;
END;
$$;

-- ==================== 导出功能API函数 ====================

-- 导出学生学习数据为JSON
CREATE OR REPLACE FUNCTION export_student_learning_data(
    p_student_profile_id UUID,
    p_format VARCHAR(10) DEFAULT 'json' -- 'json' or 'csv'
) RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_result TEXT;
BEGIN
    -- 构建完整的学习数据JSON
    SELECT json_build_object(
        'student_info', (
            SELECT json_build_object(
                'id', sp.id,
                'full_name', COALESCE(sp.full_name, u.full_name, u.username, '未知学生'),
                'class_name', COALESCE(sp.class_name, u.class_name, '未分配班级'),
                'student_number', COALESCE(sp.student_number, u.user_number, '')
            ) FROM student_profiles sp
            LEFT JOIN users u ON sp.user_id = u.id
            WHERE sp.id = p_student_profile_id
        ),
        'technical_tags', (
            SELECT json_agg(json_build_object(
                'tag_name', stt.tag_name,
                'category', stt.tag_category,
                'proficiency', stt.proficiency_level,
                'confidence', stt.confidence_score,
                'learning_hours', stt.learning_hours,
                'description', stt.description,
                'learned_at', stt.learned_at
            )) FROM student_technical_tags stt 
            WHERE stt.student_profile_id = p_student_profile_id AND stt.status = 'active'
        ),
        'learning_achievements', (
            SELECT json_agg(json_build_object(
                'title', sla.title,
                'type', sla.achievement_type,
                'content', sla.content,
                'impact_level', sla.impact_level,
                'achieved_at', sla.achieved_at,
                'related_course', sla.related_course,
                'related_project', sla.related_project
            )) FROM student_learning_achievements sla
            WHERE sla.student_profile_id = p_student_profile_id AND sla.status = 'active'
        ),
        'learning_outcomes', (
            SELECT json_agg(json_build_object(
                'title', slo.outcome_title,
                'type', slo.outcome_type,
                'description', slo.outcome_description,
                'domain', slo.domain,
                'quality_rating', slo.quality_rating,
                'innovation_score', slo.innovation_score,
                'practical_value', slo.practical_value,
                'completion_status', slo.completion_status,
                'demo_url', slo.demo_url,
                'github_url', slo.github_url
            )) FROM student_learning_outcomes slo
            WHERE slo.student_profile_id = p_student_profile_id AND slo.status = 'active'
        ),
        'proof_materials', (
            SELECT json_agg(json_build_object(
                'name', spm.material_name,
                'type', spm.material_type,
                'description', spm.material_description,
                'issuing_authority', spm.issuing_authority,
                'issue_date', spm.issue_date,
                'verification_status', spm.verification_status
            )) FROM student_proof_materials spm
            WHERE spm.student_profile_id = p_student_profile_id
        ),
        'exported_at', NOW(),
        'exported_by', current_user
    ) INTO v_result;
    
    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION '导出学生学习数据失败: %', SQLERRM;
END;
$$;

COMMIT;