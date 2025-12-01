-- 修复外键约束问题
-- 由于 profiles 表不存在，我们需要移除或修改相关的外键约束

-- 1. 删除 student_training_programs 表的 teacher_id 外键约束
ALTER TABLE student_training_programs DROP CONSTRAINT IF EXISTS student_training_programs_teacher_id_fkey;

-- 2. 删除 student_training_programs 表的 student_id 外键约束（如果存在）
ALTER TABLE student_training_programs DROP CONSTRAINT IF EXISTS student_training_programs_student_id_fkey;

-- 3. 删除 student_training_programs 表的 program_id 外键约束（如果存在）
ALTER TABLE student_training_programs DROP CONSTRAINT IF EXISTS student_training_programs_program_id_fkey;

-- 4. 重新添加必要的外键约束（只添加存在的）
-- 添加 student_id 外键（引用 student_profiles 表）
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_profiles') THEN
        ALTER TABLE student_training_programs 
        ADD CONSTRAINT student_training_programs_student_id_fkey 
        FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE;
    END IF;
END
$$;

-- 添加 program_id 外键（引用 training_programs 表）
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'training_programs') THEN
        ALTER TABLE student_training_programs 
        ADD CONSTRAINT student_training_programs_program_id_fkey 
        FOREIGN KEY (program_id) REFERENCES training_programs(id) ON DELETE CASCADE;
    END IF;
END
$$;

-- 不添加 teacher_id 外键约束，因为 profiles 表不存在

COMMIT;