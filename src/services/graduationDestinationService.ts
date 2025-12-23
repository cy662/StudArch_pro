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
    teacher_id?: string  // 添加教师ID参数用于数据隔离
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
      limit = 50,
      teacher_id  // 新增参数
    } = params || {};

    try {
      let destinations: GraduationDestination[] = [];
      let total = 0;

      // 如果提供了teacher_id，使用优化的数据库函数
      if (teacher_id) {
        console.log('使用数据库函数获取教师毕业去向数据:', teacher_id);
        
        const { data, error } = await supabase
          .rpc('get_teacher_graduation_destinations', {
            p_teacher_id: teacher_id,
            p_destination_type: destination_type || null,
            p_status: status || null,
            p_student_name: student_name || null,
            p_page: page,
            p_limit: limit
          });

        if (error) {
          console.error('数据库函数获取毕业去向失败:', error);
          // 降级到原始方法
          return await this.getGraduationDestinationsFallback(params);
        }

        if (data && data.length > 0) {
          destinations = data.map((item: any) => ({
            id: item.id,
            student_id: item.student_id,
            destination_type: item.destination_type,
            status: item.status,
            review_comment: item.review_comment,
            submit_time: item.submit_time,
            reviewed_at: item.reviewed_at,
            created_at: item.created_at,
            updated_at: item.updated_at,
            student: item.student_number ? {
              student_number: item.student_number,
              full_name: item.student_full_name,
              class_name: item.class_name
            } : null
          }));
          total = data[0]?.total_count || 0;
        } else {
          // 没有数据的情况
          const { count } = await supabase
            .rpc('get_teacher_graduation_destinations', {
              p_teacher_id: teacher_id,
              p_destination_type: destination_type || null,
              p_status: status || null,
              p_student_name: student_name || null,
              p_page: 1,
              p_limit: 1
            });
          total = count || 0;
        }
      } else {
        // 没有提供teacher_id时使用原有逻辑（管理员视图）
        return await this.getGraduationDestinationsFallback(params);
      }

      return {
        destinations,
        total,
        page,
        limit
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

  // 降级方法：原有的获取毕业去向逻辑
  private static async getGraduationDestinationsFallback(params?: {
    destination_type?: string
    status?: string
    student_name?: string
    page?: number
    limit?: number
    teacher_id?: string
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
      limit = 50,
      teacher_id
    } = params || {};

    try {
      // 先获取教师管理的学生ID列表（如果提供了teacher_id）
      let teacherStudentIds: string[] = [];
      if (teacher_id) {
        const { data: teacherStudents, error: teacherError } = await supabase
          .from('teacher_students')
          .select('student_id')
          .eq('teacher_id', teacher_id);

        if (teacherError) {
          console.error('获取教师学生列表失败:', teacherError);
          throw new Error(`获取教师学生列表失败: ${teacherError.message}`);
        }

        teacherStudentIds = teacherStudents?.map(ts => ts.student_id) || [];
        
        // 如果该教师没有管理任何学生，返回空结果
        if (teacherStudentIds.length === 0) {
          return {
            destinations: [],
            total: 0,
            page,
            limit
          };
        }
      }

      // 构建查询
      let query = supabase
        .from('graduation_destinations')
        .select('*', { count: 'exact' });

      // 如果有教师ID限制，只查询该教师管理的学生
      if (teacher_id && teacherStudentIds.length > 0) {
        query = query.in('student_id', teacherStudentIds);
      }

      // 去向类型筛选
      if (destination_type) {
        query = query.eq('destination_type', destination_type);
      }

      // 状态筛选
      if (status) {
        query = query.eq('status', status);
      }

      // 学生姓名/学号筛选
      if (student_name) {
        // 先获取匹配的学生ID
        const { data: matchingStudents } = await supabase
          .from('users')
          .select('id')
          .or(`full_name.ilike.%${student_name}%,user_number.ilike.%${student_name}%`);
        
        if (matchingStudents && matchingStudents.length > 0) {
          const matchingStudentIds = matchingStudents.map(s => s.id);
          query = query.in('student_id', matchingStudentIds);
        } else {
          // 没有匹配的学生
          return {
            destinations: [],
            total: 0,
            page,
            limit
          };
        }
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
        total: 0
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
      const { data, error } = await supabase
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

      return data as GraduationDestination;
    } catch (error) {
      console.error('创建毕业去向异常:', error);
      throw new Error(`创建毕业去向异常: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // 更新毕业去向记录
  static async updateGraduationDestination(id: string, data: Partial<GraduationDestination>): Promise<GraduationDestination> {
    try {
      const { data, error } = await supabase
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

      return data as GraduationDestination;
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

  // 根据学生ID获取毕业去向记录
  static async getGraduationDestinationByStudentId(studentId: string): Promise<GraduationDestination | null> {
    try {
      // 检查表是否存在 - 如果不存在直接返回null
      try {
        const { data: testData, error: testError } = await supabase
          .from('graduation_destinations')
          .select('count', { count: 'exact', head: true });
        
        if (testError && testError.code === 'PGRST116') {
          console.warn('graduation_destinations表不存在，跳过查询');
          return null;
        }
      } catch (tableError) {
        console.warn('检查graduation_destinations表失败:', tableError);
        return null;
      }

      const { data, error } = await supabase
        .from('graduation_destinations')
        .select('*')
        .eq('student_id', studentId)
        .maybeSingle();

      if (error) {
        // 如果是表不存在或字段不存在，返回null而不是抛出错误
        if (error.code === 'PGRST116' || error.code === 'PGRST204' || error.status === 406) {
          console.warn('毕业去向数据不存在或表结构问题:', error.message);
          return null;
        }
        // 处理多个结果的情况
        if (error.message && error.message.includes('coerce the result to a single JSON object')) {
          console.warn('找到多条毕业去向记录，获取第一条');
          const { data: multipleData, error: multipleError } = await supabase
            .from('graduation_destinations')
            .select('*')
            .eq('student_id', studentId)
            .limit(1);
          
          if (multipleError) {
            console.error('获取多条毕业去向记录失败:', multipleError);
            return null;
          }
          
          return multipleData && multipleData.length > 0 ? multipleData[0] as GraduationDestination : null;
        }
        console.error('获取学生毕业去向失败:', error);
        return null;
      }

      return data as GraduationDestination;
    } catch (error) {
      console.error('获取学生毕业去向异常:', error);
      return null;
    }
  }

  // 保存毕业去向记录
  static async saveGraduationDestination(data: {
    student_id: string;
    destination_type: string;
    company_name?: string;
    position?: string;
    salary?: string;
    work_location?: string;
    school_name?: string;
    major?: string;
    degree?: string;
    startup_name?: string;
    startup_role?: string;
    proof_files?: string[];
  }): Promise<{
    success: boolean;
    data?: GraduationDestination;
    error?: string;
  }> {
    try {
      const { data: result, error } = await supabase
        .from('graduation_destinations')
        .insert([{
          ...data,
          status: 'pending',
          submit_time: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('保存毕业去向失败:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data: result as GraduationDestination
      };
    } catch (error) {
      console.error('保存毕业去向异常:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }
}