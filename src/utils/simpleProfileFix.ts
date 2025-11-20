/**
 * 简化的个人资料修复方案
 * 如果数据库字段不存在，使用JSON字段存储数据
 */

import { supabase } from '../lib/supabase';

/**
 * 扩展的个人资料数据结构
 */
interface ExtendedProfileData {
  profile_photo?: string;
  major?: string;
  academic_system?: string;
  academic_status?: string;
  department?: string;
  class_info?: string;
  enrollment_year?: string;
}

/**
 * 将扩展字段存储为JSON到existing字段中
 */
export async function saveExtendedProfileData(userId: string, data: ExtendedProfileData) {
  try {
    // 首先尝试直接保存到字段（如果字段存在）
    try {
      const { error: directError } = await supabase
        .from('student_profiles')
        .update(data)
        .eq('user_id', userId);

      if (!directError) {
        console.log('✅ 扩展字段保存成功');
        return true;
      }
    } catch (error) {
      console.warn('直接保存扩展字段失败，尝试备用方案:', error);
    }

    // 备用方案：将扩展数据存储到 home_address 字段的JSON格式
    const { data: currentProfile, error: fetchError } = await supabase
      .from('student_profiles')
      .select('home_address')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('获取当前个人资料失败:', fetchError);
      return false;
    }

    // 解析现有的home_address，可能已经包含了扩展数据
    let existingData = {};
    if (currentProfile?.home_address) {
      try {
        // 尝试解析为JSON
        existingData = JSON.parse(currentProfile.home_address);
      } catch {
        // 如果不是JSON，保留原值
        existingData = { original_address: currentProfile.home_address };
      }
    }

    // 合并扩展数据
    const combinedData = {
      ...existingData,
      extended_fields: data,
      _last_updated: new Date().toISOString()
    };

    // 保存到 home_address 字段（作为JSON）
    const { error: updateError } = await supabase
      .from('student_profiles')
      .update({
        home_address: JSON.stringify(combinedData)
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('保存扩展数据失败:', updateError);
      return false;
    }

    console.log('✅ 扩展数据已保存到JSON格式');
    return true;

  } catch (error) {
    console.error('保存扩展数据异常:', error);
    return false;
  }
}

/**
 * 读取扩展的个人资料数据
 */
export async function loadExtendedProfileData(userId: string): Promise<ExtendedProfileData> {
  try {
    // 首先尝试直接从字段读取
    try {
      const { data: directData, error: directError } = await supabase
        .from('student_profiles')
        .select('profile_photo, major, academic_system, academic_status, department, class_info, enrollment_year')
        .eq('user_id', userId)
        .single();

      if (!directError && directData) {
        // 检查是否有非空的扩展字段
        const hasData = Object.values(directData).some(value => 
          value !== null && value !== undefined && value !== ''
        );

        if (hasData) {
          console.log('✅ 从字段读取扩展数据成功');
          return directData;
        }
      }
    } catch (error) {
      console.warn('直接读取扩展字段失败，尝试备用方案:', error);
    }

    // 备用方案：从 home_address 字段的JSON格式读取
    const { data: profileData, error: fetchError } = await supabase
      .from('student_profiles')
      .select('home_address')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('获取个人资料失败:', fetchError);
      return {};
    }

    if (!profileData?.home_address) {
      console.log('没有找到扩展数据');
      return {};
    }

    try {
      const parsedData = JSON.parse(profileData.home_address);
      console.log('✅ 从JSON读取扩展数据成功:', parsedData);
      
      return parsedData.extended_fields || {};
    } catch (error) {
      console.warn('解析JSON数据失败:', error);
      return {};
    }

  } catch (error) {
    console.error('读取扩展数据异常:', error);
    return {};
  }
}

/**
 * 检查数据库字段是否存在
 */
export async function checkFieldsExist(): Promise<boolean> {
  const fieldsToCheck = [
    'profile_photo', 'major', 'academic_system', 'academic_status', 
    'department', 'class_info', 'enrollment_year'
  ];

  try {
    const { data: columns, error } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'student_profiles')
      .in('column_name', fieldsToCheck);

    if (error) {
      console.warn('检查字段存在性失败:', error);
      return false;
    }

    const existingColumns = columns?.map(col => col.column_name) || [];
    const missingFields = fieldsToCheck.filter(field => !existingColumns.includes(field));

    if (missingFields.length > 0) {
      console.log(`缺失字段: ${missingFields.join(', ')}`);
      return false;
    }

    console.log('✅ 所有扩展字段都存在');
    return true;

  } catch (error) {
    console.error('检查字段存在性异常:', error);
    return false;
  }
}