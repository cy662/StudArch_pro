-- 刷新毕业去向表结构以解决schema缓存问题
-- 此脚本用于确保所有字段都正确存在于表中，并刷新Supabase的schema缓存

-- 首先检查并添加proof_files字段（如果不存在）
ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS proof_files JSONB DEFAULT '[]';

-- 确保其他可能缺失的字段也存在
ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS company_type VARCHAR(50);

ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS entry_date DATE;

ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS admission_date DATE;

-- 刷新表的schema信息
-- 注意：在Supabase中，有时需要重新部署或等待一段时间让schema缓存更新
-- 如果问题仍然存在，可以尝试在Supabase Dashboard中手动刷新schema

-- 重新创建索引以确保它们存在
CREATE INDEX IF NOT EXISTS idx_graduation_destinations_student_id ON graduation_destinations(student_id);
CREATE INDEX IF NOT EXISTS idx_graduation_destinations_status ON graduation_destinations(status);
CREATE INDEX IF NOT EXISTS idx_graduation_destinations_type ON graduation_destinations(destination_type);
CREATE INDEX IF NOT EXISTS idx_graduation_destinations_submit_time ON graduation_destinations(submit_time);

-- 确保RLS策略存在
ALTER TABLE graduation_destinations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can view own graduation destination" ON graduation_destinations;
CREATE POLICY "Students can view own graduation destination" ON graduation_destinations
    FOR SELECT USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Students can insert own graduation destination" ON graduation_destinations;
CREATE POLICY "Students can insert own graduation destination" ON graduation_destinations
    FOR INSERT WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Students can update own graduation destination" ON graduation_destinations;
CREATE POLICY "Students can update own graduation destination" ON graduation_destinations
    FOR UPDATE USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Teachers can view all graduation destinations" ON graduation_destinations;
CREATE POLICY "Teachers can view all graduation destinations" ON graduation_destinations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'teacher'
        )
    );

DROP POLICY IF EXISTS "Teachers can update all graduation destinations" ON graduation_destinations;
CREATE POLICY "Teachers can update all graduation destinations" ON graduation_destinations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'teacher'
        )
    );

-- 确保触发器存在
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_graduation_destinations_updated_at 
ON graduation_destinations;

CREATE TRIGGER update_graduation_destinations_updated_at 
    BEFORE UPDATE ON graduation_destinations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 验证表结构
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'graduation_destinations' 
ORDER BY ordinal_position;