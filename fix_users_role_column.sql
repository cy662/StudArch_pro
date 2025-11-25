-- 修复毕业去向表中引用users.role字段的错误
-- 项目实际使用role_id字段关联roles表获取角色信息

-- 首先检查并确保users表中存在role_id字段
ALTER TABLE graduation_destinations 
ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- 更新RLS策略以使用正确的字段
ALTER TABLE graduation_destinations ENABLE ROW LEVEL SECURITY;

-- 删除可能存在的错误策略
DROP POLICY IF EXISTS "Teachers can view all graduation destinations" ON graduation_destinations;
DROP POLICY IF EXISTS "Students can view own graduation destination" ON graduation_destinations;
DROP POLICY IF EXISTS "Students can insert own graduation destination" ON graduation_destinations;
DROP POLICY IF EXISTS "Students can update own graduation destination" ON graduation_destinations;
DROP POLICY IF EXISTS "Teachers can update all graduation destinations" ON graduation_destinations;

-- 创建正确的RLS策略，使用role_id关联roles表
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

-- 学生只能查看自己的毕业去向
CREATE POLICY "Students can view own graduation destination" ON graduation_destinations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = student_id
            AND r.role_name = 'student'
        )
    );

-- 学生可以插入/更新自己的毕业去向
CREATE POLICY "Students can insert own graduation destination" ON graduation_destinations
    FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update own graduation destination" ON graduation_destinations
    FOR UPDATE USING (student_id = auth.uid());

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
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'graduation_destinations' 
ORDER BY ordinal_position;