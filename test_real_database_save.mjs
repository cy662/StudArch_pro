import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mddpbyibesqewcktlqle.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZHBieWliZXNxZXdja3RscWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNTQzNDksImV4cCI6MjA3ODkzMDM0OX0.T8QHCT3UK5f2mp76Oe9-AZpdrmPOFy1wVutxfmg49EU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testRealDatabaseSave() {
  console.log('🧪 === 测试真实数据库保存功能 ===\n');
  
  const testStudentId = '5a8c393a-a0c5-4f65-bf35-b15ffb3f550c'; // 使用您日志中的真实ID
  
  try {
    // 1. 测试技术标签保存到数据库
    console.log('1. 测试技术标签保存到真实数据库...');
    const tagResponse = await makeRequest('localhost', 3001, '/api/student-learning/add-technical-tag', 'POST', {
      student_profile_id: testStudentId,
      tag_name: 'Database-Test-Tag',
      proficiency_level: 'advanced',
      learned_at: '2024-12-02',
      description: '数据库保存测试标签'
    });
    
    if (tagResponse.success) {
      console.log('   ✅ 技术标签保存成功！');
      console.log(`   📝 标签: ${tagResponse.data.data.tag_name}`);
      console.log(`   📍 位置: ${tagResponse.data.data.source || '数据库'}`);
    } else {
      console.log('   ❌ 技术标签保存失败:', tagResponse.data.message);
    }
    
    // 2. 测试学习收获保存到数据库
    console.log('\n2. 测试学习收获保存到真实数据库...');
    const achievementResponse = await makeRequest('localhost', 3001, '/api/student-learning/add-learning-achievement', 'POST', {
      student_profile_id: testStudentId,
      title: '数据库学习收获测试',
      content: '通过修复API配置，成功将学习收获保存到Supabase数据库中，实现了数据的持久化存储。',
      achievement_type: 'course_completion',
      achieved_at: '2024-12-02',
      impact_level: 'high',
      related_course: '数据库测试课程'
    });
    
    if (achievementResponse.success) {
      console.log('   ✅ 学习收获保存成功！');
      console.log(`   📚 标题: ${achievementResponse.data.data.title}`);
      console.log(`   📍 位置: ${achievementResponse.data.data.source || '数据库'}`);
    } else {
      console.log('   ❌ 学习收获保存失败:', achievementResponse.data.message);
    }
    
    // 3. 测试学习成果保存到数据库
    console.log('\n3. 测试学习成果保存到真实数据库...');
    const outcomeResponse = await makeRequest('localhost', 3001, '/api/student-learning/add-learning-outcome', 'POST', {
      student_profile_id: testStudentId,
      outcome_title: '数据库项目成果',
      outcome_description: '成功将学习成果保存到Supabase数据库，实现了完整的数据持久化功能。',
      outcome_type: 'course_project',
      start_date: '2024-11-01',
      completion_date: '2024-12-02',
      difficulty_level: 'advanced',
      completion_status: 'completed',
      quality_rating: 5
    });
    
    if (outcomeResponse.success) {
      console.log('   ✅ 学习成果保存成功！');
      console.log(`   🏆 标题: ${outcomeResponse.data.data.outcome_title}`);
      console.log(`   📍 位置: ${outcomeResponse.data.data.source || '数据库'}`);
    } else {
      console.log('   ❌ 学习成果保存失败:', outcomeResponse.data.message);
    }
    
    // 4. 测试证明材料保存到数据库
    console.log('\n4. 测试证明材料保存到真实数据库...');
    const materialResponse = await makeRequest('localhost', 3001, '/api/student-learning/add-proof-material', 'POST', {
      student_profile_id: testStudentId,
      material_name: '数据库测试证书.pdf',
      material_description: '数据库功能测试证书',
      material_type: 'course_certificate',
      material_url: '/uploads/database-test-certificate.pdf',
      upload_date: '2024-12-02',
      verification_status: 'pending'
    });
    
    if (materialResponse.success) {
      console.log('   ✅ 证明材料保存成功！');
      console.log(`   📄 文件名: ${materialResponse.data.data.material_name}`);
      console.log(`   📍 位置: ${materialResponse.data.data.source || '数据库'}`);
    } else {
      console.log('   ❌ 证明材料保存失败:', materialResponse.data.message);
    }
    
    // 5. 验证数据是否真正保存在数据库中
    console.log('\n5. 验证数据是否真正保存在数据库中...');
    await verifyDatabaseData(testStudentId);
    
    console.log('\n🎉 === 数据库保存功能测试完成 ===');
    
  } catch (error) {
    console.error('❌ 测试过程中出错:', error.message);
  }
}

async function verifyDatabaseData(studentId) {
  try {
    // 直接从数据库查询数据
    const [tagsResult, achievementsResult, outcomesResult, materialsResult] = await Promise.all([
      supabase
        .from('student_technical_tags')
        .select('tag_name, proficiency_level, description, created_at')
        .eq('student_profile_id', studentId)
        .eq('status', 'active'),
      
      supabase
        .from('student_learning_achievements')
        .select('title, content, impact_level, created_at')
        .eq('student_profile_id', studentId)
        .eq('status', 'active'),
      
      supabase
        .from('student_learning_outcomes')
        .select('outcome_title, outcome_description, quality_rating, created_at')
        .eq('student_profile_id', studentId)
        .eq('status', 'active'),
      
      supabase
        .from('student_proof_materials')
        .select('material_name, material_description, created_at')
        .eq('student_profile_id', studentId)
    ]);
    
    console.log('   📊 数据库验证结果:');
    console.log(`      🏷️ 技术标签: ${tagsResult.data?.length || 0} 个`);
    console.log(`      📚 学习收获: ${achievementsResult.data?.length || 0} 个`);
    console.log(`      🏆 学习成果: ${outcomesResult.data?.length || 0} 个`);
    console.log(`      📄 证明材料: ${materialsResult.data?.length || 0} 个`);
    
    // 显示最新保存的数据
    if (tagsResult.data && tagsResult.data.length > 0) {
      console.log('\n   🏷️ 保存的技术标签:');
      tagsResult.data.forEach((tag, index) => {
        console.log(`      ${index + 1}. ${tag.tag_name} (${tag.proficiency_level})`);
      });
    }
    
    if (achievementsResult.data && achievementsResult.data.length > 0) {
      console.log('\n   📚 保存的学习收获:');
      achievementsResult.data.forEach((achievement, index) => {
        console.log(`      ${index + 1}. ${achievement.title}`);
        console.log(`         ${achievement.content.substring(0, 60)}...`);
      });
    }
    
    const totalRecords = (tagsResult.data?.length || 0) + 
                      (achievementsResult.data?.length || 0) + 
                      (outcomesResult.data?.length || 0) + 
                      (materialsResult.data?.length || 0);
    
    if (totalRecords > 0) {
      console.log('\n   ✅ 数据已成功保存到 Supabase 数据库！');
      console.log(`   🎯 总记录数: ${totalRecords}`);
    } else {
      console.log('\n   ⚠️ 数据库中没有找到记录');
    }
    
  } catch (error) {
    console.error('验证数据库数据时出错:', error.message);
  }
}

async function makeRequest(hostname, port, path, method, data) {
  return new Promise((resolve, reject) => {
    const postData = method !== 'GET' ? JSON.stringify(data) : null;
    
    const options = {
      hostname: hostname,
      port: port,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve({ success: res.statusCode === 200, status: res.statusCode, data: result });
        } catch (e) {
          resolve({ success: false, status: res.statusCode, raw: responseData });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

import http from 'http';
testRealDatabaseSave();