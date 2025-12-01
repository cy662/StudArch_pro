import { supabase } from '../lib/supabase'
import { User, UserWithRole, UserSearchParams, UserListResponse } from '../types/user'

export class UserService {
  // 获取用户列表（带搜索和分页）
  static async getUsers(params: UserSearchParams): Promise<UserListResponse> {
    const {
      keyword = '',
      role_id,
      status,
      page = 1,
      limit = 10,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = params

    let query = supabase
      .from('users')
      .select(`
        *,
        role:roles(*)
      `, { count: 'exact' })

    // 搜索条件
    if (keyword) {
      query = query.or(`username.ilike.%${keyword}%,email.ilike.%${keyword}%,full_name.ilike.%${keyword}%`)
    }

    if (role_id) {
      query = query.eq('role_id', role_id)
    }

    if (status) {
      query = query.eq('status', status)
    }

    // 排序和分页
    query = query
      .order(sort_by, { ascending: sort_order === 'asc' })
      .range((page - 1) * limit, page * limit - 1)

    const { data, error, count } = await query

    if (error) {
      throw new Error(`获取用户列表失败: ${error.message}`)
    }

    return {
      users: data as UserWithRole[],
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit)
    }
  }

  // 获取单个用户详情
  static async getUserById(id: string): Promise<UserWithRole> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        role:roles(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`获取用户详情失败: ${error.message}`)
    }

    return data as UserWithRole
  }

  // 创建用户
  static async createUser(userData: Partial<User>): Promise<User> {
    // 简化处理：直接使用密码作为哈希值（仅用于测试，生产环境需要加密）
    const userToCreate = { 
      ...userData,
      password_hash: userData.password || '123456' // 为测试简化
    };
    
    // 移除前端发送的明文密码字段
    delete (userToCreate as any).password;

    const { data, error } = await supabase
      .from('users')
      .insert([userToCreate])
      .select()
      .single()

    if (error) {
      console.error('创建用户详细错误:', error);
      throw new Error(`创建用户失败: ${error.message}`)
    }

    return data
  }

  // 更新用户
  static async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`更新用户失败: ${error.message}`)
    }

    return data
  }

  // 删除用户
  static async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`删除用户失败: ${error.message}`)
    }
  }

  // 批量重置密码
  static async batchResetPassword(userIds: string[]): Promise<void> {
    const { error } = await supabase.rpc('batch_reset_password', {
      user_ids: userIds
    })

    if (error) {
      throw new Error(`批量重置密码失败: ${error.message}`)
    }
  }

  // 获取角色列表
  static async getRoles() {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('name')

    if (error) {
      throw new Error(`获取角色列表失败: ${error.message}`)
    }

    return data
  }



  // 获取系统统计数据
  static async getDashboardStats() {
    const { data, error } = await supabase.rpc('get_dashboard_stats')

    if (error) {
      throw new Error(`获取统计数据失败: ${error.message}`)
    }

    return data
  }







  // 获取教师当前管理的学生列表
  static async getTeacherStudents(teacherId: string, params?: {
    keyword?: string
    page?: number
    limit?: number
  }): Promise<{ students: UserWithRole[], total: number }> {
    const {
      keyword = '',
      page = 1,
      limit = 20
    } = params || {}

    try {
      // 优先尝试使用数据库函数获取完整的学生信息
      const { data: functionData, error: functionError } = await supabase
        .rpc('get_teacher_students_v2', {
          p_teacher_id: teacherId,
          p_keyword: keyword,
          p_page: page,
          p_limit: limit
        });

      if (!functionError && functionData && functionData.length > 0) {
        const result = functionData[0];
        const students = (result.students || []) as UserWithRole[];
        
        return {
          students,
          total: result.total_count || 0
        };
      }

      // 降级到原函数
      const { data: originalData, error: originalError } = await supabase
        .rpc('get_teacher_students', {
          p_teacher_id: teacherId,
          p_keyword: keyword,
          p_page: page,
          p_limit: limit
        });

      if (!originalError && originalData && originalData.length > 0) {
        const result = originalData[0];
        const students = (result.students || []) as UserWithRole[];
        
        // 需要将user_id转换为student_profiles.id
        const studentsWithProfileIds = await this.mapUsersToProfileIds(students);
        
        return {
          students: studentsWithProfileIds,
          total: result.total_count || 0
        };
      }

      // 最后降级：直接查询用户表并关联学生档案获取班级信息
      let query = supabase
        .from('teacher_students')
        .select(`
          student_id,
          created_at,
          users!inner(
            id,
            username,
            email,
            full_name,
            user_number,
            phone,
            department,
            grade,
            class_name,
            status,
            created_at
          ),
          roles!inner(id, role_name, role_description)
        `, { count: 'exact' })
        .eq('teacher_id', teacherId)
        .eq('users.role_id', '3'); // 学生角色

      // 关键词搜索
      if (keyword) {
        query = query.or(`
          users.full_name.ilike.%${keyword}%,
          users.user_number.ilike.%${keyword}%,
          users.email.ilike.%${keyword}%
        `);
      }

      // 分页
      query = query
        .range((page - 1) * limit, page * limit - 1)
        .order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        console.error('查询学生数据失败:', error);
        throw new Error(`获取教师学生列表失败: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return { students: [], total: count || 0 };
      }

      // 获取对应的学生档案信息，包括更准确的班级信息
      const userIds = data.map(d => d.users.id);
      const { data: profiles } = await supabase
        .from('student_profiles')
        .select('id, user_id, class_name, class_id')
        .in('user_id', userIds);

      // 如果有档案信息，也获取班级表信息
      const classIds = profiles?.map(p => p.class_id).filter(Boolean) || [];
      const { data: classes } = classIds.length > 0 ? await supabase
        .from('classes')
        .select('id, class_name')
        .in('id', classIds) : { data: [] };

      // 创建映射
      const profileMap: Record<string, any> = {};
      profiles?.forEach(profile => {
        profileMap[profile.user_id] = profile;
      });

      const classMap: Record<string, string> = {};
      classes?.forEach(cls => {
        classMap[cls.id] = cls.class_name;
      });

      // 转换数据格式
      const students: UserWithRole[] = data.map(item => {
        const user = item.users;
        const profile = profileMap[user.id];
        const profileId = profile?.id || user.id;
        
        // 优先使用档案中的班级信息，其次是用户表中的班级信息
        let className = user.class_name || '待分配';
        if (profile) {
          if (profile.class_id && classMap[profile.class_id]) {
            className = classMap[profile.class_id];
          } else if (profile.class_name) {
            className = profile.class_name;
          }
        }

        return {
          id: profileId, // 使用student_profiles的ID，便于后续操作
          user_id: user.id, // 保留原始用户ID
          username: user.username || '',
          email: user.email || '',
          user_number: user.user_number || '',
          full_name: user.full_name || '',
          phone: user.phone || '',
          department: user.department || '待分配',
          grade: user.grade || '待分配',
          class_name: className, // 正确的班级信息
          status: user.status === 'active' ? '在读' : '其他',
          role_id: '3',
          role: {
            id: '3',
            role_name: 'student',
            role_description: '学生',
            permissions: {},
            is_system_default: true,
            created_at: '2021-01-01',
            updated_at: '2021-01-01'
          },
          created_at: user.created_at,
          updated_at: user.created_at
        };
      });

      return {
        students,
        total: count || 0
      };

    } catch (error) {
      console.error('获取教师学生列表异常:', error);
      return { students: [], total: 0 };
    }
  }

  // 辅助方法：将users表中的ID映射为student_profiles表中的ID
  private static async mapUsersToProfileIds(students: UserWithRole[]): Promise<UserWithRole[]> {
    try {
      if (!students || students.length === 0) {
        return [];
      }

      // 获取所有user_id
      const userIds = students.map(s => s.id);
      
      // 查询对应的student_profiles，包括班级信息
      const { data: profiles, error } = await supabase
        .from('student_profiles')
        .select('id, user_id, class_name, class_id')
        .in('user_id', userIds);

      if (error) {
        console.error('查询学生档案映射失败:', error);
        return students;
      }

      // 如果有班级ID，获取班级信息
      const classIds = profiles?.map(p => p.class_id).filter(Boolean) || [];
      let classMap: Record<string, string> = {};
      
      if (classIds.length > 0) {
        const { data: classes } = await supabase
          .from('classes')
          .select('id, class_name')
          .in('id', classIds);
          
        classes?.forEach(cls => {
          classMap[cls.id] = cls.class_name;
        });
      }

      // 创建user_id到student_profiles信息的映射
      const profileMap: Record<string, any> = {};
      profiles?.forEach(profile => {
        profileMap[profile.user_id] = {
          id: profile.id,
          class_name: profile.class_id && classMap[profile.class_id] 
            ? classMap[profile.class_id] 
            : profile.class_name
        };
      });

      // 更新学生的ID和班级信息
      return students.map(student => {
        const profile = profileMap[student.id];
        return {
          ...student,
          id: profile?.id || student.id, // 使用profile的ID，如果没有则保持原ID
          class_name: profile?.class_name || student.class_name || '待分配' // 使用档案中的班级信息
        };
      });

    } catch (error) {
      console.error('映射ID失败:', error);
      return students;
    }
  }

  // 降级方法：使用原有的RPC函数
  static async getTeacherStudentsRPC(teacherId: string, params?: {
    keyword?: string
    page?: number
    limit?: number
  }): Promise<{ students: UserWithRole[], total: number }> {
    const {
      keyword = '',
      page = 1,
      limit = 20
    } = params || {}

    let data, error;

    // 1. 尝试修正后的函数
    const result1 = await supabase
      .rpc('get_teacher_students_v2', {
        p_teacher_id: teacherId,
        p_keyword: keyword,
        p_page: page,
        p_limit: limit
      });
    
    if (!result1.error) {
      const result = result1.data?.[0];
      const students = (result?.students || []) as UserWithRole[];
      
      // 需要将user_id转换为student_profiles.id
      const studentsWithProfileIds = await this.mapUsersToProfileIds(students);
      
      return {
        students: studentsWithProfileIds,
        total: result?.total_count || 0
      };
    }

    // 2. 尝试原函数
    const result2 = await supabase
      .rpc('get_teacher_students', {
        p_teacher_id: teacherId,
        p_keyword: keyword,
        p_page: page,
        p_limit: limit
      });

    if (!result2.error) {
      if (!result2.data || result2.data.length === 0) {
        return { students: [], total: 0 }
      }
      const result = result2.data[0]
      const students = (result.students || []) as UserWithRole[];
      
      // 需要将user_id转换为student_profiles.id
      const studentsWithProfileIds = await this.mapUsersToProfileIds(students);
      
      return {
        students: studentsWithProfileIds,
        total: result.total_count || 0
      };

      // 获取总数（需要额外查询）
      const { count, error: countError } = await supabase
        .from('teacher_students')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', teacherId)

      if (countError) {
        console.warn('获取总数失败:', countError.message)
      }

      return {
        students,
        total: count || 0
      }
    }

    throw new Error(`获取教师学生列表失败: ${result2.error?.message || '未知错误'}`)
  }

  // 移除教师的学生
  static async removeStudentFromTeacher(teacherId: string, studentId: string): Promise<boolean> {
    const { data, error } = await supabase
      .rpc('remove_student_from_teacher', {
        p_teacher_id: teacherId,
        p_student_id: studentId
      })

    if (error) {
      throw new Error(`移除学生失败: ${error.message}`)
    }

    return data || false
  }

  // 获取教师学生统计信息
  static async getTeacherStudentStats(teacherId: string) {
    const { data, error } = await supabase
      .from('teacher_student_stats')
      .select('*')
      .eq('teacher_id', teacherId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // 没有找到记录，返回默认值
        return {
          teacher_id: teacherId,
          student_count: 0,
          last_add_date: null
        }
      }
      throw new Error(`获取教师学生统计失败: ${error.message}`)
    }

    return data
  }

  // 获取可导入的学生列表（排除已被该教师管理的学生）
  static async getAvailableStudentsForImport(teacherId: string, params?: {
    keyword?: string
    grade?: string
    department?: string
    page?: number
    limit?: number
  }): Promise<{ students: UserWithRole[], total: number }> {
    const {
      keyword = '',
      grade = '',
      department = '',
      page = 1,
      limit = 50
    } = params || {}

    // 使用数据库函数获取可导入学生
    const { data, error } = await supabase
      .rpc('get_available_students_for_import', {
        p_teacher_id: teacherId,
        p_keyword: keyword,
        p_grade: grade,
        p_department: department,
        p_page: page,
        p_limit: limit
      })

    if (error) {
      throw new Error(`获取可导入学生列表失败: ${error.message}`)
    }

    if (!data) {
      return { students: [], total: 0 }
    }

    // 处理新的JSON返回格式
    const result = data as any
    const students = (result.students || []) as UserWithRole[]
    const total = result.total_count || 0

    return {
      students,
      total
    }
  }

  // 批量导入学生到教师管理列表
  static async batchImportStudents(teacherId: string, studentIds: string[]): Promise<{
    success: number
    failed: number
    error?: string
  }> {
    // 使用数据库函数进行批量导入
    const { data, error } = await supabase
      .rpc('batch_add_students_to_teacher', {
        p_teacher_id: teacherId,
        p_student_ids: studentIds
      })

    if (error) {
      throw new Error(`批量导入学生失败: ${error.message}`)
    }

    return data as {
      success: number
      failed: number
      error?: string
    }
  }

  // 教师添加学生到管理列表（别名方法）
  static async teacherAddStudents(studentIds: string[], teacherId: string): Promise<{
    success: number
    failed: number
    error?: string
  }> {
    return this.batchImportStudents(teacherId, studentIds)
  }

  // 获取档案ID到用户ID的映射
  static async getProfileUserMapping(profileIds: string[]): Promise<{
    success: boolean
    message?: string
    data?: Array<{ id: string; user_id: string }>
  }> {
    try {
      const { data, error } = await supabase
        .from('student_profiles')
        .select('id, user_id')
        .in('id', profileIds);

      if (error) {
        return {
          success: false,
          message: `查询档案映射失败: ${error.message}`
        };
      }

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      return {
        success: false,
        message: `查询档案映射异常: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }
}

export default UserService