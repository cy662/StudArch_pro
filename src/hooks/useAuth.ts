import { useState, useEffect } from 'react'
import { UserWithRole } from '../types/user'
import StudentProfileService from '../services/studentProfileService'
import AuthService from '../services/authService'

// 使用真实数据库的认证状态管理
export const useAuth = () => {
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 首先检查localStorage中的用户信息作为备份
    const storedUser = localStorage.getItem('user_info');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role?.role_name) {
          console.log('从localStorage恢复用户信息:', parsedUser);
          setUser(parsedUser);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('解析localStorage用户信息失败:', error);
      }
    }
    
    // 检查真实数据库的认证状态
    checkAuthStatus()
  }, [])

  /**
   * 检查认证状态
   */
  const checkAuthStatus = async () => {
    try {
      const result = await AuthService.checkAuthStatus()
      if (result.success && result.user) {
        setUser(result.user)
        
        // 如果是学生，检查个人信息完成状态
        if (result.user.role?.role_name === 'student') {
          await checkProfileCompletion(result.user.id)
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('检查认证状态失败:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 检查学生个人信息完成状态
   */
  const checkProfileCompletion = async (userId: string) => {
    try {
      const result = await StudentProfileService.checkProfileCompletion(userId)
      
      // 存储个人信息完成状态到localStorage
      localStorage.setItem('student_profile_status', JSON.stringify({
        needsCompletion: result.needsCompletion,
        isEditEnabled: result.isEditEnabled,
        lastCheck: new Date().toISOString()
      }))
      
      // 如果是首次登录或个人信息未完成，设置标志
      if (result.needsCompletion) {
        localStorage.setItem('first_login_reminder', 'true')
      }
      
    } catch (error) {
      console.error('检查个人信息状态失败:', error)
    }
  }

  const login = async (username: string, password: string) => {
    try {
      const result = await AuthService.login({
        identifier: username,
        password: password
      })
      
      if (result.success && result.user) {
        setUser(result.user)
        
        // 存储token到localStorage
        if (result.token) {
          localStorage.setItem('auth_token', result.token)
          localStorage.setItem('user_info', JSON.stringify(result.user))
        }
        
        // 如果是学生，检查个人信息完成状态
        if (result.user.role?.role_name === 'student') {
          await checkProfileCompletion(result.user.id)
        }
        
        return { success: true }
      } else {
        return { success: false, error: result.error || '登录失败' }
      }
    } catch (error) {
      console.error('登录失败:', error)
      return { success: false, error: '登录失败' }
    }
  }

  const logout = () => {
    AuthService.logout()
    setUser(null)
  }

  const isStudent = () => {
    return user?.role?.role_name === 'student'
  }

  const isTeacher = () => {
    return user?.role?.role_name === 'teacher'
  }

  const isAdmin = () => {
    return user?.role?.role_name === 'super_admin'
  }

  /**
   * 刷新用户信息
   */
  const refreshProfile = async () => {
    await checkAuthStatus()
  }

  /**
   * 检查是否需要显示首次登录提醒
   */
  const needsProfileCompletion = (): boolean => {
    if (!user || user.role_id !== '3') return false
    
    const reminder = localStorage.getItem('first_login_reminder')
    return reminder === 'true'
  }

  /**
   * 清除首次登录提醒
   */
  const clearProfileCompletionReminder = () => {
    localStorage.removeItem('first_login_reminder')
  }

  /**
   * 获取个人信息完成状态
   */
  const getProfileStatus = () => {
    try {
      const status = localStorage.getItem('student_profile_status')
      return status ? JSON.parse(status) : null
    } catch {
      return null
    }
  }

  return {
    user,
    loading,
    login,
    logout,
    isStudent,
    isTeacher,
    isAdmin,
    needsProfileCompletion,
    clearProfileCompletionReminder,
    getProfileStatus,
    refreshProfile
  }
}

export default useAuth