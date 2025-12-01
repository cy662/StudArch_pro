-- 1. 先检查实际存在的用户
SELECT '检查现有用户' as step, id, full_name, user_number 
FROM users 
WHERE role_id = '3' 
LIMIT 5;

-- 2. 创建教师学生关系表（如果还没有）
CREATE TABLE IF NOT EXISTS teacher_student_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) DEFAULT 'teacher_student',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 确保同一教师不会重复关联同一学生
    UNIQUE(teacher_id, student_id)
);

-- 3. 创建索引
CREATE INDEX IF NOT EXISTS idx_teacher_student_relationships_teacher_id ON teacher_student_relationships(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_student_relationships_student_id ON teacher_student_relationships(student_id);

-- 4. 只使用实际存在的学生ID
-- 插入关系时先检查学生是否存在
INSERT INTO teacher_student_relationships (teacher_id, student_id)
SELECT '00000000-0000-0000-0000-000000000001' as teacher_id, id as student_id
FROM users 
WHERE role_id = '3'  -- 学生角色
AND id IN ('89e41fee-a388-486f-bbb2-320c4e115ee1')  -- 使用前端显示的学生ID
LIMIT 3
ON CONFLICT (teacher_id, student_id) DO NOTHING;

-- 5. 禁用RLS
ALTER TABLE teacher_student_relationships DISABLE ROW LEVEL SECURITY;

-- 6. 授权
GRANT ALL ON teacher_student_relationships TO authenticated;
GRANT SELECT ON teacher_student_relationships TO anon;

-- 7. 显示结果
SELECT 
    'teacher_student_relationships表创建完成' as status,
    COUNT(*) as relationship_count
FROM teacher_student_relationships 
WHERE teacher_id = '00000000-0000-0000-0000-000000000001';