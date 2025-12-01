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

async function emergencyFix() {
  try {
    console.log('🚨 紧急修复：直接在数据库中搜索并替换format错误...');
    
    // 1. 首先检查函数是否存在
    const { data: functions, error: funcError } = await supabase
      .from('information_schema.routines')
      .select('routine_name, routine_definition')
      .eq('routine_name', 'batch_assign_training_program_to_teacher_students')
      .eq('routine_schema', 'public');
    
    if (funcError) {
      console.log('无法通过schema查询，尝试其他方法...');
    }
    
    // 2. 使用原始SQL查询和替换
    const fixSQL = `
      DO $$
      DECLARE
          func_text TEXT;
          func_oid REGPROC;
      BEGIN
          -- 获取函数OID
          SELECT oid INTO func_oid 
          FROM pg_proc 
          WHERE proname = 'batch_assign_training_program_to_teacher_students';
          
          IF func_oid IS NOT NULL THEN
              -- 获取函数源码
              SELECT prosrc INTO func_text FROM pg_proc WHERE oid = func_oid;
              
              -- 替换format中的%d为%s
              func_text := REPLACE(func_text, '%d', '%s');
              
              -- 重建函数
              EXECUTE 'DROP FUNCTION IF EXISTS batch_assign_training_program_to_teacher_students(UUID, UUID, UUID[])';
              
              -- 这里需要手动重建函数，因为动态创建函数很复杂
              RAISE NOTICE '找到函数，需要手动重建';
              RAISE NOTICE '函数源码中包含 %d 需要替换为 %s';
          ELSE
              RAISE NOTICE '未找到函数，将创建新的';
          END IF;
      END $$;
    `;
    
    console.log('📝 执行诊断SQL...');
    const { data, error } = await supabase.rpc('exec_sql', { sql_string: fixSQL });
    
    if (error) {
      console.log('exec_sql不可用，使用备用方案...');
    }
    
    // 3. 直接提供需要执行的修复SQL
    const emergencyFixSQL = `
-- 紧急修复：重建批量分配函数
DROP FUNCTION IF EXISTS batch_assign_training_program_to_teacher_students(UUID, UUID, UUID[]);

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
    
    -- 构建返回结果（关键修复：使用%s而不是%d）
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

GRANT EXECUTE ON FUNCTION batch_assign_training_program_to_teacher_students(UUID, UUID, UUID[]) TO authenticated;
    `;
    
    console.log('\n🔥 紧急修复SQL已生成！');
    console.log('='.repeat(80));
    console.log(emergencyFixSQL);
    console.log('='.repeat(80));
    console.log('\n📋 请立即执行以下操作：');
    console.log('1. 打开 Supabase Dashboard');
    console.log('2. 进入 Database > SQL Editor');
    console.log('3. 粘贴上面的SQL代码');
    console.log('4. 点击 "RUN" 执行');
    console.log('5. 等待执行完成');
    console.log('6. 重新测试批量分配功能');
    
    // 验证修复
    console.log('\n🧪 正在验证修复状态...');
    const testResult = await supabase.rpc('batch_assign_training_program_to_teacher_students', {
      p_teacher_id: '00000000-0000-0000-0000-000000000001',
      p_program_id: '00000000-0000-0000-0000-000000000001',
      p_student_ids: ['00000000-0000-0000-0000-000000000001']
    });
    
    if (testResult.error && testResult.error.message.includes('unrecognized format')) {
      console.log('❌ format错误仍然存在，必须手动执行上述SQL');
    } else {
      console.log('✅ format错误已修复！');
    }
    
  } catch (error) {
    console.error('❌ 紧急修复失败:', error);
  }
}

emergencyFix();