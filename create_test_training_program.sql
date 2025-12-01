-- 创建测试用的培养方案和课程数据

-- 1. 创建测试培养方案
INSERT INTO training_programs (
    id,
    program_name,
    program_code,
    major,
    department,
    total_credits,
    duration_years,
    description,
    status,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    '计算机科学与技术培养方案',
    'CS_2021',
    '计算机科学与技术',
    '计算机学院',
    160,
    4,
    '培养具备计算机科学与技术专业知识和实践能力的高级专门人才',
    'active',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 2. 创建测试课程
INSERT INTO training_program_courses (
    id,
    program_id,
    course_number,
    course_name,
    credits,
    recommended_grade,
    semester,
    exam_method,
    course_nature,
    course_type,
    teaching_hours,
    theory_hours,
    practice_hours,
    weekly_hours,
    sequence_order,
    status,
    created_at,
    updated_at
) VALUES 
-- 大一第一学期
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'CS101', '计算机导论', 3, '大一', '第一学期', '笔试', '必修课', '专业基础课', 48, 32, 16, 3, 1, 'active', NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'MATH101', '高等数学I', 4, '大一', '第一学期', '笔试', '必修课', '基础课', 64, 64, 0, 4, 2, 'active', NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'ENG101', '大学英语I', 3, '大一', '第一学期', '笔试', '必修课', '基础课', 48, 32, 16, 3, 3, 'active', NOW(), NOW()),

-- 大一第二学期
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'CS102', '程序设计基础', 4, '大一', '第二学期', '上机考试', '必修课', '专业基础课', 64, 32, 32, 4, 4, 'active', NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'MATH102', '高等数学II', 4, '大一', '第二学期', '笔试', '必修课', '基础课', 64, 64, 0, 4, 5, 'active', NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'ENG102', '大学英语II', 3, '大一', '第二学期', '笔试', '必修课', '基础课', 48, 32, 16, 3, 6, 'active', NOW(), NOW()),

-- 大二第一学期
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'CS201', '数据结构', 4, '大二', '第一学期', '笔试', '必修课', '专业核心课', 64, 48, 16, 4, 7, 'active', NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'CS202', '离散数学', 3, '大二', '第一学期', '笔试', '必修课', '专业基础课', 48, 48, 0, 3, 8, 'active', NOW(), NOW()),

-- 大二第二学期
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'CS203', '算法设计与分析', 4, '大二', '第二学期', '笔试', '必修课', '专业核心课', 64, 48, 16, 4, 9, 'active', NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'CS204', '操作系统', 4, '大二', '第二学期', '笔试', '必修课', '专业核心课', 64, 48, 16, 4, 10, 'active', NOW(), NOW())

ON CONFLICT DO NOTHING;

-- 3. 显示创建结果
SELECT 
    '培养方案创建完成' as status,
    tp.program_name,
    tp.program_code,
    COUNT(tpc.id) as course_count,
    SUM(tpc.credits) as total_credits
FROM training_programs tp
LEFT JOIN training_program_courses tpc ON tp.id = tpc.program_id
WHERE tp.id = '00000000-0000-0000-0000-000000000001'
GROUP BY tp.id, tp.program_name, tp.program_code;