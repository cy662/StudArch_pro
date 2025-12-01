// 测试学生前端完整流程
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function testStudentFrontendFlow() {
  try {
    console.log('=== 测试学生前端完整流程 ===');
    
    // 1. 获取学生用户信息（模拟登录后获取的用户信息）
    const { data: students, error: studError } = await supabase
      .from('student_profiles')
      .select('*, users:auth.users(email, created_at)')
      .limit(1);
      
    if (studError) {
      console.log('❌ 获取学生信息失败:', studError);
      // 尝试简单的查询
      const { data: simpleStudents, error: simpleError } = await supabase
        .from('student_profiles')
        .select('*')
        .limit(1);
        
      if (simpleError) {
        console.log('❌ 简单查询也失败:', simpleError);
        return;
      }
      
      console.log('✅ 使用简单查询找到学生档案');
      const student = simpleStudents[0];
      
      // 模拟前端currentUser和studentProfile的关系
      const mockCurrentUser = {
        id: student.user_id, // 这是用户ID
        email: 'test@example.com',
        role_name: 'student'
      };
      
      const mockStudentProfile = {
        id: student.id, // 这是档案ID
        user_id: student.user_id,
        profile_status: student.profile_status
      };
      
      console.log('模拟数据结构:', {
        currentUser: mockCurrentUser,
        studentProfile: mockStudentProfile
      });
      
      // 2. 模拟前端API调用（修复前 vs 修复后）
      console.log('\n--- 修复前：使用currentUser.id ---');
      const oldResponse = await fetch(`http://localhost:3001/api/student/${mockCurrentUser.id}/training-program-courses`);
      const oldResult = await oldResponse.json();
      console.log(`修复前结果: ${oldResult.data.length} 门课程`);
      
      console.log('\n--- 修复后：使用studentProfile.id ---');
      const newResponse = await fetch(`http://localhost:3001/api/student/${mockStudentProfile.id}/training-program-courses`);
      const newResult = await newResponse.json();
      console.log(`修复后结果: ${newResult.data.length} 门课程`);
      
      if (newResult.success && newResult.data.length > 0) {
        console.log('\n✅ 修复成功！学生现在可以看到分配的课程了');
        console.log('课程列表:');
        newResult.data.forEach((course, index) => {
          console.log(`  ${index + 1}. ${course.course_name}`);
          console.log(`     学分: ${course.credits}`);
          console.log(`     状态: ${course.status}`);
          console.log(`     培养方案: ${course.program_name}`);
          console.log('');
        });
      }
      
      // 3. 验证前端数据格式转换
      console.log('--- 验证前端数据格式转换 ---');
      const transformedCourses = newResult.data.map((course) => ({
        id: course.id,
        name: course.course_name,
        teacher: course.teacher || '待定',
        credits: course.credits || 0,
        status: course.status || 'not_started',
        tags: [],
        outcomes: '',
        achievements: '',
        proofFiles: [],
        startDate: '2024-02-26',
        endDate: '2024-07-15',
        description: course.course_description || `${course.course_name} - ${course.course_nature}`,
        programName: course.program_name,
        programCode: course.program_code,
        semester: course.semester,
        courseNature: course.course_nature,
        examMethod: course.exam_method,
        grade: course.grade,
        completedAt: course.completed_at
      }));
      
      console.log('转换后的前端数据格式:', transformedCourses.length, '门课程');
      transformedCourses.slice(0, 2).forEach((course, index) => {
        console.log(`  课程${index + 1}: ${course.name} (${course.credits}学分) - ${course.status}`);
      });
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testStudentFrontendFlow();