import { supabase } from '../lib/supabase'
import { GraduationDestination } from '../types/graduationDestination'

export class GraduationDestinationService {
  // 获取毕业去向列表（带分页）
  static async getGraduationDestinations(params?: {
    destination_type?: string
    status?: string
    student_name?: string
    page?: number
    limit?: number
  }): Promise<{
    destinations: GraduationDestination[]
    total: number
    page: number
    limit: number
  }> {
    const {
      destination_type,
      status,
      student_name,
      page = 1,
      limit = 50
    } = params || {};

    try {
      // 先获取毕业去向数据，不进行嵌套查询
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
        console.error('获取毕业去向列表失败:', error);
        throw new Error(`获取毕业去向列表失败: ${error.message}`);
      }

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

      return {
        destinations: [],
      };
    } catch (error) {
      console.error('获取毕业去向失败:', error);
      return {
        destinations: [],
        total: 0,
        page,
        limit
      };
    }
  }

  // 创建毕业去向记录
  static async createGraduationDestination(data: Partial<GraduationDestination>): Promise<GraduationDestination> {
    try {
      const { data: result, error } = await supabase
        .from('graduation_destinations')
        .insert([{
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('创建毕业去向失败:', error);
        throw new Error(`创建毕业去向失败: ${error.message}`);
      }

      return result as GraduationDestination;
    } catch (error) {
      console.error('创建毕业去向异常:', error);
      throw new Error(`创建毕业去向异常: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // 更新毕业去向记录
  static async updateGraduationDestination(id: string, data: Partial<GraduationDestination>): Promise<GraduationDestination> {
    try {
      const { data: result, error } = await supabase
        .from('graduation_destinations')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('更新毕业去向失败:', error);
        throw new Error(`更新毕业去向失败: ${error.message}`);
      }

      return result as GraduationDestination;
    } catch (error) {
      console.error('更新毕业去向异常:', error);
      throw new Error(`更新毕业去向异常: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // 删除毕业去向记录
  static async deleteGraduationDestination(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('graduation_destinations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('删除毕业去向失败:', error);
        throw new Error(`删除毕业去向失败: ${error.message}`);
      }
    } catch (error) {
      console.error('删除毕业去向异常:', error);
      throw new Error(`删除毕业去向异常: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // 获取单个学生的毕业去向信息
  static async getGraduationDestinationByStudentId(studentId: string): Promise<GraduationDestination | null> {
    try {
      // 查询指定学生的毕业去向信息
      const { data: result, error } = await supabase
        .from('graduation_destinations')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // 没有找到记录，返回null
          return null;
        }
        console.error('获取学生毕业去向失败:', error);
        throw new Error(`获取学生毕业去向失败: ${error.message}`);
      }

      if (result) {
        // 获取学生信息 (使用user_number字段，但在返回时映射为student_number)
        const { data: studentData, error: studentError } = await supabase
          .from('users')
          .select('id, user_number, full_name, class_name')
          .eq('id', studentId)
          .single();

        if (!studentError && studentData) {
          return {
            ...result,
            student: {
              student_number: studentData.user_number,
              full_name: studentData.full_name,
              class_name: studentData.class_name
            }
          };
        }

        return result as GraduationDestination;
      }

      return null;
    } catch (error) {
      console.error('获取学生毕业去向异常:', error);
      throw new Error(`获取学生毕业去向异常: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // 保存毕业去向（创建或更新）
  static async saveGraduationDestination(data: Partial<GraduationDestination>): Promise<GraduationDestination> {
    try {
      // 如果有id，则更新现有记录
      if (data.id) {
        return await this.updateGraduationDestination(data.id, data);
      } 
      // 否则创建新记录
      else {
        return await this.createGraduationDestination(data);
      }
    } catch (error) {
      console.error('保存毕业去向失败:', error);
      throw new Error(`保存毕业去向失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // 审核毕业去向
  static async reviewGraduationDestination(id: string, status: 'approved' | 'rejected', reason?: string): Promise<GraduationDestination> {
    try {
      const { data, error } = await supabase
        .from('graduation_destinations')
        .update({
          status,
          review_comment: reason,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('审核毕业去向失败:', error);
        throw new Error(`审核毕业去向失败: ${error.message}`);
      }

      return data as GraduationDestination;
    } catch (error) {
      console.error('审核毕业去向异常:', error);
      throw new Error(`审核毕业去向异常: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  

  // 获取毕业去向统计数据
  static async getGraduationStats(): Promise<{ approvedCount: number; pendingCount: number }> {
    try {
      // 获取已审核通过的毕业去向数量（所有类型）
      const { count: approvedCount, error } = await supabase
        .from('graduation_destinations')
        .select('id', { count: 'exact' })
        .eq('status', 'approved');

      if (error) {
        console.error('获取毕业去向统计失败:', error);
        return { approvedCount: 0, pendingCount: 0 };
      }

      // 获取待审核的毕业去向数量
      const { count: pendingCount } = await supabase
        .from('graduation_destinations')
        .select('id', { count: 'exact' })
        .eq('status', 'pending');

      return {
        approvedCount: approvedCount || 0,
        pendingCount: pendingCount || 0
      };
    } catch (error) {
      console.error('获取毕业去向统计异常:', error);
      return { approvedCount: 0, pendingCount: 0 };
    }
  }

  // 获取按去向类型分组的统计数据
  static async getGraduationDestinationStats(teacherId?: string): Promise<Record<string, number>> {
    try {
      // 初始化查询
      let query = supabase
        .from('graduation_destinations')
        .select('destination_type', { count: 'exact' })
        .eq('status', 'approved')
        .group('destination_type');

      // 如果提供了教师ID，可以添加过滤条件
      if (teacherId) {
        // 这里可以根据实际数据库结构调整过滤逻辑
        query = query.eq('teacher_id', teacherId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('获取毕业去向类型统计失败:', error);
        // 返回默认值
        return {
          employment: 0,
          furtherstudy: 0,
          entrepreneurship: 0,
          abroad: 0,
          unemployed: 0,
          other: 0
        };
      }

      // 初始化结果对象
      const result: Record<string, number> = {
        employment: 0,
        furtherstudy: 0,
        entrepreneurship: 0,
        abroad: 0,
        unemployed: 0,
        other: 0
      };

      // 处理返回的数据
      if (data && Array.isArray(data)) {
        data.forEach(item => {
          const type = item.destination_type;
          const count = item.count || 0;
          if (result.hasOwnProperty(type)) {
            result[type] = count;
          }
        });
      }

      return result;
    } catch (error) {
      console.error('获取毕业去向类型统计异常:', error);
      // 返回默认值
      return {
        employment: 0,
        furtherstudy: 0,
        entrepreneurship: 0,
        abroad: 0,
        unemployed: 0,
        other: 0
      };
    }
  }

  // 创建ZIP导出
  static async createZipExport(userId: string): Promise<{ success: boolean; error?: string; zipBlob?: Blob }> {
    try {
      // 动态导入 JSZip
      let JSZip;
      try {
        JSZip = (await import('jszip')).default;
      } catch (importError) {
        console.warn('JSZip导入失败:', importError);
        return {
          success: false,
          error: 'ZIP功能不可用，将使用单独下载'
        };
      }
      
      if (!JSZip) {
        return {
          success: false,
          error: 'ZIP功能不可用，将使用单独下载'
        };
      }

      // 获取用户的所有文档
      const { documents: allDocuments } = await this.getUserDocuments(userId, {
        limit: 1000
      });

      if (allDocuments.length === 0) {
        return {
          success: false,
          error: '没有可导出的文档'
        };
      }

      // 创建ZIP文件
      const zip = new JSZip();

      // 添加文档到ZIP
      for (const doc of allDocuments) {
        if (doc.file_content) {
          try {
            // 处理 base64 数据
            let fileContent;
            if (typeof doc.file_content === 'string' && doc.file_content.startsWith('data:')) {
              // 处理 data URL
              const response = await fetch(doc.file_content);
              fileContent = await response.blob();
            } else {
              // 直接使用二进制数据
              fileContent = doc.file_content;
            }

            zip.file(doc.file_name, fileContent);
          } catch (fileError) {
            console.warn(`添加文件 ${doc.file_name} 到ZIP失败:`, fileError);
            continue;
          }
        }
      }

      // 生成ZIP blob
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      return {
        success: true,
        zipBlob
      };
    } catch (error) {
      console.error('创建ZIP导出失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '创建ZIP导出失败'
      };
    }
  }

  // 获取用户文档（这个方法可能需要从其他服务导入）
  private static async getUserDocuments(userId: string, params?: { limit?: number }): Promise<{
    documents: any[]
  }> {
    try {
      const { limit = 1000 } = params || {};
      
      const { data, error } = await supabase
        .from('student_documents')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('获取用户文档失败:', error);
        return { documents: [] };
      }

      return {
        documents: data || []
      };
    } catch (error) {
      console.error('获取用户文档异常:', error);
      return { documents: [] };
    }
  }
}