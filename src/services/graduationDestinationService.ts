import { supabase } from '../lib/supabase';
import { safeGetUserId } from './userHelper';

export interface GraduationDestination {
  id: string;
  student_id: string;
  teacher_id?: string;
  destination_type: 'employment' | 'furtherstudy' | 'abroad' | 'entrepreneurship' | 'unemployed' | 'other';
  company_name?: string;
  position?: string;
  salary?: number;
  work_location?: string;
  school_name?: string;
  major?: string;
  degree?: string;
  abroad_country?: string;
  startup_name?: string;
  startup_role?: string;
  other_description?: string;
  status: 'pending' | 'approved' | 'rejected';
  review_comment?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  proof_files: string[];
  submit_time: string;
  batch_import_id?: string;
  created_at: string;
  updated_at: string;
  // 关联的学生信息
  student?: {
    student_id: string;
    student_name: string;
    class_info: string;
  };
}

export interface GraduationImportBatch {
  id: string;
  batch_name: string;
  import_file_path?: string;
  total_records: number;
  success_count: number;
  failure_count: number;
  status: 'processing' | 'completed' | 'failed';
  error_details: any[];
  imported_by: string;
  created_at: string;
  updated_at: string;
}

export interface GraduationImportFailure {
  id: string;
  batch_id: string;
  row_number: number;
  student_number?: string;
  error_message: string;
  raw_data: any;
  created_at: string;
}

export interface GraduationDestinationSearchParams {
  keyword?: string;
  destination_type?: string;
  status?: string;
  class_name?: string;
  page?: number;
  limit?: number;
}

export interface GraduationDestinationListResponse {
  destinations: GraduationDestination[];
  total: number;
}

