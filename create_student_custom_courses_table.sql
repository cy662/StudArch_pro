-- 创建学生自定义课程表
CREATE TABLE IF NOT EXISTS student_custom_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    course_code VARCHAR(20), -- 课程代码
    course_name VARCHAR(200) NOT NULL,
    credits INTEGER DEFAULT 1,
    course_nature VARCHAR(20) DEFAULT '选修课' CHECK (course_nature IN ('必修课', '选修课')), -- 课程性质
    teacher VARCHAR(100) DEFAULT '自填课程',
    description TEXT,
    semester VARCHAR(20) DEFAULT '2024-2',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_student_custom_courses_student_id ON student_custom_courses(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_student_custom_courses_status ON student_custom_courses(status);
CREATE INDEX IF NOT EXISTS idx_student_custom_courses_semester ON student_custom_courses(semester);

-- 创建RLS策略（如果需要行级安全）
ALTER TABLE student_custom_courses ENABLE ROW LEVEL SECURITY;

-- 学生只能查看自己的自定义课程
CREATE POLICY "Students can view own custom courses" ON student_custom_courses
    FOR SELECT USING (
        auth.uid()::text = (
            SELECT user_id::text 
            FROM student_profiles 
            WHERE student_profiles.id = student_custom_courses.student_profile_id
        )
    );

-- 学生只能插入自己的自定义课程
CREATE POLICY "Students can insert own custom courses" ON student_custom_courses
    FOR INSERT WITH CHECK (
        auth.uid()::text = (
            SELECT user_id::text 
            FROM student_profiles 
            WHERE student_profiles.id = student_custom_courses.student_profile_id
        )
    );

-- 学生只能更新自己的自定义课程
CREATE POLICY "Students can update own custom courses" ON student_custom_courses
    FOR UPDATE USING (
        auth.uid()::text = (
            SELECT user_id::text 
            FROM student_profiles 
            WHERE student_profiles.id = student_custom_courses.student_profile_id
        )
    );

-- 学生只能删除自己的自定义课程
CREATE POLICY "Students can delete own custom courses" ON student_custom_courses
    FOR DELETE USING (
        auth.uid()::text = (
            SELECT user_id::text 
            FROM student_profiles 
            WHERE student_profiles.id = student_custom_courses.student_profile_id
        )
    );

-- 创建更新时间戳的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_student_custom_courses_updated_at 
    BEFORE UPDATE ON student_custom_courses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();