const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function checkTableStructure() {
  console.log('=== 检查实际的数据库表结构 ===');
  
  try {
    // 检查所有表
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
      
    if (tablesError) {
      console.error('查询表列表失败:', tablesError);
    } else {
      console.log('数据库中的表:');
      tables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    }
    
    // 检查student_profiles表结构
    console.log('\n检查student_profiles表结构:');
    try {
      const { data: profileColumns, error: profileError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_schema', 'public')
        .eq('table_name', 'student_profiles')
        .order('ordinal_position');
        
      if (profileError) {
        console.error('查询student_profiles列失败:', profileError);
      } else {
        console.log('student_profiles表的列:');
        profileColumns.forEach(col => {
          console.log(`  - ${col.column_name} (${col.data_type}) - nullable: ${col.is_nullable}`);
        });
      }
    } catch (e) {
      console.log('无法查询student_profiles列信息，尝试其他方法');
    }
    
    // 检查users表结构
    console.log('\n检查users表结构:');
    try {
      const { data: userColumns, error: userError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_schema', 'public')
        .eq('table_name', 'users')
        .order('ordinal_position');
        
      if (userError) {
        console.error('查询users列失败:', userError);
      } else {
        console.log('users表的列:');
        userColumns.forEach(col => {
          console.log(`  - ${col.column_name} (${col.data_type}) - nullable: ${col.is_nullable}`);
        });
      }
    } catch (e) {
      console.log('无法查询users列信息，尝试其他方法');
    }
    
    // 尝试直接查看数据（如果有数据的话）
    console.log('\n尝试直接查看student_profiles数据:');
    try {
      const { data: profileData, error: profileDataError } = await supabase
        .from('student_profiles')
        .select('*')
        .limit(5);
        
      if (profileDataError) {
        console.error('查看student_profiles数据失败:', profileDataError);
      } else {
        console.log('student_profiles数据样本:');
        if (profileData.length > 0) {
          console.log('列名:', Object.keys(profileData[0]));
          profileData.forEach(row => {
            console.log('数据:', row);
          });
        } else {
          console.log('student_profiles表中没有数据');
        }
      }
    } catch (e) {
      console.error('查看student_profiles数据出错:', e);
    }
    
    console.log('\n尝试直接查看users数据:');
    try {
      const { data: userData, error: userDataError } = await supabase
        .from('users')
        .select('*')
        .limit(5);
        
      if (userDataError) {
        console.error('查看users数据失败:', userDataError);
      } else {
        console.log('users数据样本:');
        if (userData.length > 0) {
          console.log('列名:', Object.keys(userData[0]));
          userData.forEach(row => {
            console.log('数据:', row);
          });
        } else {
          console.log('users表中没有数据');
        }
      }
    } catch (e) {
      console.error('查看users数据出错:', e);
    }
    
  } catch (error) {
    console.error('检查表结构过程中出现错误:', error);
  }
}

checkTableStructure().catch(console.error);