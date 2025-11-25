-- 确保graduation_destinations表包含所有必需字段

-- 添加缺失的字段
ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS proof_files JSONB DEFAULT '[]';

ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS company_type VARCHAR(50);

ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS entry_date DATE;

ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS admission_date DATE;

-- 确保基础字段存在
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

-- 确保唯一约束存在
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

-- 创建必要的索引
CREATE INDEX IF NOT EXISTS idx_graduation_destinations_student_id ON graduation_destinations(student_id);
CREATE INDEX IF NOT EXISTS idx_graduation_destinations_status ON graduation_destinations(status);
CREATE INDEX IF NOT EXISTS idx_graduation_destinations_type ON graduation_destinations(destination_type);
CREATE INDEX IF NOT EXISTS idx_graduation_destinations_submit_time ON graduation_destinations(submit_time);
CREATE INDEX IF NOT EXISTS idx_graduation_destinations_batch_import ON graduation_destinations(batch_import_id);

-- 启用RLS
ALTER TABLE graduation_destinations ENABLE ROW LEVEL SECURITY;

-- 验证表结构
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'graduation_destinations' 
ORDER BY ordinal_position;