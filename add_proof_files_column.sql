-- 为graduation_destinations表添加proof_files字段

-- 添加proof_files字段
ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS proof_files JSONB DEFAULT '[]';

-- 验证字段是否已添加
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'graduation_destinations' 
AND column_name = 'proof_files';