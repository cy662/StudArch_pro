import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mddpbyibesqewcktlqle.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZHBieWliZXNxZXdja3RscWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNTQzNDksImV4cCI6MjA3ODkzMDM0OX0.T8QHCT3UK5f2mp76Oe9-AZpdrmPOFy1wVutxfmg49EU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testViaFrontend() {
  console.log('🧪 === 通过前端代理测试真实数据库保存 ===\n');
  
  const testStudentId = '5a8c393a-a0c5-4f65-bf35-b15ffb3f550c'; // 您的真实ID
  
  try {
    // 1. 通过前端代理保存技术标签
    console.log('1. 通过前端代理保存技术标签...');
    const tagResponse = await makeRequest('localhost', 5173, '/api/student-learning/add-technical-tag', 'POST', {
      student_profile_id: testStudentId,
      tag_name: 'Frontend-Test-Tag',
      proficiency_level: 'advanced',
      learned_at: '2024-12-02',
      description: '通过前端代理保存到数据库的测试标签'
    });
    
    if (tagResponse.success) {
      console.log('   ✅ 技术标签保存成功！');
      console.log(`   📝 标签: ${tagResponse.data.data.tag_name}`);
      console.log(`   📍 保存位置: ${tagResponse.data.data.source || '数据库'}`);
      
      if (tagResponse.data.message && tagResponse.data.message.includes('临时存储')) {
        console.log('   ❌ 仍然保存到临时存储');
      } else {
        console.log('   ✅ 保存到真实数据库！');
      }
    } else {
      console.log('   ❌ 技术标签保存失败:', tagResponse.data.message);
    }
    
    // 2. 验证数据是否真正在数据库中
    console.log('\n2. 验证数据是否真正保存在数据库中...');
    await verifyDataInDatabase(testStudentId);
    
    console.log('\n🎉 === 测试完成 ===');
    
  } catch (error) {
    console.error('❌ 测试过程中出错:', error.message);
  }
}

async function verifyDataInDatabase(studentId) {
  try {
    console.log('   🔍 直接查询数据库验证...');
    
    // 直接从数据库查询最新保存的技术标签
    const { data: tags, error } = await supabase
      .from('student_technical_tags')
      .select('tag_name, proficiency_level, description, created_at')
      .eq('student_profile_id', studentId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.log('   ❌ 查询数据库失败:', error.message);
      return;
    }
    
    console.log(`   📊 数据库验证结果: 找到 ${tags?.length || 0} 个技术标签`);
    
    if (tags && tags.length > 0) {
      console.log('   🏷️ 数据库中的技术标签:');
      tags.forEach((tag, index) => {
        console.log(`      ${index + 1}. ${tag.tag_name} (${tag.proficiency_level}) - ${tag.description}`);
      });
      
      // 检查是否有我们刚保存的标签
      const hasNewTag = tags.some(tag => tag.tag_name.includes('Frontend-Test-Tag') || tag.tag_name.includes('Database-Test-Tag'));
      if (hasNewTag) {
        console.log('   ✅ 新保存的标签已在数据库中！');
      } else {
        console.log('   ⚠️ 新保存的标签未在数据库中找到');
      }
    } else {
      console.log('   ⚠️ 数据库中没有技术标签记录');
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
testViaFrontend();