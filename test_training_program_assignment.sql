-- 测试培养方案分配功能的SQL脚本
-- 这个脚本用于设置测试数据并验证整个分配-显示流程

-- 1. 确保所有必要的表都存在
\echo '正在检查数据库表结构...'

-- 2. 确保RLS已禁用
\echo '正在禁用RLS策略...'
ALTER TABLE training_programs DISABLE ROW LEVEL SECURITY;
ALTER TABLE training_program_courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_training_programs DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_course_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_student_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles DISABLE ROW LEVEL SECURITY;

-- 3. 创建测试数据（如果不存在）
\echo '正在创建测试数据...'

-- 确保默认培养方案存在
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
    gen_random_uuid(),
    '计算机科学与技术培养方案（2024版）',
    'CS_2024',
    '计算机科学与技术',
    '计算机学院',
    160,
    4,
    '计算机科学与技术专业本科培养方案，包含专业基础课程、专业核心课程和专业选修课程。',
    'active',
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- 获取培养方案ID
DO $$
DECLARE
    program_uuid UUID;
    test_student_uuid UUID;
    test_teacher_uuid UUID;
BEGIN
    -- 获取或创建培养方案
    SELECT id INTO program_uuid FROM training_programs WHERE program_code = 'CS_2024' LIMIT 1;
    
    IF program_uuid IS NULL THEN
        RAISE NOTICE '未找到测试用的培养方案';
        RETURN;
    END IF;
    
    -- 获取测试学生ID
    SELECT id INTO test_student_uuid FROM student_profiles LIMIT 1;
    
    -- 获取测试教师ID
    SELECT id INTO test_teacher_uuid FROM users WHERE role_id = '2' LIMIT 1;
    
    -- 插入测试课程（如果还没有课程）
    INSERT INTO training_program_courses (
        program_id,
        course_number,
        course_name,
        credits,
        recommended_grade,
        semester,
        exam_method,
        course_nature,
        course_type,
        sequence_order,
        status,
        created_at,
        updated_at
    ) VALUES
        (program_uuid, 'CS101', '计算机基础', 3, '大一', '第一学期', '笔试', '必修课', 'required', 1, 'active', NOW(), NOW()),
        (program_uuid, 'CS102', '程序设计基础', 4, '大一', '第一学期', '上机考试', '必修课', 'required', 2, 'active', NOW(), NOW()),
        (program_uuid, 'MATH101', '高等数学', 4, '大一', '第一学期', '笔试', '必修课', 'required', 3, 'active', NOW(), NOW()),
        (program_uuid, 'CS201', '数据结构', 4, '大二', '第一学期', '笔试', '必修课', 'required', 4, 'active', NOW(), NOW()),
        (program_uuid, 'CS202', 'Web前端开发', 3, '大二', '第二学期', '项目作业', '必修课', 'required', 5, 'active', NOW(), NOW()),
        (program_uuid, 'CS301', '软件工程', 3, '大三', '第一学期', '项目设计', '必修课', 'required', 6, 'active', NOW(), NOW()),
        (program_uuid, 'CS302', '数据库系统', 3, '大三', '第二学期', '上机考试', '必修课', 'required', 7, 'active', NOW(), NOW()),
        (program_uuid, 'CS401', '毕业设计', 8, '大四', '全年', '答辩', '必修课', 'required', 8, 'active', NOW(), NOW())
    ON CONFLICT (program_id, course_number) DO NOTHING;
    
    -- 测试单学生分配功能
    IF test_student_uuid IS NOT NULL AND program_uuid IS NOT NULL THEN
        -- 删除旧的分配（如果存在）
        DELETE FROM student_training_programs 
        WHERE student_id = test_student_uuid AND program_id = program_uuid;
        
        -- 删除旧的课程进度（如果存在）
        DELETE FROM student_course_progress 
        WHERE student_id = test_student_uuid 
        AND course_id IN (SELECT id FROM training_program_courses WHERE program_id = program_uuid);
        
        -- 测试分配培养方案
        INSERT INTO student_training_programs (
            student_id,
            program_id,
            enrollment_date,
            status,
            notes,
            created_at,
            updated_at
        ) VALUES (
            test_student_uuid,
            program_uuid,
            CURRENT_DATE,
            'active',
            '测试分配',
            NOW(),
            NOW()
        );
        
        -- 初始化课程进度
        INSERT INTO student_course_progress (
            student_id,
            course_id,
            status,
            created_at,
            updated_at
        )
        SELECT 
            test_student_uuid,
            tpc.id,
            CASE 
                WHEN tpc.sequence_order <= 2 THEN 'in_progress'
                ELSE 'not_started'
            END,
            NOW(),
            NOW()
        FROM training_program_courses tpc
        WHERE tpc.program_id = program_uuid AND tpc.status = 'active'
        ON CONFLICT (student_id, course_id) DO NOTHING;
        
        RAISE NOTICE '✅ 测试学生分配完成，学生ID: %, 培养方案ID: %', test_student_uuid, program_uuid;
    END IF;
    
