-- 修复外键约束问题的SQL脚本

-- 1. 首先临时禁用外键约束检查
-- 注意：在某些PostgreSQL版本中可能不支持，我们尝试其他方法

-- 2. 删除student_training_programs表中有问题的记录（这些学生ID在users表中不存在）
DELETE FROM student_training_programs 
WHERE student_id IN (
    SELECT sp.student_id 
    FROM student_training_programs sp
    LEFT JOIN users u ON sp.student_id = u.id
    WHERE u.id IS NULL
);

-- 3. 验证清理结果
DO $$
DECLARE
    deleted_count INTEGER;
    remaining_count INTEGER;
BEGIN
    -- 获取删除的记录数（如果上面的DELETE语句执行了）
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- 获取剩余的记录数
    SELECT COUNT(*) INTO remaining_count FROM student_training_programs;
    
    RAISE NOTICE '🧹 清理完成：删除了 %s 条无效记录，剩余 %s 条有效记录', 
                 COALESCE(deleted_count, 0), remaining_count;
    
    -- 验证剩余记录的外键完整性
    IF EXISTS (
        SELECT 1 FROM student_training_programs sp
        LEFT JOIN users u ON sp.student_id = u.id
        WHERE u.id IS NULL
        LIMIT 1
    ) THEN
        RAISE NOTICE '⚠️ 警告：仍有无效的外键记录存在';
    ELSE
        RAISE NOTICE '✅ 所有剩余记录的外键完整性验证通过';
    END IF;
END $$;

-- 4. 测试插入一条有效记录
INSERT INTO student_training_programs (
    student_id, 
    program_id, 
    enrollment_date, 
    status, 
    created_at, 
    updated_at
) VALUES (
    'db888c86-eb18-4c5d-819a-d59f0d223adc',
    '62b2cc69-5b10-4238-8232-59831cdb7964',
    CURRENT_DATE,
    'active',
    NOW(),
    NOW()
)
ON CONFLICT (student_id, program_id) DO NOTHING
RETURNING '✅ 测试插入成功' as result;