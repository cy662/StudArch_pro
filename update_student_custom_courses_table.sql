-- 更新学生自定义课程表，添加课程代码和课程性质字段
-- 注意：此脚本应在数据库中执行以添加新字段

-- 添加课程代码字段
ALTER TABLE student_custom_courses 
ADD COLUMN IF NOT EXISTS course_code VARCHAR(20);

-- 添加课程性质字段（必修课/选修课）
ALTER TABLE student_custom_courses 
ADD COLUMN IF NOT EXISTS course_nature VARCHAR(20) DEFAULT '选修课' 
CHECK (course_nature IN ('必修课', '选修课'));

-- 更新现有记录的课程性质默认值（如果需要）
UPDATE student_custom_courses 
SET course_nature = '选修课' 
WHERE course_nature IS NULL;

-- 创建索引以提高查询性能（如果尚未存在）
CREATE INDEX IF NOT EXISTS idx_student_custom_courses_course_code 
ON student_custom_courses(course_code);

-- 显示表结构确认更改
-- \d student_custom_courses;