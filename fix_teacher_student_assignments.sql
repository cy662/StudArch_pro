-- 创建教师学生关联表
CREATE TABLE IF NOT EXISTS teacher_student_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    assignment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(teacher_id, student_id)
);

-- 禁用RLS策略以确保API正常访问
ALTER TABLE teacher_student_assignments DISABLE ROW LEVEL SECURITY;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_teacher_student_assignments_teacher_id ON teacher_student_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_student_assignments_student_id ON teacher_student_assignments(student_id);

-- 插入一些测试数据（如果不存在）
INSERT INTO teacher_student_assignments (teacher_id, student_id, notes)
SELECT 
    '00000000-0000-0000-0000-000000000001',
    sp.id,
    '测试教师-学生关联'
FROM student_profiles sp
WHERE sp.id NOT IN (
    SELECT student_id 
    FROM teacher_student_assignments 
    WHERE teacher_id = '00000000-0000-0000-0000-000000000001'
)
LIMIT 5
ON CONFLICT (teacher_id, student_id) DO NOTHING;

-- 更新updated_at触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_teacher_student_assignments_updated_at
    BEFORE UPDATE ON teacher_student_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;