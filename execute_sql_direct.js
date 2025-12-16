import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mddpbyibesqewcktlqle.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZHBieWliZXNxZXdja3RscWxlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM1NDM0OSwiZXhwIjoyMDc4OTMwMzQ5fQ.P2Y3IaRqJn6Tf7NjaHztGSd__3bTb_aBVioKoIK9Rq8';

const supabase = createClient(supabaseUrl, supabaseKey);

// 直接执行修复的SQL
const fixSQL = `
-- 删除已存在的函数（如果存在）
DROP FUNCTION IF EXISTS get_available_students_for_import;

CREATE FUNCTION get_available_students_for_import(
    p_teacher_id UUID,
    p_keyword TEXT DEFAULT '',
    p_grade TEXT DEFAULT '',
    p_department TEXT DEFAULT '',
    p_page INTEGER DEFAULT 1,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE(
    students JSONB,
    total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_offset INTEGER := (p_page - 1) * p_limit;
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', u.id,
                    'username', u.username,
                    'email', u.email,
                    'user_number', u.user_number,
                    'full_name', u.full_name,
                    'phone', u.phone,
                    'department', u.department,
                    'grade', u.grade,
                    'class_name', u.class_name,
                    'status', u.status,
                    'created_at', u.created_at,
                    'updated_at', u.updated_at,
                    'role', jsonb_build_object(
                        'id', r.id,
                        'role_name', r.role_name,
                        'role_description', r.role_description,
                        'is_system_default', r.is_system_default,
                        'created_at', r.created_at,
                        'updated_at', r.updated_at
                    )
                )
            ),
            '[]'::jsonb
        ) as students,
        (
            SELECT COUNT(*)
            FROM users u_count
            WHERE u_count.role_id = '3'  -- 学生角色
              AND u_count.status = 'active'  -- 活跃状态
              AND NOT EXISTS (
                  -- 关键修复：排除已被任何教师导入的学生
                  SELECT 1 FROM teacher_students ts_count 
                  WHERE ts_count.student_id = u_count.id
              )
              AND (
                  p_keyword = '' OR 
                  LOWER(u_count.full_name) LIKE LOWER('%' || p_keyword || '%') OR
                  LOWER(u_count.user_number) LIKE LOWER('%' || p_keyword || '%') OR
                  LOWER(u_count.email) LIKE LOWER('%' || p_keyword || '%')
              )
              AND (p_grade = '' OR u_count.grade = p_grade)
              AND (p_department = '' OR u_count.department = p_department)
        ) as total_count
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.role_id = '3'  -- 学生角色
      AND u.status = 'active'  -- 活跃状态
      AND NOT EXISTS (
          -- 关键修复：排除已被任何教师导入的学生（而不仅仅是当前教师）
          SELECT 1 FROM teacher_students ts 
          WHERE ts.student_id = u.id
      )
      AND (
          p_keyword = '' OR 
          LOWER(u.full_name) LIKE LOWER('%' || p_keyword || '%') OR
          LOWER(u.user_number) LIKE LOWER('%' || p_keyword || '%') OR
          LOWER(u.email) LIKE LOWER('%' || p_keyword || '%')
      )
      AND (p_grade = '' OR u.grade = p_grade)
      AND (p_department = '' OR u.department = p_department)
    ORDER BY u.created_at DESC
    LIMIT p_limit OFFSET v_offset;
END;
$$;

-- 授权执行权限
GRANT EXECUTE ON FUNCTION get_available_students_for_import TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_students_for_import TO anon;
`;

async function executeFix() {
  try {
    console.log('开始执行批量导入筛选逻辑修复...');
    
    // 使用直接SQL执行
    const { data, error } = await supabase
      .from('rpc')
      .rpc('exec_sql', { sql_query: fixSQL });
    
    if (error) {
      console.error('直接执行失败，尝试其他方法:', error);
      
      // 如果直接执行失败，尝试通过REST API执行
      console.log('尝试通过HTTP API执行...');
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql_query: fixSQL })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ API执行成功:', result);
    } else {
      console.log('✅ 直接执行成功:', data);
    }
    
    console.log('🎉 修复完成！');
    console.log('📝 修复内容：');
    console.log('   - 排除已被任何教师导入的学生');
    console.log('   - 避免重复导入和不同教师导入同一学生的风险');
    
  } catch (err) {
    console.error('执行错误:', err);
    console.log('🔄 创建手动执行脚本...');
    
    // 创建手动执行脚本
    const manualScript = `-- 手动执行以下SQL来修复批量导入筛选逻辑
-- 请在Supabase SQL编辑器中执行以下内容：

${fixSQL}

-- 验证修复效果：
-- SELECT * FROM get_available_students_for_import('your-teacher-id', '', '', '', 1, 10);
`;
    
    const fs = await import('fs');
    fs.writeFileSync('./manual_import_filter_fix.sql', manualScript);
    console.log('✅ 已创建手动执行脚本：manual_import_filter_fix.sql');
    console.log('请在Supabase控制台的SQL编辑器中手动执行该脚本');
  }
}

executeFix();