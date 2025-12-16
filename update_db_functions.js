const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateDatabaseFunctions() {
  try {
    console.log('开始更新数据库函数...');
    
    // 1. 更新 get_available_students_for_import 函数
    console.log('正在更新 get_available_students_for_import 函数...');
    
    // 先删除旧函数
    const { error: dropError } = await supabase.rpc('exec_sql', { 
      sql: `DROP FUNCTION IF EXISTS get_available_students_for_import CASCADE;` 
    });
    
    if (dropError) {
      console.log('删除旧函数警告（可能不存在）:', dropError.message);
    }
    
    // 创建新函数
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION get_available_students_for_import(
        p_teacher_id UUID,
        p_keyword TEXT DEFAULT '',
        p_grade TEXT DEFAULT '',
        p_department TEXT DEFAULT '',
        p_page INTEGER DEFAULT 1,
        p_limit INTEGER DEFAULT 50
      )
      RETURNS TABLE (
        students JSONB,
        total_count BIGINT
      )
      AS $$
      DECLARE
        v_offset INTEGER := (p_page - 1) * p_limit;
      BEGIN
        RETURN QUERY
        WITH available_students AS (
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
            r.id as role_id,
            r.role_name,
            r.role_description
          FROM users u
          JOIN roles r ON u.role_id = r.id
          -- 核心逻辑：只选择未被任何教师关联的学生
          WHERE u.role_id = 3  -- 学生角色
          AND u.status = 'active'
          -- 确保学生未被任何教师导入（全局唯一控制）
          AND NOT EXISTS (
            SELECT 1 
            FROM teacher_students ts 
            WHERE ts.student_id = u.id
          )
          AND (p_keyword = '' OR 
               u.full_name ILIKE '%' || p_keyword || '%' OR 
               u.user_number ILIKE '%' || p_keyword || '%' OR
               u.email ILIKE '%' || p_keyword || '%')
          AND (p_grade = '' OR u.grade ILIKE '%' || p_grade || '%')
          AND (p_department = '' OR u.department ILIKE '%' || p_department || '%')
        )
        SELECT 
          COALESCE(
            jsonb_agg(
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
                'role', jsonb_build_object(
                  'id', role_id,
                  'role_name', role_name,
                  'role_description', role_description
                )
              )
              ORDER BY created_at DESC
            ) FILTER (WHERE id IS NOT NULL),
            '[]'::jsonb
          ) as students,
          (SELECT COUNT(*) FROM available_students) as total_count
        FROM (
          SELECT * FROM available_students
          ORDER BY created_at DESC
          LIMIT p_limit
          OFFSET v_offset
        ) AS paged_results;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    const { error: createError } = await supabase.rpc('exec_sql', { sql: createFunctionSQL });
    
    if (createError) {
      console.error('创建函数失败:', createError);
      return;
    }
    
    console.log('✅ get_available_students_for_import 函数更新成功');
    
    // 2. 授权函数执行权限
    console.log('正在授权函数执行权限...');
    const grantSQL = `
      GRANT EXECUTE ON FUNCTION get_available_students_for_import(UUID,TEXT,TEXT,TEXT,INTEGER,INTEGER) TO authenticated;
    `;
    
    const { error: grantError } = await supabase.rpc('exec_sql', { sql: grantSQL });
    
    if (grantError) {
      console.error('授权函数执行权限失败:', grantError);
      return;
    }
    
    console.log('✅ 函数执行权限授权成功');
    
    // 3. 测试函数
    console.log('正在测试函数...');
    const { data: testData, error: testError } = await supabase.rpc('get_available_students_for_import', {
      p_teacher_id: '00000000-0000-0000-0000-000000000001',
      p_keyword: '',
      p_grade: '',
      p_department: '',
      p_page: 1,
      p_limit: 50
    });
    
    if (testError) {
      console.error('函数测试失败:', testError);
      return;
    }
    
    console.log('✅ 函数测试成功，返回数据:', testData);
    console.log('🎉 所有数据库函数更新完成！');
    
  } catch (err) {
    console.error('更新数据库函数过程中出错:', err);
  }
}

updateDatabaseFunctions();