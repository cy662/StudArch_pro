import { supabase } from '../lib/supabase'
import { User, UserWithRole, UserSearchParams, UserListResponse } from '../types/user'

// 简单的密码加密函数（用于测试环境）
const hashPassword = async (password: string): Promise<string> => {
  // 在生产环境中应该使用更安全的加密方式
  // 这里为了简化，使用基本的base64编码 + 简单哈希
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'salt_value')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export class UserServiceFixed {
  // 创建用户 - 修复版本
  static async createUser(userData: Partial<User>): Promise<User> {
    try {
      console.log('开始创建用户，输入数据:', userData);
      
      // 确保必填字段存在
      if (!userData.user_number || !userData.full_name || !userData.email) {
        throw new Error('缺少必填字段：学号/工号、姓名、邮箱');
      }

      // 构建用户数据，确保字段名与数据库匹配
      let passwordHash: string;
      
      // 如果用户提供了密码，则使用用户设置的密码，否则使用默认密码
      if (userData.password && userData.password.trim() !== '') {
        // 使用用户设置的密码
        passwordHash = await hashPassword(userData.password);
        console.log('使用用户设置的密码:', userData.password);
      } else {
        // 使用默认密码 123456
        passwordHash = await hashPassword('123456');
        console.log('使用默认密码: 123456');
      }

      const userToCreate = {
        username: userData.username,
        user_number: userData.user_number || null, // 允许为空
        full_name: userData.full_name,
        email: userData.email,
        role_id: userData.role_id || '2', // 使用默认角色ID
        status: userData.status || 'active',
        password_hash: passwordHash, // 存储加密后的密码
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
          if (error.message.includes('user_number')) {
            throw new Error('学号/工号已存在，请使用其他学号/工号');
          } else if (error.message.includes('email')) {
            throw new Error('邮箱已被使用，请使用其他邮箱');
          } else if (error.message.includes('username')) {
            throw new Error('用户名已存在');
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

    // 搜索条件 - 优先使用学号/工号搜索
    if (keyword) {
      query = query.or(`user_number.ilike.%${keyword}%,username.ilike.%${keyword}%,email.ilike.%${keyword}%,full_name.ilike.%${keyword}%`)
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

  // 批量设置统一密码
  static async batchSetPassword(userIds: string[], newPassword: string): Promise<void> {
    try {
      console.log('批量设置密码请求:', { userIds, newPassword });
      
      // 加密新密码
      const passwordHash = await hashPassword(newPassword);
      console.log('加密后的密码:', passwordHash);
      
      // 批量更新用户密码
      const { error } = await supabase
        .from('users')
        .update({ 
          password_hash: passwordHash,
          password_changed_at: new Date().toISOString()
        })
        .in('id', userIds);

      if (error) {
        console.error('批量设置密码失败:', error);
        throw new Error(`批量设置密码失败: ${error.message}`);
      }
      
      console.log('成功为用户设置新密码:', userIds);
      
    } catch (error) {
      console.error('批量设置密码失败:', error);
      throw new Error(`批量设置密码失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // 批量重置密码（生成随机密码）
  static async batchResetPassword(userIds: string[]): Promise<void> {
    try {
      console.log('批量重置密码请求的用户ID:', userIds);
      
      const resetResults: string[] = [];
      
      // 为每个用户生成随机密码
      for (const userId of userIds) {
        // 生成8位随机密码
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let newPassword = '';
        for (let i = 0; i < 8; i++) {
          newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        // 加密密码
        const passwordHash = await hashPassword(newPassword);
        
        // 更新用户密码
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            password_hash: passwordHash,
            password_changed_at: new Date().toISOString()
          })
          .eq('id', userId);
        
        if (updateError) {
          console.error(`用户 ${userId} 密码重置失败:`, updateError);
          throw new Error(`用户密码重置失败: ${updateError.message}`);
        }
        
        resetResults.push(`用户ID ${userId}: 新密码 ${newPassword}`);
        
        // 在实际项目中，这里应该发送邮件通知用户
        // await emailService.sendPasswordResetEmail(userId, newPassword);
      }
      
      console.log('密码重置结果:', resetResults);
      
      // 返回生成的密码列表（用于测试，生产环境应该通过邮件发送）
      if (resetResults.length > 0) {
        console.log('生成的随机密码:');
        resetResults.forEach(result => {
          console.log(result);
        });
        
        // 开发环境中显示密码，生产环境应该移除
        if (import.meta.env.DEV) {
          const passwordList = resetResults
            .filter(r => r.includes('新密码'))
            .map(r => r.split('新密码: ')[1]);
          
          if (passwordList.length > 0) {
            console.log('=== 开发环境：新密码列表 ===');
            console.log(passwordList.join('\r\n'));
            
            // 显示密码给开发者（生产环境应该移除）
            setTimeout(() => {
              const passwordMsg = `重置成功！开发环境密码列表：\r\n${passwordList.join('\r\n')}\r\n\r\n请记录这些密码，生产环境将通过邮件发送。`;
              alert(passwordMsg);
            }, 1000);
          }
        }
      }
      
    } catch (error) {
      console.error('批量重置密码失败:', error);
      throw new Error(`批量重置密码失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
}

export default UserServiceFixed