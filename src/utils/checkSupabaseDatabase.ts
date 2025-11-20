/**
 * 直接检查Supabase数据库结构
 * 检查student_profiles表的实际字段
 */

import { supabase } from '../lib/supabase';

/**
 * 检查student_profiles表的所有字段
 */
export async function checkStudentProfilesTable() {
  console.log('=== 检查Supabase数据库中的student_profiles表 ===');
  
  try {
    // 1. 检查表是否存在
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'student_profiles');
    
    if (tableError) {
      console.error('检查表是否存在失败:', tableError);
      return { success: false, error: '无法检查表存在性' };
    }
    
    if (!tables || tables.length === 0) {
      console.error('student_profiles表不存在！');
      return { success: false, error: 'student_profiles表不存在' };
    }
    
    console.log('✅ student_profiles表存在');
    
    // 2. 获取表的所有字段
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'student_profiles')
      .order('ordinal_position');
    
    if (columnError) {
      console.error('获取表字段失败:', columnError);
      return { success: false, error: '无法获取表字段' };
    }
    
    console.log('student_profiles表的字段结构:');
    columns?.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? '可空' : '非空'})${col.column_default ? ` 默认值: ${col.column_default}` : ''}`);
    });
    
    // 3. 检查我们需要的字段
    const requiredFields = [
      'profile_photo', 'major', 'academic_system', 'academic_status',
      'department', 'class_info', 'enrollment_year'
    ];
    
    const existingColumns = columns?.map(col => col.column_name) || [];
    const missingFields = requiredFields.filter(field => !existingColumns.includes(field));
    
    if (missingFields.length > 0) {
      console.log(`❌ 缺失的字段: ${missingFields.join(', ')}`);
      return { 
        success: false, 
        missingFields,
        existingColumns,
        columns,
        error: '缺少必要字段' 
      };
    } else {
      console.log('✅ 所有需要的字段都存在');
      return { 
        success: true, 
        existingColumns,
        columns,
        missingFields: []
      };
    }
    
  } catch (error) {
    console.error('检查数据库结构异常:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 检查表中的实际数据
 */
export async function checkStudentProfilesData(userId: string) {
  console.log(`=== 检查用户 ${userId} 的个人资料数据 ===`);
  
  try {
    // 尝试获取特定用户的数据
    const { data: profileData, error: dataError } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (dataError) {
      console.error('获取个人资料数据失败:', dataError);
      return { success: false, error: dataError.message };
    }
    
    if (!profileData) {
      console.log('该用户没有个人资料数据');
      return { success: false, error: '没有个人资料数据' };
    }
    
    console.log('个人资料数据:');
    console.log(JSON.stringify(profileData, null, 2));
    
    // 检查关键字段是否有值
    const fieldChecks = [
      { field: 'profile_photo', label: '证件照' },
      { field: 'major', label: '专业' },
      { field: 'academic_system', label: '学制' },
      { field: 'academic_status', label: '学籍状态' },
      { field: 'department', label: '院系' },
      { field: 'class_info', label: '班级' },
      { field: 'enrollment_year', label: '入学年份' }
    ];
    
    const fieldResults = {};
    fieldChecks.forEach(check => {
      const value = profileData[check.field];
      fieldResults[check.field] = {
        exists: profileData.hasOwnProperty(check.field),
        hasValue: value !== null && value !== undefined && value !== '',
        value: value,
        label: check.label
      };
    });
    
    console.log('字段检查结果:');
    Object.entries(fieldResults).forEach(([key, result]: [string, any]) => {
      console.log(`  ${result.label} (${key}): 存在=${result.exists}, 有值=${result.hasValue}, 值=${result.value}`);
    });
    
    return { success: true, data: profileData, fieldResults };
    
  } catch (error) {
    console.error('检查个人资料数据异常:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 尝试执行字段添加操作
 */
export async function addMissingFieldsToDatabase() {
  console.log('=== 尝试添加缺失字段到Supabase数据库 ===');
  
  const fieldDefinitions = [
    {
      name: 'profile_photo',
      sql: 'ALTER TABLE student_profiles ADD COLUMN profile_photo TEXT;'
    },
    {
      name: 'major',
      sql: 'ALTER TABLE student_profiles ADD COLUMN major VARCHAR(100);'
    },
    {
      name: 'academic_system',
      sql: 'ALTER TABLE student_profiles ADD COLUMN academic_system VARCHAR(10);'
    },
    {
      name: 'academic_status',
      sql: "ALTER TABLE student_profiles ADD COLUMN academic_status VARCHAR(20) CHECK (academic_status IN ('在读', '休学', '复学', '退学', '毕业', '结业', '肄业', '未完成'));"
    },
    {
      name: 'department',
      sql: 'ALTER TABLE student_profiles ADD COLUMN department VARCHAR(100);'
    },
    {
      name: 'class_info',
      sql: 'ALTER TABLE student_profiles ADD COLUMN class_info VARCHAR(100);'
    },
    {
      name: 'enrollment_year',
      sql: 'ALTER TABLE student_profiles ADD COLUMN enrollment_year VARCHAR(10);'
    }
  ];
  
  const results = [];
  
  for (const fieldDef of fieldDefinitions) {
    try {
      console.log(`尝试添加字段: ${fieldDef.name}`);
      
      // 注意：这需要合适的权限，可能失败
      const { error } = await supabase.rpc('exec_sql', { 
        sql_query: fieldDef.sql 
      });
      
      if (error) {
        console.log(`❌ 添加字段 ${fieldDef.name} 失败:`, error.message);
        results.push({ field: fieldDef.name, success: false, error: error.message });
      } else {
        console.log(`✅ 成功添加字段: ${fieldDef.name}`);
        results.push({ field: fieldDef.name, success: true });
      }
      
    } catch (error) {
      console.log(`❌ 添加字段 ${fieldDef.name} 异常:`, error.message);
      results.push({ field: fieldDef.name, success: false, error: error.message });
    }
  }
  
  return results;
}

/**
 * 创建一个完整的数据库检查报告
 */
export async function generateDatabaseReport(userId?: string) {
  console.log('🔍 开始生成Supabase数据库检查报告...');
  
  const report = {
    timestamp: new Date().toISOString(),
    tableCheck: null,
    dataCheck: null,
    fieldAddition: null,
    summary: ''
  };
  
  // 1. 检查表结构
  console.log('\n--- 第一步：检查表结构 ---');
  report.tableCheck = await checkStudentProfilesTable();
  
  // 2. 如果提供了userId，检查数据
  if (userId && report.tableCheck.success) {
    console.log('\n--- 第二步：检查数据 ---');
    report.dataCheck = await checkStudentProfilesData(userId);
  }
  
  // 3. 如果有缺失字段，尝试添加
  if (!report.tableCheck.success && report.tableCheck.missingFields?.length > 0) {
    console.log('\n--- 第三步：尝试添加缺失字段 ---');
    report.fieldAddition = await addMissingFieldsToDatabase();
  }
  
  // 4. 生成总结
  if (report.tableCheck.success) {
    report.summary = '✅ 数据库结构完整，个人资料功能应该正常工作';
  } else {
    report.summary = `❌ 数据库结构不完整，缺少字段：${report.tableCheck.missingFields?.join(', ')}`;
  }
  
  console.log('\n=== 数据库检查报告 ===');
  console.log('时间:', report.timestamp);
  console.log('表结构检查:', report.tableCheck.success ? '通过' : '失败');
  if (userId) {
    console.log('数据检查:', report.dataCheck?.success ? '通过' : '失败');
  }
  console.log('总结:', report.summary);
  
  return report;
}

// 暴露到全局，方便在浏览器控制台中使用
if (typeof window !== 'undefined') {
  (window as any).checkSupabaseDatabase = {
    checkStudentProfilesTable,
    checkStudentProfilesData,
    addMissingFieldsToDatabase,
    generateDatabaseReport
  };
}