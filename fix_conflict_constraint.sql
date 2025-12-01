-- 方法1：添加唯一约束（推荐）
ALTER TABLE student_training_programs 
ADD CONSTRAINT student_training_programs_student_id_key 
UNIQUE (student_id);

-- 如果上面的约束已存在，可以用这个替代方案
-- 删除可能存在的重复约束，然后重新创建
-- ALTER TABLE student_training_programs DROP CONSTRAINT IF EXISTS student_training_programs_student_id_key;
-- ALTER TABLE student_training_programs ADD CONSTRAINT student_training_programs_student_id_key UNIQUE (student_id);