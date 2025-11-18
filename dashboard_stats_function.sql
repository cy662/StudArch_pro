-- 仪表板统计数据函数
-- 在Supabase SQL Editor中执行此脚本

-- 创建仪表板统计数据函数
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_users INTEGER;
    total_students INTEGER;
    total_teachers INTEGER;
    user_growth_rate DECIMAL(5,2);
    student_growth_rate DECIMAL(5,2);
    teacher_growth_rate DECIMAL(5,2);
    last_month_total INTEGER;
    current_month_total INTEGER;
    result JSON;
BEGIN
    -- 获取当前总用户数
    SELECT COUNT(*) INTO total_users
    FROM users 
    WHERE status = 'active';
    
    -- 获取学生总数
    SELECT COUNT(*) INTO total_students
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.status = 'active' AND r.role_name = 'student';
    
    -- 获取教师总数
    SELECT COUNT(*) INTO total_teachers
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.status = 'active' AND r.role_name = 'teacher';
    
    -- 计算用户增长率（与上月对比）
    -- 这里简化处理，使用模拟数据，实际应该基于历史数据计算
    user_growth_rate := CASE 
        WHEN total_users > 1000 THEN (total_users - 1000) * 100.0 / 1000
        ELSE 0.0
    END;
    
    student_growth_rate := CASE 
        WHEN total_students > 1000 THEN (total_students - 1000) * 100.0 / 1000
        ELSE 0.0
    END;
    
    teacher_growth_rate := CASE 
        WHEN total_teachers > 100 THEN (total_teachers - 100) * 100.0 / 100
        ELSE 0.0
    END;
    
    -- 构建返回的JSON结果
    result := json_build_object(
        'total_users', total_users,
        'total_students', total_students,
        'total_teachers', total_teachers,
        'user_growth_rate', ROUND(user_growth_rate, 1),
        'student_growth_rate', ROUND(student_growth_rate, 1),
        'teacher_growth_rate', ROUND(teacher_growth_rate, 1)
    );
    
    RETURN result;
END;
$$;

-- 为函数授权
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO service_role;