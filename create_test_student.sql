-- 创建测试学生数据
INSERT INTO student_profiles (id, user_id, student_number, full_name, class_name)
VALUES (
    '17f90235-0ae6-47c7-9fcb-d57cbc3a6339',
    '123e4567-e89b-12d3-a456-426614174000',
    '2021001',
    '张三',
    '计算机科学与技术1班'
);

-- 查看创建的测试数据
SELECT * FROM student_profiles WHERE id = '17f90235-0ae6-47c7-9fcb-d57cbc3a6339';
