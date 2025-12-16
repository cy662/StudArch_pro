const { createClient } = require('@supabase/supabase-js');

// Supabase 配置
const supabaseUrl = 'https://zdxwoyaehxygqjdbluof.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkeHdveWFlaHh5Z3FqZGJsdW9mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTk0Mjc2NiwiZXhwIjoyMDUxNTE4NzY2fQ.W21s-TKGEjyrcpJtZrJKmP1NMlFBVFNDGn2bvqxJ8es';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createFunction() {
  try {
    console.log('开始创建数据库函数...');
    
    // 直接创建函数的SQL
    const createFunctionSQL = `
CREATE OR REPLACE FUNCTION get_available_students_for_import(
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
LANGUAGE sql
SECURITY DEFINER
AS \$\$
WITH filtered_students AS (
    SELECT 
        u.id,
        u.username,
        u.email,
        u.user_number,
        u.full_name,
        u.phone,
        u.department,
        u.grade,
        u.class_name,
        u.status,
        u.created_at,
        u.updated_at,
        r.id as role_id,
        r.role_name,
        r.role_description,
        r.is_system_default,
        r.created_at as role_created_at,
        r.updated_at as role_updated_at
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.role_id = '3'  -- 学生角色
      AND u.status = 'active'  -- 活跃状态
      AND NOT EXISTS (
          -- 关键修复：排除已被任何教师导入的学生
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
),
paginated_students AS (
    SELECT * FROM filtered_students
    ORDER BY created_at DESC
    LIMIT p_limit OFFSET (p_page - 1) * p_limit
)
SELECT 
    (SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', id,
            'username', username,
            'email', email,
            'user_number', user_number,
            'full_name', full_name,
            'phone', phone,
            'department', department,
            'grade', grade,
            'class_name', class_name,
            'status', status,
            'created_at', created_at,
            'updated_at', updated_at,
            'role', jsonb_build_object(
                'id', role_id,
                'role_name', role_name,
                'role_description', role_description,
                'is_system_default', is_system_default,
                'created_at', role_created_at,
                'updated_at', role_updated_at
            )
        )
    ), '[]'::jsonb) FROM paginated_students) as students,
    (SELECT COUNT(*) FROM filtered_students) as total_count;
\$\$;

GRANT EXECUTE ON FUNCTION get_available_students_for_import TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_students_for_import TO anon;
`;

    // 使用原生SQL执行
    const { data, error } = await supabase
      .from('pg_proc')
      .select('*')
      .eq('proname', 'get_available_students_for_import');

    if (error) {
      console.error('查询函数失败:', error);
    } else {
      console.log('现有函数查询结果:', data);
    }

    // 尝试通过rpc执行（如果存在execute_sql函数）
    console.log('尝试创建函数...');
    const { data: createResult, error: createError } = await supabase
      .rpc('exec_sql', { sql: createFunctionSQL });

    if (createError) {
      console.log('exec_sql函数不存在，尝试其他方法...');
      
      // 尝试直接执行
      try {
        const { data: directResult, error: directError } = await supabase
          .from('_temp_execution')
          .select('*')
          .limit(1);
        
        console.log('直接执行尝试结果:', directResult, directError);
      } catch (e) {
        console.log('直接执行也失败:', e.message);
      }
    } else {
      console.log('函数创建成功:', createResult);
    }

  } catch (err) {
    console.error('创建函数失败:', err);
  }
}

createFunction();