import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少 Supabase 配置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyQuickFix() {
  try {
    console.log('🚀 正在快速修复批量分配函数...');
    
    // 直接通过REST API执行SQL
    const sqlStatements = [
      // 删除旧函数
      `DROP FUNCTION IF EXISTS batch_assign_training_program_to_teacher_students(UUID, UUID, UUID[]);`,
      
      // 创建新函数 - 修复format错误
      `CREATE OR REPLACE FUNCTION batch_assign_training_program_to_teacher_students(
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
                  
                  -- 检查培养方案是否存在
                  SELECT EXISTS(
                      SELECT 1 FROM training_programs 
                      WHERE id = p_program_id AND status = 'active'
                  ) INTO assignment_exists;
                  
                  IF NOT assignment_exists THEN
                      RAISE EXCEPTION '培养方案不存在或已停用';
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
          
          -- 构建返回结果（修复：使用%s而不是%d）
          result := jsonb_build_object(
              'success', success_count > 0,
              'message', format('批量分配完成：成功 %s 个，失败 %s 个', success_count, failure_count),
              'success_count', success_count,
              'failure_count', failure_count,
              'total_count', success_count + failure_count
          );
          
          RETURN result;
      END;
      $$ LANGUAGE plpgsql;`,
      
      // 授权
      `GRANT EXECUTE ON FUNCTION batch_assign_training_program_to_teacher_students(UUID, UUID, UUID[]) TO authenticated;`
    ];
    
    // 尝试通过不同的方式执行SQL
    console.log('📝 方法1: 尝试通过REST API执行...');
    
    for (let i = 0; i < sqlStatements.length; i++) {
      const sql = sqlStatements[i];
      console.log(`执行语句 ${i + 1}/${sqlStatements.length}...`);
      
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            sql: sql
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log(`⚠️ REST API执行失败: ${errorText}`);
        } else {
          console.log(`✅ 语句 ${i + 1} 执行成功`);
        }
      } catch (error) {
        console.log(`❌ 语句 ${i + 1} 执行出错: ${error.message}`);
      }
    }
    
    console.log('\n📋 如果上述方法失败，请手动执行以下SQL:');
    console.log('='.repeat(60));
    console.log(sqlStatements.join('\n\n'));
    console.log('='.repeat(60));
    console.log('\n🔗 在Supabase Dashboard > Database > SQL Editor中执行');
    
    // 测试修复结果
    console.log('\n🧪 测试修复结果...');
    const testResult = await supabase.rpc('batch_assign_training_program_to_teacher_students', {
      p_teacher_id: '00000000-0000-0000-0000-000000000001',
      p_program_id: '00000000-0000-0000-0000-000000000001',
      p_student_ids: ['00000000-0000-0000-0000-000000000001']
    });
    
    if (testResult.error && testResult.error.message.includes('unrecognized format')) {
      console.log('❌ format错误仍然存在，需要手动执行SQL');
    } else {
      console.log('✅ format错误已修复！');
      if (testResult.error) {
        console.log('其他错误:', testResult.error.message);
      } else {
        console.log('函数正常工作:', testResult.data);
      }
    }
    
  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error);
  }
}

applyQuickFix();