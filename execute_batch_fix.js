import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('缺少 Supabase 配置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runBatchFix() {
  try {
    console.log('🔧 开始修复批量分配培养方案函数...');
    
    // 直接执行修复后的函数定义
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION batch_assign_training_program_to_teacher_students(
          p_teacher_id UUID,
          p_program_id UUID,
          p_student_ids UUID[]
      )
      RETURNS JSONB AS $$
      DECLARE
          success_count INTEGER := 0;
          failure_count INTEGER := 0;
          student_uuid UUID;
          result JSONB;
          assignment_exists BOOLEAN;
      BEGIN
          -- 遍历学生ID列表进行批量分配
          FOREACH student_uuid IN ARRAY p_student_ids
          LOOP
              BEGIN
                  -- 检查学生是否在该教师管理列表中
                  SELECT EXISTS(
                      SELECT 1 FROM teacher_student_relationships 
                      WHERE teacher_id = p_teacher_id AND student_id = student_uuid
                  ) INTO assignment_exists;
                  
                  IF NOT assignment_exists THEN
                      RAISE EXCEPTION '学生不在教师管理列表中';
                  END IF;
                  
                  -- 检查是否已经分配过培养方案
                  SELECT EXISTS(
                      SELECT 1 FROM student_training_programs 
                      WHERE student_id = student_uuid
                  ) INTO assignment_exists;
                  
                  IF assignment_exists THEN
                      -- 更新现有分配
                      UPDATE student_training_programs 
                      SET program_id = p_program_id, updated_at = NOW()
                      WHERE student_id = student_uuid;
                  ELSE
                      -- 插入新的培养方案分配
                      INSERT INTO student_training_programs (
                          student_id,
                          program_id,
                          enrollment_date,
                          status,
                          created_at,
                          updated_at
                      ) VALUES (
                          student_uuid,
                          p_program_id,
                          CURRENT_DATE,
                          'active',
                          NOW(),
                          NOW()
                      );
                  END IF;
                  
                  -- 创建学生课程进度记录
                  INSERT INTO student_course_progress (
                      student_id,
                      course_id,
                      status,
                      created_at,
                      updated_at
                  )
                  SELECT 
                      student_uuid,
                      tpc.id,
                      'not_started',
                      NOW(),
                      NOW()
                  FROM training_program_courses tpc
                  WHERE tpc.program_id = p_program_id 
                  AND tpc.status = 'active'
                  ON CONFLICT (student_id, course_id) DO NOTHING;
                  
                  success_count := success_count + 1;
                  
              EXCEPTION WHEN OTHERS THEN
                  failure_count := failure_count + 1;
              END;
          END LOOP;
          
          -- 构建返回结果（修复format错误：使用%s而不是%d）
          result := jsonb_build_object(
              'success', success_count > 0,
              'message', format('批量分配完成：成功 %s 个，失败 %s 个', success_count, failure_count),
              'success_count', success_count,
              'failure_count', failure_count,
              'total_count', success_count + failure_count
          );
          
          RETURN result;
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    // 执行函数创建
    console.log('📝 正在创建修复后的函数...');
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_string: createFunctionSQL 
    });
    
    if (error) {
      console.error('❌ 函数创建失败:', error.message);
      
      // 尝试使用原始SQL执行
      console.log('🔄 尝试使用其他方式执行...');
      try {
        // 这里我们可以尝试直接调用supabase.sql API
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey
          },
          body: JSON.stringify({
            sql_string: createFunctionSQL
          })
        });
        
        if (response.ok) {
          console.log('✅ 修复函数执行成功');
        } else {
          const errorData = await response.text();
          console.error('❌ 替代执行也失败:', errorData);
        }
      } catch (fetchError) {
        console.error('❌ 网络请求失败:', fetchError.message);
      }
    } else {
      console.log('✅ 批量分配函数修复完成！');
    }
    
    // 授权
    console.log('🔐 正在授权函数...');
    const { error: grantError } = await supabase.rpc('exec_sql', {
      sql_string: 'GRANT EXECUTE ON FUNCTION batch_assign_training_program_to_teacher_students(UUID, UUID, UUID[]) TO authenticated;'
    });
    
    if (grantError) {
      console.error('⚠️ 授权失败:', grantError.message);
    } else {
      console.log('✅ 授权完成');
    }
    
  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error);
  }
}

runBatchFix().then(() => {
  console.log('🎉 修复过程完成，请重新测试批量分配功能');
});