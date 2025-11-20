import { supabase } from '../lib/supabase';

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
    student_number: string;
    full_name: string;
    class_name: string;
  };
}

export interface GraduationImportBatch {
  id: string;
  batch_name: string;
  filename?: string;
  total_count: number;
  success_count: number;
  failed_count: number;
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
  student_id?: string;
  error_message: string;
  original_data: any;
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
      // 构建查询
      let query = supabase
        .from('graduation_destinations')
        .select(`
          *,
          student!inner (
            student_number,
            full_name,
            class_name
          )
        `, { count: 'exact' });

      // 关键词搜索
      if (keyword) {
        query = query.or(`student.student_number.ilike.%${keyword}%,student.full_name.ilike.%${keyword}%`);
      }

      // 去向类型筛选
      if (destination_type) {
        query = query.eq('destination_type', destination_type);
      }

      // 状态筛选
      if (status) {
        query = query.eq('status', status);
      }

      // 班级筛选
      if (class_name) {
        query = query.eq('student.class_name', class_name);
      }

      // 排序和分页
      const offset = (page - 1) * limit;
      query = query
        .order('submit_time', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`获取毕业去向列表失败: ${error.message}`);
      }

      return {
        destinations: data || [],
        total: count || 0
      };
    } catch (error) {
      console.error('获取毕业去向列表失败:', error);
      throw error;
    }
  }

  // 获取单个毕业去向详情
  static async getGraduationDestinationById(id: string): Promise<GraduationDestination | null> {
    try {
      const { data, error } = await supabase
        .from('graduation_destinations')
        .select(`
          *,
          student!inner (
            student_number,
            full_name,
            class_name
          )
        `)
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
        .select(`
          *,
          student!inner (
            student_number,
            full_name,
            class_name
          )
        `)
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

      if (existingRecord) {
        // 更新现有记录
        const { data, error } = await supabase
          .from('graduation_destinations')
          .update({
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
            proof_files: destinationData.proof_files || [],
            status: 'pending', // 重新提交后设为待审核
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRecord.id)
          .select(`
            *,
            student!inner (
              student_number,
              full_name,
              class_name
            )
          `)
          .single();

        if (error) {
          throw new Error(`更新毕业去向失败: ${error.message}`);
        }

        return data;
      } else {
        // 创建新记录
        const { data, error } = await supabase
          .from('graduation_destinations')
          .insert({
            student_id: destinationData.student_id,
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
            proof_files: destinationData.proof_files || [],
            status: 'pending',
            submit_time: new Date().toISOString()
          })
          .select(`
            *,
            student!inner (
              student_number,
              full_name,
              class_name
            )
          `)
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('用户未登录');
      }

      const { data, error } = await supabase
        .from('graduation_destinations')
        .update({
          status,
          review_comment: reviewComment,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          student!inner (
            student_number,
            full_name,
            class_name
          )
        `)
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('用户未登录');
      }

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
          p_imported_by: user.id
        }
      );

      if (error) {
        console.error('RPC调用失败:', error);
        // 如果存储过程不存在，尝试手动处理
        return this.handleManualImport(batchName, filename, data, user.id);
      }

      // 获取导入批次详情
      const batch = await this.getImportBatch(result);
      return batch || {
        id: result,
        batch_name: batchName,
        filename,
        total_count: data.length,
        success_count: data.length,
        failed_count: 0,
        status: 'completed' as const,
        error_details: [],
        imported_by: user.id,
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
    userId: string
  ): Promise<GraduationImportBatch> {
    let successCount = 0;
    let failedCount = 0;
    const errors: any[] = [];

    // 创建导入批次记录
    const { data: batch, error: batchError } = await supabase
      .from('graduation_import_batches')
      .insert({
        batch_name: batchName,
        filename,
        total_count: data.length,
        success_count: 0,
        failed_count: 0,
        status: 'processing',
        imported_by: userId
      })
      .select()
      .single();

    if (batchError || !batch) {
      throw new Error(`创建导入批次失败: ${batchError?.message}`);
    }

    // 逐条处理数据
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        // 使用简化的导入函数
        const { data: result, error: importError } = await supabase
          .rpc('simple_import_graduation_data', {
            p_student_number: row.student_number,
            p_destination_type: row.destination_type,
            p_company_name: row.company_name || null,
            p_position: row.position || null,
            p_salary: row.salary ? parseFloat(row.salary) : null,
            p_work_location: row.work_location || null,
            p_school_name: row.school_name || null,
            p_major: row.major || null,
            p_degree: row.degree || null,
            p_abroad_country: row.abroad_country || null,
            p_startup_name: row.startup_name || null,
            p_startup_role: row.startup_role || null,
            p_other_description: row.other_description || null
          });

        if (importError || !result) {
          throw new Error(`导入失败: ${importError?.message}`);
        }

        const resultText = Array.isArray(result) ? result[0] : result;
        if (typeof resultText === 'string' && resultText.startsWith('SUCCESS')) {
          successCount++;
        } else {
          errors.push({
            row_number: i + 1,
            student_id: row.student_number,
            error_message: resultText || '导入失败',
            original_data: row
          });
          failedCount++;
        }
      } catch (error) {
        errors.push({
          row_number: i + 1,
          student_id: row.student_number,
          error_message: error instanceof Error ? error.message : '处理失败',
          original_data: row
        });
        failedCount++;
      }
    }

    // 更新批次状态
    const { error: updateError } = await supabase
      .from('graduation_import_batches')
      .update({
        success_count: successCount,
        failed_count: failedCount,
        status: failedCount === 0 ? 'completed' : 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', batch.id);

    if (updateError) {
      console.error('更新批次状态失败:', updateError);
    }

    // 记录失败详情
    if (errors.length > 0) {
      await supabase
        .from('graduation_import_failures')
        .insert(errors.map(error => ({
          ...error,
          batch_id: batch.id
        })));
    }

    return {
      ...batch,
      success_count: successCount,
      failed_count: failedCount,
      status: failedCount === 0 ? 'completed' : 'completed'
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