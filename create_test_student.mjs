import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://mddpbyibesqewcktlqle.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZHBieWliZXNxZXdja3RscWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNTQzNDksImV4cCI6MjA3ODkzMDM0OX0.T8QHCT3UK5f2mp76Oe9-AZpdrmPOFy1wVutxfmg49EU');

async function createTestStudent() {
  console.log('🔧 创建测试学生档案...');
  
  const testStudent = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    user_id: '550e8400-e29b-41d4-a716-446655440001',
    student_number: '2023015701',
    full_name: '测试学生',
    gender: 'male',
    birth_date: '2000-01-01',
    id_card: '110101200001010001',
    nationality: '中国',
    political_status: '群众',
    phone: '13800138000',
    emergency_contact: '测试家长',
    emergency_phone: '13900139000',
    home_address: '北京市朝阳区',
    profile_status: 'approved'
  };
  
  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .upsert(testStudent)
      .select();
      
    if (error) {
      console.log('❌ 创建失败:', error.message);
    } else {
      console.log('✅ 测试学生档案创建成功');
    }
  } catch (e) {
    console.log('❌ 操作失败:', e.message);
  }
}

createTestStudent();