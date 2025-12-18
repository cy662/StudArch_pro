-- 创建获取教师管理的毕业去向数据的数据库函数
CREATE OR REPLACE FUNCTION get_teacher_graduation_destinations(
    p_teacher_id UUID,
    p_destination_type TEXT DEFAULT NULL,
    p_status TEXT DEFAULT NULL,
    p_student_name TEXT DEFAULT NULL,
    p_page INTEGER DEFAULT 1,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    student_id UUID,
    destination_type TEXT,
    status TEXT,
    review_comment TEXT,
    submit_time TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    student_number TEXT,
    student_full_name TEXT,
    class_name TEXT,
    total_count BIGINT
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
    WITH teacher_students_filtered AS (
        -- 获取该教师管理的学生ID
        SELECT DISTINCT student_id
        FROM teacher_students
        WHERE teacher_id = p_teacher_id
    ),
    graduation_filtered AS (
        -- 过滤毕业去向数据
        SELECT 
            gd.*,
            (SELECT COUNT(*) FROM graduation_destinations gdf 
             WHERE gdf.student_id IN (SELECT student_id FROM teacher_students_filtered)
             AND (p_destination_type IS NULL OR gdf.destination_type = p_destination_type)
             AND (p_status IS NULL OR gdf.status = p_status)
             AND (p_student_name IS NULL OR EXISTS (
                 SELECT 1 FROM users u 
                 WHERE u.id = gdf.student_id 
                 AND (u.full_name ILIKE '%' || p_student_name || '%' OR u.user_number ILIKE '%' || p_student_name || '%')
             ))
            ) AS total_count
        FROM graduation_destinations gd
        WHERE gd.student_id IN (SELECT student_id FROM teacher_students_filtered)
        AND (p_destination_type IS NULL OR gd.destination_type = p_destination_type)
        AND (p_status IS NULL OR gd.status = p_status)
        AND (p_student_name IS NULL OR EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = gd.student_id 
            AND (u.full_name ILIKE '%' || p_student_name || '%' OR u.user_number ILIKE '%' || p_student_name || '%')
        ))
        ORDER BY gd.created_at DESC
        LIMIT p_limit OFFSET ((p_page - 1) * p_limit)
    )
    SELECT 
        gf.id,
        gf.student_id,
        gf.destination_type,
        gf.status,
        gf.review_comment,
        gf.submit_time,
        gf.reviewed_at,
        gf.created_at,
        gf.updated_at,
        u.user_number AS student_number,
        u.full_name AS student_full_name,
        u.class_name,
        gf.total_count
    FROM graduation_filtered gf
    LEFT JOIN users u ON u.id = gf.student_id;
$$;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_teacher_students_teacher_id ON teacher_students(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_students_student_id ON teacher_students(student_id);
CREATE INDEX IF NOT EXISTS idx_graduation_destinations_student_id ON graduation_destinations(student_id);
CREATE INDEX IF NOT EXISTS idx_graduation_destinations_type_status ON graduation_destinations(destination_type, status);
CREATE INDEX IF NOT EXISTS idx_graduation_destinations_created_at ON graduation_destinations(created_at DESC);

-- 创建RLS策略以确保数据安全
DROP POLICY IF EXISTS "teachers_can_view_own_students_graduation" ON graduation_destinations;
CREATE POLICY "teachers_can_view_own_students_graduation" ON graduation_destinations
    FOR SELECT USING (
        student_id IN (
            SELECT student_id FROM teacher_students 
            WHERE teacher_id = auth.uid()
        )
    );

-- 创建更新策略确保教师只能更新自己管理的学生数据
DROP POLICY IF EXISTS "teachers_can_update_own_students_graduation" ON graduation_destinations;
CREATE POLICY "teachers_can_update_own_students_graduation" ON graduation_destinations
    FOR UPDATE USING (
        student_id IN (
            SELECT student_id FROM teacher_students 
            WHERE teacher_id = auth.uid()
        )
    );

-- 创建删除策略确保教师只能删除自己管理的学生数据
DROP POLICY IF EXISTS "teachers_can_delete_own_students_graduation" ON graduation_destinations;
CREATE POLICY "teachers_can_delete_own_students_graduation" ON graduation_destinations
    FOR DELETE USING (
        student_id IN (
            SELECT student_id FROM teacher_students 
            WHERE teacher_id = auth.uid()
        )
    );

-- 创建审计日志表来记录数据访问
CREATE TABLE IF NOT EXISTS graduation_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL,
    student_id UUID NOT NULL,
    graduation_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('view', 'update', 'delete')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- 创建审计日志的RLS策略
ALTER TABLE graduation_access_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teachers_can_log_own_access" ON graduation_access_log;
CREATE POLICY "teachers_can_log_own_access" ON graduation_access_log
    FOR ALL USING (teacher_id = auth.uid());

-- 创建触发器自动记录访问日志
CREATE OR REPLACE FUNCTION log_graduation_access()
RETURNS TRIGGER AS $$
BEGIN
    -- 记录访问日志（仅在有认证用户时）
    IF auth.uid() IS NOT NULL THEN
        INSERT INTO graduation_access_log (teacher_id, student_id, graduation_id, action, metadata)
        VALUES (
            auth.uid(),
            NEW.student_id,
            NEW.id,
            TG_OP,
            jsonb_build_object(
                'old_data', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
                'new_data', row_to_json(NEW)
            )
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS graduation_access_trigger ON graduation_destinations;
CREATE TRIGGER graduation_access_trigger
    AFTER INSERT OR UPDATE OR DELETE ON graduation_destinations
    FOR EACH ROW EXECUTE FUNCTION log_graduation_access();

-- 授予必要的权限
GRANT EXECUTE ON FUNCTION get_teacher_graduation_destinations TO authenticated;
GRANT SELECT ON graduation_access_log TO authenticated;