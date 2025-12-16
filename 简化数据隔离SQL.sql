-- ===== 简化版教师毕业去向数据隔离SQL =====
-- 分步执行，避免复杂语法错误

-- 步骤1: 创建数据库函数
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
        SELECT DISTINCT student_id
        FROM teacher_students
        WHERE teacher_id = p_teacher_id
    ),
    graduation_filtered AS (
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

-- 步骤2: 创建索引提高性能
CREATE INDEX IF NOT EXISTS idx_teacher_students_teacher_id ON teacher_students(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_students_student_id ON teacher_students(student_id);
CREATE INDEX IF NOT EXISTS idx_graduation_destinations_student_id ON graduation_destinations(student_id);
CREATE INDEX IF NOT EXISTS idx_graduation_destinations_type_status ON graduation_destinations(destination_type, status);
CREATE INDEX IF NOT EXISTS idx_graduation_destinations_created_at ON graduation_destinations(created_at DESC);

-- 步骤3: 设置RLS策略 (先确保表启用了RLS)
ALTER TABLE graduation_destinations ENABLE ROW LEVEL SECURITY;

-- 删除旧策略
DROP POLICY IF EXISTS "teachers_can_view_own_students_graduation" ON graduation_destinations;
DROP POLICY IF EXISTS "teachers_can_update_own_students_graduation" ON graduation_destinations;
DROP POLICY IF EXISTS "teachers_can_delete_own_students_graduation" ON graduation_destinations;

-- 创建新策略
CREATE POLICY "teachers_can_view_own_students_graduation" ON graduation_destinations
    FOR SELECT USING (
        student_id IN (
            SELECT student_id FROM teacher_students 
            WHERE teacher_id = auth.uid()
        )
    );

CREATE POLICY "teachers_can_update_own_students_graduation" ON graduation_destinations
    FOR UPDATE USING (
        student_id IN (
            SELECT student_id FROM teacher_students 
            WHERE teacher_id = auth.uid()
        )
    );

CREATE POLICY "teachers_can_delete_own_students_graduation" ON graduation_destinations
    FOR DELETE USING (
        student_id IN (
            SELECT student_id FROM teacher_students 
            WHERE teacher_id = auth.uid()
        )
    );

-- 步骤4: 授予权限
GRANT EXECUTE ON FUNCTION get_teacher_graduation_destinations TO authenticated;

-- 完成！
SELECT 'Data isolation setup completed successfully!' as result;