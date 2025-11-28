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

    // 直接查询所有学生用户，不依赖student_profiles
    try {
      let query = supabase
        .from('users')
        .select(`
          id,
          username,
          email,
          full_name,
          user_number,
          phone,
          created_at
        `, { count: 'exact' })

      // 基础搜索条件：查找学号以20开头的用户（假设学号格式）
      query = query.like('user_number', '20%')

      // 关键词搜索
      if (keyword) {
        query = query.or(`
          full_name.ilike.%${keyword}%,
          user_number.ilike.%${keyword}%,
          email.ilike.%${keyword}%
        `)
      }

      // 分页
      query = query
        .range((page - 1) * limit, page * limit - 1)
        .order('created_at', { ascending: false })

      const { data: users, error, count } = await query

      if (error) {
        console.error('查询学生数据失败:', error);
        // 降级到原有的RPC方法
        return await UserService.getTeacherStudentsRPC(teacherId, { keyword, page, limit });
      }

      if (!users || users.length === 0) {
        return { students: [], total: count || 0 };
      }

      // 获取对应的student_profiles ID（用于培养方案分配）
      const userIds = users.map(u => u.id);
      const { data: profiles } = await supabase
        .from('student_profiles')
        .select('id, user_id')
        .in('user_id', userIds);

      // 创建user到profile的ID映射
      const profileIdMap: Record<string, string> = {};
      profiles?.forEach(profile => {
        profileIdMap[profile.user_id] = profile.id;
      });

      // 转换数据格式
      const students: UserWithRole[] = users.map(user => {
        // 使用student_profiles的ID（如果存在），否则使用user的ID
        const displayId = profileIdMap[user.id] || user.id;
        
        return {
          id: displayId, // 优先使用student_profiles的id，用于培养方案分配
          user_id: user.id, // 保留user的原始ID
          username: user.username || '',
          email: user.email || '',
          user_number: user.user_number || '',
          full_name: user.full_name || '',
          phone: user.phone || '',
          role_id: null,
          status: '在读',
          class_name: '待分配',
          department: '待分配',
          major: '待分配',
          role: {
            id: '1',
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
      
      // 查询对应的student_profiles
      const { data: profiles, error } = await supabase
        .from('student_profiles')
        .select('id, user_id')
        .in('user_id', userIds);

      if (error) {
        console.error('查询学生档案映射失败:', error);
        return students;
      }

      // 创建user_id到student_profiles.id的映射
      const idMap: Record<string, string> = {};
      profiles?.forEach(profile => {
        idMap[profile.user_id] = profile.id;
      });

      // 更新学生的ID
      return students.map(student => ({
        ...student,
        id: idMap[student.id] || student.id // 使用profile的ID，如果没有则保持原ID
      }));

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