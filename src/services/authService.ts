import { supabase } from '../lib/supabase'
import { UserWithRole } from '../types/user'

export interface LoginCredentials {
  identifier: string // 用户名、学号或工号
  password: string
}

export interface AuthResponse {
  success: boolean
  user?: UserWithRole
  token?: string
  error?: string
}

export class AuthService {
  // 用户登录
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { identifier, password } = credentials
      
      // 查找用户（支持用户名、学号、邮箱登录）
      const { data: users, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          role:roles(*)
        `)
        .or(`username.eq.${identifier},user_number.eq.${identifier},email.eq.${identifier}`)
        .eq('status', 'active')

      if (userError) {
        throw new Error(`查询用户失败: ${userError.message}`)
      }

      if (!users || users.length === 0) {
        return {
          success: false,
          error: '用户不存在或账户已被禁用'
        }
      }

      const user = users[0]

      // 验证密码（使用bcrypt加密验证）
      const { data: passwordCheck, error: passwordError } = await supabase.rpc(
        'verify_password',
        {
          user_id: user.id,
          password: password
        }
      )

      // 如果RPC函数不存在，使用简化验证（仅用于测试）
      if (passwordError) {
        // 生产环境应该使用bcrypt加密验证
        // 这里简化处理：假设密码是'123456'或者用户编号后6位
        const validPassword = await this.simplifiedPasswordCheck(user, password)
        if (!validPassword) {
          return {
            success: false,
            error: '密码错误'
          }
        }
      } else if (!passwordCheck) {
        return {
          success: false,
          error: '密码错误'
        }
      }

      // 更新最后登录时间
      await this.updateLastLogin(user.id)

      // 生成JWT token（简化处理，实际应该使用Supabase Auth）
      const token = this.generateToken(user)

      return {
        success: true,
        user: user as UserWithRole,
        token
      }

    } catch (error) {
      console.error('登录失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '登录失败'
      }
    }
  }

  // 简化密码验证（仅用于测试环境）
  private static async simplifiedPasswordCheck(user: any, password: string): Promise<boolean> {
    // 默认密码策略：
    // 1. 学号/工号后6位
    // 2. 默认密码'123456'
    // 3. 用户编号后6位
    
    const defaultPasswords = [
      '123456', // 默认密码
      user.user_number?.slice(-6) || '', // 学号后6位
      user.user_number || '', // 完整学号
      '12345678' // 8位默认密码
    ]

    return defaultPasswords.includes(password)
  }

  // 更新最后登录时间
  private static async updateLastLogin(userId: string): Promise<void> {
    try {
      await supabase
        .from('users')
        .update({ 
          last_login: new Date().toISOString()
        })
        .eq('id', userId)
    } catch (error) {
      console.error('更新登录时间失败:', error)
    }
  }

  // 生成简易token（生产环境应使用JWT）
  private static generateToken(user: any): string {
    const tokenData = {
      userId: user.id,
      username: user.username,
      role: user.role?.role_name,
      timestamp: Date.now()
    }
    
    return btoa(JSON.stringify(tokenData))
  }

  // 验证token
  static async verifyToken(token: string): Promise<AuthResponse> {
    try {
      const tokenData = JSON.parse(atob(token))
      
      // 验证token是否过期（24小时有效期）
      const tokenAge = Date.now() - tokenData.timestamp
      if (tokenAge > 24 * 60 * 60 * 1000) {
        return {
          success: false,
          error: '登录已过期，请重新登录'
        }
      }

      // 获取用户信息
      const { data: user, error } = await supabase
        .from('users')
        .select(`
          *,
          role:roles(*)
        `)
        .eq('id', tokenData.userId)
        .eq('status', 'active')
        .single()

      if (error || !user) {
        return {
          success: false,
          error: '用户不存在或账户已被禁用'
        }
      }

      return {
        success: true,
        user: user as UserWithRole,
        token
      }

    } catch (error) {
      return {
        success: false,
        error: 'Token验证失败'
      }
    }
  }

  // 退出登录
  static logout(): void {
    // 清除本地存储的token
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_info')
  }

  // 检查登录状态
  static async checkAuthStatus(): Promise<AuthResponse> {
    const token = localStorage.getItem('auth_token')
    
    if (!token) {
      return {
        success: false,
        error: '未登录'
      }
    }

    return this.verifyToken(token)
  }

  // 根据角色获取重定向路径
  static getRedirectPath(roleName: string): string {
    switch (roleName) {
      case 'super_admin':
        return '/admin-dashboard'
      case 'teacher':
        return '/teacher-dashboard'
      case 'student':
        return '/student-dashboard'
      default:
        return '/login'
    }
  }

  // 获取当前用户角色
  static getCurrentUserRole(): string | null {
    const token = localStorage.getItem('auth_token')
    if (!token) return null
    
    try {
      const tokenData = JSON.parse(atob(token))
      return tokenData.role || null
    } catch {
      return null
    }
  }
}

export default AuthService