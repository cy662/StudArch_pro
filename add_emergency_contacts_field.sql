-- 添加紧急联系人JSON字段到student_profiles表
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS emergency_contacts_json TEXT;

-- 添加字段注释
COMMENT ON COLUMN student_profiles.emergency_contacts_json IS '紧急联系人JSON数组，存储多个紧急联系人信息';

-- 验证字段添加是否成功
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'student_profiles' 
AND column_name = 'emergency_contacts_json'
ORDER BY column_name;