import { useState, useEffect } from 'react'
import StudentProfileService from '../services/studentProfileService'
import { StudentProfile } from '../types/user'

/**
 * 学生个人信息状态检查hook
 */
export const useStudentProfile = (userId: string) => {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * 检查个人信息是否完成
   * 返回: true表示已完成, false表示未完成
   */
  const isProfileComplete = (profile: StudentProfile | null): boolean => {
    if (!profile) return false
    
    // 检查必填字段是否都已填写
    const mandatoryFields = [
      'phone',
      'emergency_contact', 
      'emergency_phone',
      'home_address'
    ]
    
    for (const field of mandatoryFields) {
      if (!profile[field as keyof StudentProfile] || 
          profile[field as keyof StudentProfile] === '未知') {
        return false
      }
    }
    
    // 移除审核状态要求，只要必填字段完整即可
    return true
  }

  /**
   * 获取个人信息完成度百分比
   */
  const getProfileCompletionRate = (profile: StudentProfile | null): number => {
    if (!profile) return 0
    
    const totalFields = 10
    let completedFields = 0
    
    const checkFields = [
      'full_name', 'gender', 'birth_date', 'id_card', 'nationality',
      'political_status', 'phone', 'emergency_contact', 'emergency_phone', 'home_address'
    ]
    
    for (const field of checkFields) {
      if (profile[field as keyof StudentProfile] && 
          profile[field as keyof StudentProfile] !== '未知') {
        completedFields++
      }
    }
    
    return Math.round((completedFields / totalFields) * 100)
  }

  /**
   * 加载个人信息
   */
  const loadProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const profileData = await StudentProfileService.getStudentProfile(userId)
      setProfile(profileData)
      
    } catch (err) {
      console.error('加载个人信息失败:', err)
      setError('加载个人信息失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      loadProfile()
    }
  }, [userId])

  return {
    profile,
    loading,
    error,
    isProfileComplete: () => isProfileComplete(profile),
    getCompletionRate: () => getProfileCompletionRate(profile),
    refreshProfile: loadProfile
  }
}

export default useStudentProfile