END $$;

-- 4. 验证数据设置
\echo '验证数据设置结果：'

SELECT 
    'training_programs 表记录数: ' || COUNT(*) as info 
FROM training_programs
WHERE status = 'active'
UNION ALL
SELECT 
    'training_program_courses 表记录数: ' || COUNT(*) as info 
FROM training_program_courses
WHERE status = 'active'
UNION ALL
SELECT 
    'student_training_programs 表记录数: ' || COUNT(*) as info 
FROM student_training_programs
WHERE status = 'active'
UNION ALL
SELECT 
    'student_course_progress 表记录数: ' || COUNT(*) as info 
FROM student_course_progress;

-- 5. 测试函数调用
\echo '测试数据库函数调用：'

-- 测试获取学生培养方案课程
DO $$
DECLARE
    test_student_uuid UUID;
    result JSONB;
BEGIN
    -- 获取一个测试学生
    SELECT id INTO test_student_uuid FROM student_profiles LIMIT 1;
    
    IF test_student_uuid IS NOT NULL THEN
        -- 测试函数调用
        SELECT get_student_training_program_courses(test_student_uuid) INTO result;
        
        RAISE NOTICE '✅ get_student_training_program_courses 函数测试成功';
        RAISE NOTICE '返回数据: %', result;
        
        -- 显示课程数量
        IF jsonb_typeof(result) = 'array' THEN
            RAISE NOTICE '📚 学生分配到的课程数量: %', jsonb_array_length(result);
        ELSE
            RAISE NOTICE '⚠️ 返回数据不是数组格式';
        END IF;
    ELSE
        RAISE NOTICE '❌ 未找到测试学生，无法测试函数';
    END IF;
END $$;

-- 6. 提供测试用的学生ID和教师ID
\echo ''
\echo '=== 测试信息 ==='
\echo '以下是一些可用于测试的ID：'

SELECT 
    '测试学生ID: ' || id as test_info,
    full_name
FROM student_profiles 
LIMIT 3;

SELECT 
    '测试教师ID: ' || id as test_info,
    full_name
FROM users 
WHERE role_id = '2' -- 教师角色
LIMIT 3;

SELECT 
    '测试培养方案ID: ' || id as test_info,
    program_name,
    program_code
FROM training_programs 
WHERE status = 'active'
LIMIT 3;

\echo ''
\echo '=== API测试端点 ==='
\echo 'GET  /api/student/{studentId}/training-program-courses - 获取学生培养方案课程'
\echo 'POST /api/teacher/{teacherId}/batch-assign-training-program - 批量分配培养方案'
\echo 'GET  /api/training-programs - 获取培养方案列表'
\echo ''
\echo '=== 测试步骤 ==='
\echo '1. 启动API服务器: node server.js'
\echo '2. 教师登录系统，选择学生并分配培养方案'
\echo '3. 学生登录系统，查看"教学任务与安排"页面'
\echo '4. 验证课程是否正确显示'

COMMIT;