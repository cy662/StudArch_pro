const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function quickFix() {
  try {
    console.log('🔧 快速修复培养方案分配函数...');
    
    // 直接执行修复后的函数定义
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_statement: `
        CREATE OR REPLACE FUNCTION assign_training_program_to_student(
            p_student_id UUID,
            p_program_id UUID,
            p_teacher_id UUID DEFAULT NULL,
            p_notes TEXT DEFAULT NULL
        )
        RETURNS JSONB AS $$
        DECLARE
            result JSONB;
            assignment_uuid UUID;
            is_teacher_student BOOLEAN := FALSE;
            profile_id UUID;
        BEGIN
            -- 获取student_profiles中的ID（用于外键约束）
            SELECT id INTO profile_id
                FROM student_profiles
                WHERE user_id = p_student_id
                LIMIT 1;
                
            IF profile_id IS NULL THEN
                RETURN jsonb_build_object(
                    'success', false,
                    'message', '学生档案不存在，无法分配培养方案'
                );
            END IF;
            
            -- 插入或更新学生培养方案关联（使用profile_id）
            INSERT INTO student_training_programs (
                student_id,
                program_id,
                enrollment_date,
                status,
                notes,
                created_at,
                updated_at
            ) VALUES (
                profile_id,
                p_program_id,
                CURRENT_DATE,
                'active',
                p_notes,
                NOW(),
                NOW()
            )
            ON CONFLICT (student_id, program_id) 
            DO UPDATE SET
                enrollment_date = CURRENT_DATE,
                status = 'active',
                notes = COALESCE(EXCLUDED.notes, student_training_programs.notes),
                updated_at = NOW()
            RETURNING id INTO assignment_uuid;
            
            RETURN jsonb_build_object(
                'success', true,
                'message', '培养方案分配成功',
                'assignment_id', assignment_uuid
            );
        END;
        $$ LANGUAGE plpgsql;
      `
    });
    
    if (error) {
      console.error('❌ 修复失败:', error.message);
    } else {
      console.log('✅ 修复成功!');
    }
    
  } catch (error) {
    console.error('❌ 执行失败:', error);
  }
}

quickFix();