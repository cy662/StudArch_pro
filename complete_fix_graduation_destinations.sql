-- 完整修复毕业去向表结构和权限问题

-- 1. 检查并确保所有必需字段都存在
ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS proof_files JSONB DEFAULT '[]';

ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS company_type VARCHAR(50);

ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS entry_date DATE;

ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS admission_date DATE;

-- 2. 确保基础字段存在
ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS destination_type VARCHAR(20) NOT NULL;

ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS company_name VARCHAR(100);

ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS position VARCHAR(100);

ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS salary DECIMAL(10,2);

ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS work_location VARCHAR(100);

ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS school_name VARCHAR(100);

ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS major VARCHAR(100);

ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS degree VARCHAR(20);

ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS abroad_country VARCHAR(50);

ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS startup_name VARCHAR(100);

ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS startup_role VARCHAR(50);

ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS other_description TEXT;

ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS submit_time TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id);

ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS review_comment TEXT;

ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS batch_import_id UUID REFERENCES graduation_import_batches(id) ON DELETE SET NULL;

ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. 创建必要的索引
CREATE INDEX IF NOT EXISTS idx_graduation_destinations_student_id ON graduation_destinations(student_id);
CREATE INDEX IF NOT EXISTS idx_graduation_destinations_status ON graduation_destinations(status);
CREATE INDEX IF NOT EXISTS idx_graduation_destinations_type ON graduation_destinations(destination_type);
CREATE INDEX IF NOT EXISTS idx_graduation_destinations_submit_time ON graduation_destinations(submit_time);
CREATE INDEX IF NOT EXISTS idx_graduation_destinations_batch_import ON graduation_destinations(batch_import_id);

-- 4. 确保唯一约束存在
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'unique_student_destination' 
    AND table_name = 'graduation_destinations'
  ) THEN
    ALTER TABLE graduation_destinations 
    ADD CONSTRAINT unique_student_destination UNIQUE (student_id);
  END IF;
END $$;

-- 5. 启用RLS
ALTER TABLE graduation_destinations ENABLE ROW LEVEL SECURITY;

-- 6. 删除可能存在的错误策略
DROP POLICY IF EXISTS "Students can view own graduation destination" ON graduation_destinations;
DROP POLICY IF EXISTS "Students can insert own graduation destination" ON graduation_destinations;
DROP POLICY IF EXISTS "Students can update own graduation destination" ON graduation_destinations;
DROP POLICY IF EXISTS "Teachers can view all graduation destinations" ON graduation_destinations;
DROP POLICY IF EXISTS "Teachers can update all graduation destinations" ON graduation_destinations;

-- 7. 创建正确的RLS策略
-- 学生只能查看自己的毕业去向
CREATE POLICY "Students can view own graduation destination" ON graduation_destinations
    FOR SELECT USING (student_id = auth.uid());

-- 学生可以插入/更新自己的毕业去向
CREATE POLICY "Students can insert own graduation destination" ON graduation_destinations
    FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update own graduation destination" ON graduation_destinations
    FOR UPDATE USING (student_id = auth.uid());

-- 教师可以查看所有学生的毕业去向
CREATE POLICY "Teachers can view all graduation destinations" ON graduation_destinations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = auth.uid() 
            AND r.role_name = 'teacher'
        )
    );

-- 教师可以更新所有学生的毕业去向（包括审核）
CREATE POLICY "Teachers can update all graduation destinations" ON graduation_destinations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = auth.uid() 
            AND r.role_name = 'teacher'
        )
    );

-- 8. 确保触发器存在
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

-- 9. 验证表结构
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'graduation_destinations' 
ORDER BY ordinal_position;