export class GraduationDestinationService {
  // 获取毕业去向列表
  static async getGraduationDestinations(
    params: GraduationDestinationSearchParams = {}
  ): Promise<GraduationDestinationListResponse> {
    const {
      keyword = '',
      destination_type = '',
      status = '',
      class_name = '',
      page = 1,
      limit = 50
    } = params;

    try {
<<<<<<< HEAD
      // 从 graduation_destinations 表查询
=======
      // 先获取毕业去向数据，不进行嵌套查询
>>>>>>> 99189c3911effb11cb5198390faf752cce0c6415
      let query = supabase
        .from('graduation_destinations')
        .select('*', { count: 'exact' });

      // 去向类型筛选
      if (destination_type) {
        query = query.eq('destination_type', destination_type);
      }

      // 状态筛选
      if (status) {
        query = query.eq('status', status);
      }

      // 排序和分页
      const offset = (page - 1) * limit;
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('查询毕业去向失败:', error);
        // 如果表不存在或查询失败，返回空列表
        return {
          destinations: [],
          total: 0
        };
      }

<<<<<<< HEAD
      // 获取所有学生ID
      const studentIds = [...new Set((data || []).map((item: any) => item.student_id).filter(Boolean))];
      
      // 批量查询学生信息
      let studentsMap: Record<string, any> = {};
      if (studentIds.length > 0) {
        const { data: studentsData } = await supabase
          .from('student_profiles')
          .select('id, student_number, full_name, class_name')
          .in('id', studentIds);

        if (studentsData) {
          studentsMap = studentsData.reduce((acc: Record<string, any>, student: any) => {
            acc[student.id] = student;
            return acc;
          }, {});
        }
      }

      // 转换数据格式
      const destinations: GraduationDestination[] = (data || []).map((item: any) => {
        const student = studentsMap[item.student_id] || {};
        
        // 关键词和班级筛选（在内存中过滤）
        let shouldInclude = true;
        if (keyword) {
          const keywordLower = keyword.toLowerCase();
          const studentNumber = (student.student_number || '').toLowerCase();
          const studentName = (student.full_name || '').toLowerCase();
          shouldInclude = studentNumber.includes(keywordLower) || studentName.includes(keywordLower);
        }
        if (class_name && shouldInclude) {
          const className = (student.class_name || '').toLowerCase();
          shouldInclude = className.includes(class_name.toLowerCase());
        }
        
        if (!shouldInclude) {
          return null;
        }

        return {
          id: item.id,
          student_id: item.student_id,
          teacher_id: item.teacher_id,
          destination_type: item.destination_type,
          company_name: item.company_name || '',
          position: item.position || '',
          salary: item.salary ? parseFloat(item.salary.toString()) : undefined,
          work_location: item.work_location || '',
          school_name: item.school_name || '',
          major: item.major || '',
          degree: item.degree || '',
          abroad_country: item.abroad_country || '',
          startup_name: item.startup_name || '',
          startup_role: item.startup_role || '',
          other_description: item.other_description || '',
          status: item.status || 'pending',
          review_comment: item.review_comment || '',
          reviewed_at: item.reviewed_at || '',
          reviewed_by: item.reviewed_by || '',
          proof_files: Array.isArray(item.proof_files) ? item.proof_files : (item.proof_files ? [item.proof_files] : []),
          submit_time: item.submit_time || item.created_at || new Date().toISOString(),
          batch_import_id: item.batch_import_id || '',
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString(),
          student: {
            student_id: student.student_number || student.id || '',
            student_name: student.full_name || '',
            class_info: student.class_name || ''
          }
        };
      }).filter(Boolean) as GraduationDestination[];
=======
      // 如果有数据，分别获取学生信息
      if (data && data.length > 0) {
        // 获取所有唯一的学生ID
        const studentIds = [...new Set(data.map((item: any) => item.student_id))];
        
        // 获取学生信息 (使用user_number字段，但在返回时映射为student_number)
        const { data: studentsData, error: studentsError } = await supabase
          .from('users')
          .select('id, user_number, full_name, class_name')  // 数据库中字段名为user_number
          .in('id', studentIds);

        if (studentsError) {
          console.warn('获取学生信息失败:', studentsError);
          // 即使获取学生信息失败，也返回毕业去向数据
          return {
            destinations: data.map((item: any) => ({
              ...item,
              student: null
            })),
            total: count || 0
          };
        }

        // 创建学生信息映射 (将user_number映射为student_number以匹配类型定义)
        const studentMap = studentsData?.reduce((map: Record<string, any>, student: any) => {
          map[student.id] = {
            student_number: student.user_number,  // 字段映射
            full_name: student.full_name,
            class_name: student.class_name
          };
          return map;
        }, {} as Record<string, any>) || {};

        // 合并数据
        const destinations = data.map((item: any) => ({
          ...item,
          student: studentMap[item.student_id] || null
        }));

        return {
          destinations,
          total: count || 0
        };
      }
>>>>>>> 99189c3911effb11cb5198390faf752cce0c6415

      return {
        destinations,
        total: destinations.length // 注意：这里返回的是过滤后的数量，实际总数可能需要单独查询
      };
    } catch (error) {
      console.error('获取毕业去向列表失败:', error);
      // 发生错误时返回空列表，避免页面崩溃
      return {
        destinations: [],
        total: 0
      };
    }
  }

  // 获取单个毕业去向详情
  static async getGraduationDestinationById(id: string): Promise<GraduationDestination | null> {
    try {
      const { data, error } = await supabase
        .from('graduation_destinations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`获取毕业去向详情失败: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('获取毕业去向详情失败:', error);
      throw error;
    }
  }

  // 根据学生ID获取毕业去向
  static async getGraduationDestinationByStudentId(studentId: string): Promise<GraduationDestination | null> {
    try {
      const { data, error } = await supabase
        .from('graduation_destinations')
        .select('*')
        .eq('student_id', studentId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`获取学生毕业去向失败: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('获取学生毕业去向失败:', error);
      throw error;
    }
  }

  // 创建/更新毕业去向
  static async saveGraduationDestination(
    destinationData: Partial<GraduationDestination> & {
      student_id: string;
      destination_type: string;
    }
  ): Promise<GraduationDestination> {
    try {
      // 检查是否已存在记录
      const existingRecord = await this.getGraduationDestinationByStudentId(destinationData.student_id);

      // 过滤掉可能引起问题的字段，只保留数据库中存在的字段
      const filteredData: any = {
        destination_type: destinationData.destination_type,
        company_name: destinationData.company_name,
        position: destinationData.position,
        salary: destinationData.salary,
        work_location: destinationData.work_location,
        school_name: destinationData.school_name,
        major: destinationData.major,
        degree: destinationData.degree,
        abroad_country: destinationData.abroad_country,
        startup_name: destinationData.startup_name,
        startup_role: destinationData.startup_role,
        other_description: destinationData.other_description,
        status: 'pending',
        submit_time: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // 只有在字段存在时才添加它们
      if (destinationData.hasOwnProperty('proof_files')) {
        filteredData.proof_files = destinationData.proof_files || [];
      }

      if (existingRecord) {
        // 更新现有记录
        const { data, error } = await supabase
          .from('graduation_destinations')
          .update(filteredData)
          .eq('id', existingRecord.id)
          .select('*')
          .single();

        if (error) {
          throw new Error(`更新毕业去向失败: ${error.message}`);
        }

        return data;
      } else {
        // 创建新记录
        const insertData = {
          ...filteredData,
          student_id: destinationData.student_id
        };

        const { data, error } = await supabase
          .from('graduation_destinations')
          .insert(insertData)
          .select('*')
          .single();

        if (error) {
          throw new Error(`创建毕业去向失败: ${error.message}`);
        }

        return data;
      }
    } catch (error) {
      console.error('保存毕业去向失败:', error);
      throw error;
    }
  }

  // 审核毕业去向
  static async reviewGraduationDestination(
    id: string,
    status: 'approved' | 'rejected',
    reviewComment?: string
  ): Promise<GraduationDestination> {
    try {
      // 安全获取用户信息
      const userId = await safeGetUserId();
      console.log('审核操作，获取到的用户ID:', userId);

      const { data, error } = await supabase
        .from('graduation_destinations')
        .update({
          status,
          review_comment: reviewComment,
          reviewed_at: new Date().toISOString(),
          reviewed_by: userId,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        throw new Error(`审核毕业去向失败: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('审核毕业去向失败:', error);
      throw error;
    }
  }

  // 批量导入毕业去向
  static async batchImportGraduationDestinations(
    batchName: string,
    filename: string,
    data: any[]
  ): Promise<GraduationImportBatch> {
    try {
      // 安全获取用户信息
      const userId = await safeGetUserId();
      console.log('获取到的用户ID:', userId);

      // 验证数据格式
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('导入数据不能为空');
      }

      // 调用存储过程进行批量导入
      const { data: result, error } = await supabase.rpc(
        'batch_import_graduation_destinations',
        {
          p_batch_name: batchName,
          p_filename: filename,
          p_data: data,
          p_imported_by: userId
        }
      );

      if (error) {
        console.error('RPC调用失败:', error);
        // 如果存储过程不存在，尝试手动处理
        return this.handleManualImport(batchName, filename, data, userId);
      }

      // 获取导入批次详情
      const batch = await this.getImportBatch(result);
      return batch || {
        id: result,
        batch_name: batchName,
        import_file_path: filename,
        total_records: data.length,
        success_count: data.length,
        failure_count: 0,
        status: 'completed' as const,
        error_details: [],
        imported_by: userId || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('批量导入毕业去向失败:', error);
      throw error;
    }
  }

  // 简化的手动处理导入
  private static async handleManualImport(
    batchName: string,
    filename: string,
    data: any[],
    userId: string | null
  ): Promise<GraduationImportBatch> {
    console.log('开始手动导入，数据条数:', data.length);
    let successCount = 0;
    let failedCount = 0;
    const errors: any[] = [];

    // 创建导入批次记录
    const { data: batch, error: batchError } = await supabase
      .from('graduation_import_batches')
      .insert({
        batch_name: batchName,
        import_file_path: filename,
        total_records: data.length,
        success_count: 0,
        failure_count: 0,
        status: 'processing',
        imported_by: userId
      })
      .select()
      .single();

    if (batchError || !batch) {
      console.error('创建导入批次失败:', batchError);
      throw new Error(`创建导入批次失败: ${batchError?.message || '未知错误'}`);
    }

    console.log('导入批次创建成功，批次ID:', batch.id);

    // 逐条处理数据
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      console.log(`处理第${i + 1}行数据:`, row);
      
      try {
        // 验证必需字段
        if (!row.student_number || !row.destination_type) {
          throw new Error('缺少必需字段：学号或去向类型');
        }

        // 先查找学生ID - 使用可能存在的字段名
        let studentData = null;
        let studentError = null;

        // 尝试通过 student_number 查找
        const { data: studentByNumber, error: errorByNumber } = await supabase
          .from('student_profiles')
          .select('id, student_number, full_name')
          .eq('student_number', String(row.student_number).trim())
          .maybeSingle();

        if (!studentByNumber && !errorByNumber) {
          // 如果找不到，尝试通过 id 字段查找（有些表可能用 id 作为学号）
          const { data: studentById, error: errorById } = await supabase
            .from('student_profiles')
            .select('id, student_number, full_name')
            .eq('id', String(row.student_number).trim())
            .maybeSingle();
          
          if (studentById) {
            studentData = studentById;
          } else {
            studentError = errorById;
          }
        } else {
          studentData = studentByNumber;
          studentError = errorByNumber;
        }

        if (studentError || !studentData) {
          console.error(`找不到学号为 ${row.student_number} 的学生:`, studentError);
          throw new Error(`找不到学号为 ${row.student_number} 的学生，请先确保该学生已存在于系统中`);
        }

        console.log(`找到学生:`, studentData);

        // 检查是否已存在记录
        const { data: existingData } = await supabase
          .from('graduation_destinations')
          .select('id')
          .eq('student_id', studentData.id)
          .maybeSingle();

        const destinationData: any = {
          student_id: studentData.id,
          destination_type: row.destination_type,
          company_name: row.company_name && String(row.company_name).trim() ? String(row.company_name).trim() : null,
          position: row.position && String(row.position).trim() ? String(row.position).trim() : null,
          salary: row.salary && String(row.salary).trim() ? parseFloat(String(row.salary).trim()) : null,
          work_location: row.work_location && String(row.work_location).trim() ? String(row.work_location).trim() : null,
          school_name: row.school_name && String(row.school_name).trim() ? String(row.school_name).trim() : null,
          major: row.major && String(row.major).trim() ? String(row.major).trim() : null,
          degree: row.degree && String(row.degree).trim() ? String(row.degree).trim() : null,
          abroad_country: row.abroad_country && String(row.abroad_country).trim() ? String(row.abroad_country).trim() : null,
          startup_name: row.startup_name && String(row.startup_name).trim() ? String(row.startup_name).trim() : null,
          startup_role: row.startup_role && String(row.startup_role).trim() ? String(row.startup_role).trim() : null,
          other_description: row.other_description && String(row.other_description).trim() ? String(row.other_description).trim() : null,
          status: 'pending',
          batch_import_id: batch.id,
          submit_time: new Date().toISOString()
        };

        let result;
        if (existingData) {
          // 更新现有记录
          console.log(`更新现有记录，ID: ${existingData.id}`);
          const { data: updateData, error: updateError } = await supabase
            .from('graduation_destinations')
            .update(destinationData)
            .eq('id', existingData.id)
            .select()
            .single();
          
          if (updateError) {
            console.error('更新失败:', updateError);
            throw new Error(`更新失败: ${updateError.message}`);
          }
          result = updateData;
        } else {
          // 创建新记录
          console.log('创建新记录');
          const { data: insertData, error: insertError } = await supabase
            .from('graduation_destinations')
            .insert(destinationData)
            .select()
            .single();
          
          if (insertError) {
            console.error('插入失败:', insertError);
            throw new Error(`插入失败: ${insertError.message}`);
          }
          result = insertData;
        }

        if (result) {
          successCount++;
          console.log(`✅ 第${i + 1}行成功:`, row.student_number);
        } else {
          throw new Error('导入失败：未返回结果');
        }
      } catch (error) {
        console.error(`❌ 处理第${i + 1}行数据失败:`, error);
        const errorMessage = error instanceof Error ? error.message : '处理失败';
        errors.push({
          row_number: i + 1,
          student_number: row.student_number || '',
          error_message: errorMessage,
          raw_data: row
        });
        failedCount++;
      }
    }

    console.log(`导入完成: 成功 ${successCount} 条，失败 ${failedCount} 条`);

    // 更新批次状态
    const finalStatus = failedCount === 0 ? 'completed' : (successCount > 0 ? 'completed' : 'failed');
    const { error: updateError } = await supabase
      .from('graduation_import_batches')
      .update({
        success_count: successCount,
        failure_count: failedCount,
        status: finalStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', batch.id);

    if (updateError) {
      console.error('更新批次状态失败:', updateError);
    }

    // 记录失败详情
    if (errors.length > 0) {
      const { error: insertError } = await supabase
        .from('graduation_import_failures')
        .insert(errors.map(error => ({
          ...error,
          batch_id: batch.id
        })));

      if (insertError) {
        console.error('记录失败详情失败:', insertError);
      }
    }

    return {
      ...batch,
      success_count: successCount,
      failure_count: failedCount, // 注意：使用 failure_count 而不是 failed_count
      status: finalStatus as 'completed' | 'failed',
      total_records: data.length
    };
  }

  // 获取导入批次列表
  static async getImportBatches(
    page: number = 1,
    limit: number = 10
  ): Promise<{ batches: GraduationImportBatch[], total: number }> {
    try {
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from('graduation_import_batches')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`获取导入批次列表失败: ${error.message}`);
      }

      return {
        batches: data || [],
        total: count || 0
      };
    } catch (error) {
      console.error('获取导入批次列表失败:', error);
      throw error;
    }
  }

  // 获取单个导入批次详情
  static async getImportBatch(id: string): Promise<GraduationImportBatch | null> {
    try {
      const { data, error } = await supabase
        .from('graduation_import_batches')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`获取导入批次详情失败: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('获取导入批次详情失败:', error);
      throw error;
    }
  }

  // 获取导入失败详情
  static async getImportFailures(batchId: string): Promise<GraduationImportFailure[]> {
    try {
      const { data, error } = await supabase
        .from('graduation_import_failures')
        .select('*')
        .eq('batch_id', batchId)
        .order('row_number', { ascending: true });

      if (error) {
        throw new Error(`获取导入失败详情失败: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('获取导入失败详情失败:', error);
      throw error;
    }
  }

  // 获取毕业去向统计
  static async getGraduationStats(): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('get_graduation_stats');

      if (error) {
        throw new Error(`获取统计数据失败: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('获取统计数据失败:', error);
      throw error;
    }
  }

  // 删除毕业去向
  static async deleteGraduationDestination(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('graduation_destinations')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`删除毕业去向失败: ${error.message}`);
      }
    } catch (error) {
      console.error('删除毕业去向失败:', error);
      throw error;
    }
  }

  // 批量删除毕业去向
  static async batchDeleteGraduationDestinations(ids: string[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('graduation_destinations')
        .delete()
        .in('id', ids);

      if (error) {
        throw new Error(`批量删除毕业去向失败: ${error.message}`);
      }
    } catch (error) {
      console.error('批量删除毕业去向失败:', error);
      throw error;
    }
  }
}