import { supabase } from '../lib/supabase'
import { User, UserWithRole, UserSearchParams, UserListResponse } from '../types/user'

export class UserServiceFixed {
  // 创建用户 - 修复版本
  static async createUser(userData: Partial<User>): Promise<User> {
    try {
      console.log('开始创建用户，输入数据:', userData);
      
      // 确保必填字段存在
      if (!userData.username || !userData.full_name || !userData.email) {
        throw new Error('缺少必填字段：用户名、姓名、邮箱');
      }

      // 构建用户数据，确保字段名与数据库匹配
      const userToCreate = {
        username: userData.username,
        user_number: userData.user_number || null, // 允许为空
        full_name: userData.full_name,
        email: userData.email,
        role_id: userData.role_id || '2', // 使用默认角色ID
        status: userData.status || 'active',
        password_hash: userData.password || '123456', // 数据库需要password_hash字段
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('准备插入数据库的数据:', userToCreate);

      const { data, error } = await supabase
        .from('users')
        .insert([userToCreate])
        .select()
        .single()

      if (error) {
        console.error('Supabase错误详情:', error);
        
        // 根据错误类型提供更具体的错误信息
        if (error.code === '23505') { // 唯一约束冲突
          if (error.message.includes('username')) {
            throw new Error('用户名已存在');
          } else if (error.message.includes('email')) {
            throw new Error('邮箱已存在');
          } else if (error.message.includes('user_number')) {
            throw new Error('学号/工号已存在');
          }
        }
        
        throw new Error(`创建用户失败: ${error.message}`);
      }

      console.log('用户创建成功:', data);
      return data;
      
    } catch (error) {
      console.error('创建用户过程中出错:', error);
      throw error;
    }
  }

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
      console.error('获取用户列表失败:', error);
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

  // 获取角色列表
  static async getRoles() {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('role_name')

    if (error) {
      console.error('获取角色列表失败:', error);
      throw new Error(`获取角色列表失败: ${error.message}`)
    }

    console.log('获取到的角色列表:', data);
    return data || []
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
      console.error('更新用户失败:', error);
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
      console.error('删除用户失败:', error);
      throw new Error(`删除用户失败: ${error.message}`)
    }
  }

  // 批量重置密码（实现空方法以解决TypeScript错误）
  static async batchResetPassword(userIds: string[]): Promise<void> {
    try {
      console.log('批量重置密码请求的用户ID:', userIds);
      
      // 这是一个占位符实现，实际项目中需要实现真正的密码重置逻辑
      // 例如：向每个用户的邮箱发送重置链接
      
      alert('密码重置功能暂未实现，请手动重置用户密码');
      
    } catch (error) {
      console.error('批量重置密码失败:', error);
      throw new Error(`批量重置密码失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
}

export default UserServiceFixed