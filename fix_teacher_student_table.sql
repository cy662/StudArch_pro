-- 1. 创建教师学生关系表
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

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_teacher_student_relationships_teacher_id ON teacher_student_relationships(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_student_relationships_student_id ON teacher_student_relationships(student_id);

-- 3. 插入一些测试关系数据
INSERT INTO teacher_student_relationships (teacher_id, student_id)
VALUES 
    ('00000000-0000-0000-0000-000000000001', '89e41fee-a388-486f-bbb2-320c4e115ee1'),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002')
ON CONFLICT (teacher_id, student_id) DO NOTHING;

-- 4. 禁用RLS
ALTER TABLE teacher_student_relationships DISABLE ROW LEVEL SECURITY;

-- 5. 授权
GRANT ALL ON teacher_student_relationships TO authenticated;
GRANT SELECT ON teacher_student_relationships TO anon;

-- 6. 显示创建结果
SELECT 
    'teacher_student_relationships表创建完成' as status,
    COUNT(*) as relationship_count
FROM teacher_student_relationships 
WHERE teacher_id = '00000000-0000-0000-0000-000000000001';