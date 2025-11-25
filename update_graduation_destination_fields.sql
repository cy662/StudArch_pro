-- 更新毕业去向表结构，添加缺失的字段
-- 此脚本用于添加前端表单中使用但数据库中缺失的字段

-- 添加单位性质字段
ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS company_type VARCHAR(50);

-- 添加入职时间字段
ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS entry_date DATE;

-- 添加入学时间字段
ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS admission_date DATE;

-- 添加注释说明字段用途
COMMENT ON COLUMN graduation_destinations.company_type IS '单位性质: state-owned(国有企业), private(民营企业), foreign(外资企业), government(政府机关), institution(事业单位), other(其他)';
COMMENT ON COLUMN graduation_destinations.entry_date IS '入职时间';
COMMENT ON COLUMN graduation_destinations.admission_date IS '入学时间';

-- 更新RLS策略以确保学生可以查看和更新自己的毕业去向
DROP POLICY IF EXISTS "Students can insert own graduation destination" ON graduation_destinations;
DROP POLICY IF EXISTS "Students can update own graduation destination" ON graduation_destinations;

CREATE POLICY "Students can insert own graduation destination" ON graduation_destinations
    FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update own graduation destination" ON graduation_destinations
    FOR UPDATE USING (student_id = auth.uid());

-- 确保触发器存在以自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建或更新触发器
DROP TRIGGER IF EXISTS update_graduation_destinations_updated_at 
ON graduation_destinations;

CREATE TRIGGER update_graduation_destinations_updated_at 
    BEFORE UPDATE ON graduation_destinations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();