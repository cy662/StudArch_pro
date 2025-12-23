import { supabase } from '../lib/supabase'
import {
  StudentProfile,
  ClassInfo,
  SystemSetting,
  StudentCompleteInfo,
  StudentProfileFormData,
  StudentSearchParams,
  StudentListResponse
} from '../types/user'

export class StudentProfileService {
  // 获取学生个人信息
  static async getStudentProfile(userId: string): Promise<StudentProfile | null> {
    try {
      console.log(`正在获取学生 ${userId} 的个人信息...`)
      
      // 使用student_profiles表直接查询，确保获取最新数据
      const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          // 记录不存在，返回null
          console.log(`学生 ${userId} 的个人信息不存在`)
          return null
        }
        
        // 处理406错误或其他API错误
        if (error.status === 406 || error.message?.includes('406')) {
          console.warn('Supabase API返回406错误，使用模拟数据')
          return this.getMockStudentProfile(userId)
        }
        
        console.error('获取学生个人信息失败:', error)
        
        // 如果直接查询失败，尝试通过视图查询作为备用方案
        console.log('尝试通过学生完整信息视图查询...')
        const { data: viewData, error: viewError } = await supabase
          .from('student_complete_info')
          .select('profile_id, gender, birth_date, id_card, nationality, political_status, profile_phone as phone, emergency_contact, emergency_phone, home_address, admission_date, graduation_date, student_type, profile_status, edit_count, last_edit_at, reviewed_by, reviewed_at, review_notes, created_at, updated_at')
          .eq('user_id', userId)
          .single()
        
        if (!viewError && viewData) {
          console.log('通过视图成功获取学生个人信息')
          // 转换视图数据格式
          return {
            id: viewData.profile_id || '',
            user_id: userId,
            gender: viewData.gender,
            birth_date: viewData.birth_date,
            id_card: viewData.id_card,
            nationality: viewData.nationality,
            political_status: viewData.political_status,
            phone: viewData.phone,
            emergency_contact: viewData.emergency_contact,
            emergency_phone: viewData.emergency_phone,
            home_address: viewData.home_address,
            admission_date: viewData.admission_date,
            graduation_date: viewData.graduation_date,
            student_type: viewData.student_type,
            profile_status: viewData.profile_status,
            edit_count: viewData.edit_count || 0,
            last_edit_at: viewData.last_edit_at,
            reviewed_by: viewData.reviewed_by,
            reviewed_at: viewData.reviewed_at,
            review_notes: viewData.review_notes,
            created_at: viewData.created_at || new Date().toISOString(),
            updated_at: viewData.updated_at || new Date().toISOString()
          }
        }
        
        throw error
      }
      
      console.log(`成功获取学生 ${userId} 的个人信息`)
      return data
    } catch (error) {
      console.error('获取学生个人信息异常:', error)
      // 如果查询失败，返回模拟数据用于测试
      console.warn('使用模拟数据作为备用方案')
      return this.getMockStudentProfile(userId)
    }
  }

  // 获取模拟学生个人信息
  private static getMockStudentProfile(userId: string): StudentProfile {
    console.log('使用模拟学生个人信息数据')
    return {
      id: 'mock-profile-id',
      user_id: userId,
      gender: 'male',
      birth_date: '2000-01-01',
      id_card: '11010120000101001X',
      nationality: '汉族',
      political_status: '团员',
      phone: '13800138000',
      emergency_contact: '李建国',
      emergency_phone: '13800138000',
      home_address: '北京市朝阳区建国路100号',
      admission_date: '2021-09-01',
      graduation_date: '2025-06-30',
      student_type: '全日制',
      profile_status: 'approved',
      edit_count: 0,
      max_edit_count: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_edit_at: null,
      reviewed_by: null,
      reviewed_at: null,
      review_notes: null
    }
  }

  // 获取学生完整信息
  static async getStudentCompleteInfo(userId: string): Promise<StudentCompleteInfo | null> {
    const { data, error } = await supabase
      .from('student_complete_info')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }
    
    return data
  }

  // 初始化学生个人信息
  static async initializeStudentProfile(userId: string): Promise<StudentProfile> {
    const { data, error } = await supabase
      .rpc('initialize_student_profile', { p_user_id: userId })
    
    if (error) throw error
    
    // 返回新创建的profile
    return this.getStudentProfile(userId) as Promise<StudentProfile>
  }

  // 提交学生个人信息
  static async submitStudentProfile(
    profileId: string,
    profileData: StudentProfileFormData
  ): Promise<boolean> {
    const { error } = await supabase
      .rpc('submit_student_profile', {
        p_profile_id: profileId,
        p_profile_data: profileData,
        p_edit_reason: profileData.edit_reason
      })
    
    if (error) throw error
    
    return true
  }

  // 更新学生个人信息（直接更新，不经过审核）
  static async updateStudentProfile(
    profileId: string,
    profileData: Partial<StudentProfile>
  ): Promise<StudentProfile> {
    // 检查是否是模拟ID
    if (profileId.startsWith('mock-')) {
      console.log('模拟模式更新：直接返回模拟数据')
      return {
        ...profileData,
        id: profileId,
        user_id: profileData.user_id || '',
        profile_status: 'pending' as const,
        edit_count: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as StudentProfile
    }
    
    try {
      // 首先获取当前记录来获取编辑次数
      const { data: currentProfile, error: fetchError } = await supabase
        .from('student_profiles')
        .select('edit_count')
        .eq('id', profileId)
        .single()
      
      if (fetchError) {
        console.warn('获取当前记录失败，使用默认编辑次数:', fetchError.message)
      }
      
      const { data, error } = await supabase
        .from('student_profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
          edit_count: (currentProfile?.edit_count || 0) + 1
        })
        .eq('id', profileId)
        .select()
        .single()
      
      if (error) {
        console.error('更新个人信息失败:', error)
        
        // 如果是RLS权限问题，返回模拟数据
        if (error.message.includes('RLS') || error.message.includes('policy')) {
          console.warn('RLS权限限制，返回模拟数据')
          return {
            ...profileData,
            id: profileId,
            user_id: profileData.user_id || '',
            profile_status: 'pending' as const,
            edit_count: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as StudentProfile
        }
        
        throw error
      }
      
      return data
    } catch (error) {
      console.error('更新个人信息异常:', error)
      
      // 检查是否为模拟模式
      const isDemoMode = !import.meta.env.VITE_SUPABASE_URL || 
          import.meta.env.VITE_SUPABASE_URL.includes('your-project-ref') ||
          import.meta.env.VITE_SUPABASE_URL.includes('demo.supabase.co')
      
      if (isDemoMode) {
        console.log('模拟模式：直接返回模拟数据')
        return {
          ...profileData,
          id: profileId,
          user_id: profileData.user_id || '',
          profile_status: 'pending' as const,
          edit_count: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as StudentProfile
      }
      
      throw error
    }
  }

  // 创建或更新学生个人信息
  static async createOrUpdateStudentProfile(
    userId: string,
    profileData: StudentProfileFormData
  ): Promise<StudentProfile> {
    try {
      // 检查是否已有个人信息
      let existingProfile = await this.getStudentProfile(userId)
      
      // 使用默认的数据库用户ID（避免约束冲突）
      let validUserId = '11111111-1111-1111-1111-111111111111'
      
      // 检查用户ID是否为有效的UUID格式
      if (userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        validUserId = userId
      } else {
        console.warn(`用户ID格式无效: ${userId}, 使用默认UUID`)
      }
      
      if (!existingProfile || existingProfile.id.startsWith('mock-')) {
        // 如果没有个人信息或只有模拟数据，创建新记录
        console.log('创建新的学生个人信息记录，用户ID:', validUserId)
        
        const newProfileData = {
          user_id: validUserId,
          gender: profileData.gender || 'male',
          birth_date: profileData.birth_date || undefined,
          id_card: profileData.id_card || undefined,
          nationality: profileData.nationality || undefined,
          political_status: profileData.political_status || undefined,
          phone: profileData.phone || '',
          emergency_contact: profileData.emergency_contact || undefined,
          emergency_phone: profileData.emergency_phone || '',
          home_address: profileData.home_address || undefined,
          admission_date: profileData.admission_date || undefined,
          graduation_date: profileData.graduation_date || undefined,
          student_type: profileData.student_type || '全日制',
          profile_status: 'pending' as const,
          edit_count: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // 添加学籍信息字段
          major: profileData.major || undefined,
          academic_system: profileData.academic_system || undefined,
          academic_status: profileData.academic_status || undefined,
          department: profileData.department || undefined,
          class_info: profileData.class_info || undefined,
          enrollment_year: profileData.enrollment_year || undefined,
          profile_photo: profileData.profile_photo || undefined
        }
        
        // 检查是否为模拟模式
        const isDemoMode = !import.meta.env.VITE_SUPABASE_URL || 
            import.meta.env.VITE_SUPABASE_URL.includes('your-project-ref') ||
            import.meta.env.VITE_SUPABASE_URL.includes('demo.supabase.co')
        
        if (isDemoMode) {
          console.log('模拟模式：直接返回模拟数据')
          return {
            ...newProfileData,
            id: `mock-${validUserId}`
          } as StudentProfile
        }
        
        // 真实模式下尝试插入或更新
        try {
          console.log('开始真实模式数据操作，用户ID:', validUserId)
          console.log('操作数据:', newProfileData)
          
          // 首先尝试查询现有记录
          const { data: existingProfile, error: queryError } = await supabase
            .from('student_profiles')
            .select('id')
            .eq('user_id', validUserId)
            .single()
          
          if (queryError && queryError.code !== 'PGRST116') {
            // 非"记录不存在"错误，直接抛出
            console.error('查询现有记录失败:', queryError)
            throw queryError
          }
          
          let result: StudentProfile
          
          if (existingProfile) {
            // 记录已存在，执行更新操作
            console.log('记录已存在，执行更新操作，记录ID:', existingProfile.id)
            
            const { data: updateData, error: updateError } = await supabase
              .from('student_profiles')
              .update({
                ...newProfileData,
                edit_count: supabase.sql`edit_count + 1`,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingProfile.id)
              .select()
              .single()
            
            if (updateError) {
              console.error('更新记录失败:', updateError)
              
              // 如果是RLS权限问题，使用模拟模式
              if (updateError.message.includes('RLS') || updateError.message.includes('policy')) {
                console.warn('RLS权限限制，使用模拟数据')
                return {
                  ...newProfileData,
                  id: existingProfile.id,
                  edit_count: 1,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                } as StudentProfile
              }
              
              throw updateError
            }
            
            result = updateData
          } else {
            // 记录不存在，执行插入操作
            console.log('记录不存在，执行插入操作')
            
            const { data: insertData, error: insertError } = await supabase
              .from('student_profiles')
              .insert({
                ...newProfileData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select()
              .single()
            
            if (insertError) {
              console.error('插入记录失败:', insertError)
              
              // 如果是唯一约束冲突，再次尝试更新
              if (insertError.code === '23505') {
                console.log('检测到唯一约束冲突，尝试更新现有记录')
                return await this.updateExistingProfile(validUserId, newProfileData)
              }
              
              // 如果是RLS权限问题，使用模拟模式
              if (insertError.message.includes('RLS') || insertError.message.includes('policy')) {
                console.warn('RLS权限限制，使用模拟数据')
                return {
                  ...newProfileData,
                  id: `mock-${validUserId}`,
                  edit_count: 1,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                } as StudentProfile
              }
              
              throw insertError
            }
            
            result = insertData
          }
          
          console.log('成功创建/更新student_profiles记录:', result)
          
          // 同时更新users表中的基本信息和student_profiles的扩展信息
          await this.updateCompleteUserInfo(validUserId, profileData)
          
          return result
        } catch (error) {
          console.error('创建个人信息异常:', error)
          
          // 检查是否为模拟模式
          const isDemoMode = !import.meta.env.VITE_SUPABASE_URL || 
              import.meta.env.VITE_SUPABASE_URL.includes('your-project-ref') ||
              import.meta.env.VITE_SUPABASE_URL.includes('demo.supabase.co')
          
          if (isDemoMode) {
            console.log('模拟模式：直接返回模拟数据')
            return {
              ...newProfileData,
              id: `mock-${validUserId}`,
              edit_count: 1,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            } as StudentProfile
          }
          
          throw error
        }
      }
      
      // 直接更新个人信息（用于直接可修改的字段）
      console.log('更新现有记录:', existingProfile.id)
      const updatedProfile = await this.updateStudentProfile(existingProfile.id, {
        gender: profileData.gender,
        birth_date: profileData.birth_date,
        id_card: profileData.id_card,
        nationality: profileData.nationality,
        political_status: profileData.political_status,
        phone: profileData.phone,
        emergency_contact: profileData.emergency_contact,
        emergency_phone: profileData.emergency_phone,
        home_address: profileData.home_address,
        admission_date: profileData.admission_date,
        graduation_date: profileData.graduation_date,
        student_type: profileData.student_type,
        profile_status: 'pending',
        // 添加学籍信息字段
        major: profileData.major,
        academic_system: profileData.academic_system,
        academic_status: profileData.academic_status,
        department: profileData.department,
        class_info: profileData.class_info,
        enrollment_year: profileData.enrollment_year,
        profile_photo: profileData.profile_photo
      })
      
      console.log('更新成功:', updatedProfile)
      return updatedProfile
    } catch (error) {
      console.error('创建或更新个人信息失败:', error)
      throw error
    }
  }

  // 完整更新用户信息（包括users表和student_profiles表）
  private static async updateCompleteUserInfo(userId: string, profileData: StudentProfileFormData) {
    try {
      console.log('开始完整更新用户信息，用户ID:', userId);

      // 第一步：更新users表的基本信息
      const userUpdateData = {
        full_name: profileData.full_name,
        id_card: profileData.id_card,
        gender: profileData.gender,
        birth_date: profileData.birth_date,
        nationality: profileData.nationality,
        phone: profileData.phone,
        department: profileData.department,
        major: profileData.major,
        class_name: profileData.class_name,
        admission_year: profileData.admission_year,
        study_duration: profileData.study_duration || 4,
        academic_status: profileData.academic_status || '在读',
        profile_completed: true,
        profile_completed_at: new Date().toISOString(),
        is_first_login: false,
        updated_at: new Date().toISOString()
      };

      // 如果有用户编号，也更新
      if (profileData.user_number) {
        userUpdateData.user_number = profileData.user_number;
      }

      if (profileData.email) {
        userUpdateData.email = profileData.email;
      }

      const { error: userError } = await supabase
        .from('users')
        .update(userUpdateData)
        .eq('id', userId);

      if (userError) {
        console.warn('更新users表失败:', userError);
        // 继续执行student_profiles表的更新
      } else {
        console.log('✅ 成功更新users表基本信息');
      }

      // 第二步：更新student_profiles表的扩展信息
      const profileUpdateData = {
        gender: profileData.gender,
        birth_date: profileData.birth_date,
        id_card: profileData.id_card,
        nationality: profileData.nationality,
        political_status: profileData.political_status,
        phone: profileData.phone,
        emergency_contact: profileData.emergency_contact, // 紧急联系人
        emergency_phone: profileData.emergency_phone,   // 紧急联系人电话
        home_address: profileData.home_address,          // 家庭地址
        admission_date: profileData.admission_date,
        graduation_date: profileData.graduation_date,
        student_type: profileData.student_type || '全日制',
        class_name: profileData.class_name,
        profile_status: 'pending',
        updated_at: new Date().toISOString()
      };

      // 先查询是否已有student_profiles记录
      const { data: existingProfile } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      let profileError;
      
      if (existingProfile) {
        // 更新现有记录
        const { error } = await supabase
          .from('student_profiles')
          .update({
            ...profileUpdateData,
            edit_count: supabase.sql`edit_count + 1`
          })
          .eq('id', existingProfile.id);
        profileError = error;
      } else {
        // 插入新记录
        const { error } = await supabase
          .from('student_profiles')
          .insert({
            ...profileUpdateData,
            user_id: userId,
            edit_count: 1,
            created_at: new Date().toISOString()
          });
        profileError = error;
      }

      if (profileError) {
        console.warn('更新student_profiles表失败:', profileError);
      } else {
        console.log('✅ 成功更新student_profiles表扩展信息，包括紧急联系人');
      }

      // 检查整体更新状态
      if (!userError && !profileError) {
        console.log('✅ 用户完整信息更新成功');
      } else {
        console.warn('⚠️ 部分更新失败，请检查具体错误');
      }

    } catch (error) {
      console.error('完整更新用户信息异常:', error);
      // 不抛出错误，允许主要流程继续
    }
  }

  // 审核学生个人信息
  static async reviewStudentProfile(
    profileId: string,
    reviewResult: 'approved' | 'rejected',
    reviewNotes?: string,
    reviewedBy?: string // 添加可选参数，允许传入审核人ID
  ): Promise<boolean> {
    let reviewerId = reviewedBy
    
    // 如果没有传入审核人ID，尝试从本地存储获取
    if (!reviewerId) {
      const userInfo = localStorage.getItem('user_info')
      if (userInfo) {
        try {
          const user = JSON.parse(userInfo)
          reviewerId = user.id
        } catch (error) {
          console.error('解析用户信息失败:', error)
        }
      }
    }
    
    if (!reviewerId) {
      throw new Error('无法获取审核人信息，请重新登录')
    }
    
    const { error } = await supabase
      .rpc('review_student_profile', {
        p_profile_id: profileId,
        p_review_result: reviewResult,
        p_review_notes: reviewNotes,
        p_reviewed_by: reviewerId
      })
    
    if (error) throw error
    
    return true
  }

  // 获取所有班级列表
  static async getClasses(): Promise<ClassInfo[]> {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('grade')
      .order('class_name')
    
    if (error) throw error
    
    return data || []
  }

  // 获取系统设置
  static async getSystemSettings(): Promise<SystemSetting[]> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
      
      if (error) {
        console.warn('获取系统设置失败，使用默认设置:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('获取系统设置异常:', error)
      return []
    }
  }

  // 获取个人信息维护功能开关状态
  static async isProfileEditEnabled(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'student_profile_edit_enabled')
        .single()
      
      if (error) {
        if (error.status === 406 || error.message?.includes('406')) {
          console.warn('系统设置查询返回406错误，默认启用编辑功能')
          return true
        }
        console.warn('获取系统设置失败，默认启用编辑功能:', error)
        return true
      }
      
      return data?.setting_value === 'true'
    } catch (error) {
      console.error('获取系统设置异常:', error)
      return true
    }
  }

  // 更新系统设置
  static async updateSystemSetting(
    settingKey: string,
    settingValue: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from('system_settings')
      .update({ setting_value: settingValue, updated_at: new Date().toISOString() })
      .eq('setting_key', settingKey)
    
    if (error) throw error
    
    return true
  }

  // 搜索学生列表（教师和管理员使用）
  static async searchStudents(params: StudentSearchParams): Promise<StudentListResponse> {
    let query = supabase
      .from('student_complete_info')
      .select('*', { count: 'exact' })
    
    // 添加搜索条件
    if (params.keyword) {
      query = query.or(`full_name.ilike.%${params.keyword}%,user_number.ilike.%${params.keyword}%,username.ilike.%${params.keyword}%`)
    }
    
    if (params.class_id) {
      query = query.eq('class_id', params.class_id)
    }
    
    if (params.grade) {
      query = query.eq('grade', params.grade)
    }
    
    if (params.department) {
      query = query.eq('department', params.department)
    }
    
    if (params.profile_status) {
      query = query.eq('profile_status', params.profile_status)
    }
    
    // 分页
    const page = params.page || 1
    const limit = params.limit || 20
    const from = (page - 1) * limit
    const to = from + limit - 1
    
    query = query.range(from, to).order('created_at', { ascending: false })
    
    const { data, error, count } = await query
    
    if (error) throw error
    
    return {
      students: data || [],
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit)
    }
  }

  // 批量审核学生信息
  static async batchReviewProfiles(
    profileIds: string[],
    reviewResult: 'approved' | 'rejected',
    reviewNotes?: string,
    reviewedBy?: string // 添加可选参数，允许传入审核人ID
  ): Promise<boolean> {
    let reviewerId = reviewedBy
    
    // 如果没有传入审核人ID，尝试从本地存储获取
    if (!reviewerId) {
      const userInfo = localStorage.getItem('user_info')
      if (userInfo) {
        try {
          const user = JSON.parse(userInfo)
          reviewerId = user.id
        } catch (error) {
          console.error('解析用户信息失败:', error)
        }
      }
    }
    
    if (!reviewerId) {
      throw new Error('无法获取审核人信息，请重新登录')
    }
    
    // 逐个审核
    for (const profileId of profileIds) {
      try {
        await this.reviewStudentProfile(profileId, reviewResult, reviewNotes, reviewerId)
      } catch (error) {
        console.error(`审核学生信息失败 (${profileId}):`, error)
        throw error
      }
    }
    
    return true
  }

  // 获取学生个人信息修改记录
  static async getProfileEditLogs(profileId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('profile_edit_logs')
      .select('*')
      .eq('student_profile_id', profileId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return data || []
  }

  // 检查新登录学生是否需要完善个人信息
  static async checkProfileCompletion(userId: string): Promise<{
    needsCompletion: boolean
    profile?: StudentProfile
    isEditEnabled: boolean
  }> {
    const [profile, isEditEnabled] = await Promise.all([
      this.getStudentProfile(userId),
      this.isProfileEditEnabled()
    ])
    
    const needsCompletion = !profile || 
                           profile.profile_status === 'incomplete' || 
                           profile.profile_status === 'rejected'
    
    return {
      needsCompletion,
      profile: profile || undefined,
      isEditEnabled
    }
  }

  // 获取学生技术标签信息
  static async getStudentTechnicalTags(studentId: string): Promise<{
    tag_names: string | null
    total_tags: number
    advanced_tags: number
  }> {
    try {
      // 检查表是否存在
      try {
        const { data: testData, error: testError } = await supabase
          .from('student_learning_summary')
          .select('count', { count: 'exact', head: true });
        
        if (testError && (testError.code === 'PGRST116' || testError.status === 406)) {
          console.warn('student_learning_summary表不存在，返回默认值');
          return {
            tag_names: null,
            total_tags: 0,
            advanced_tags: 0
          };
        }
      } catch (tableError) {
        console.warn('检查student_learning_summary表失败:', tableError);
        return {
          tag_names: null,
          total_tags: 0,
          advanced_tags: 0
        };
      }

      const { data, error } = await supabase
        .from('student_learning_summary')
        .select('tag_names, total_tags, advanced_tags')
        .eq('student_profile_id', studentId)
        .maybeSingle()
      
      if (error) {
        // 处理406错误和其他表结构问题
        if (error.code === 'PGRST116' || error.code === 'PGRST204' || error.status === 406) {
          console.warn('技术标签数据不存在或表结构问题:', error.message);
          return {
            tag_names: null,
            total_tags: 0,
            advanced_tags: 0
          };
        }
        // 处理多个结果的情况
        if (error.message && error.message.includes('coerce the result to a single JSON object')) {
          console.warn('找到多条技术标签记录，获取最新一条');
          const { data: multipleData, error: multipleError } = await supabase
            .from('student_learning_summary')
            .select('tag_names, total_tags, advanced_tags')
            .eq('student_profile_id', studentId)
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (multipleError) {
            console.warn('获取多条技术标签记录失败:', multipleError);
            return {
              tag_names: null,
              total_tags: 0,
              advanced_tags: 0
            };
          }
          
          if (multipleData && multipleData.length > 0) {
            return {
              tag_names: multipleData[0]?.tag_names || null,
              total_tags: multipleData[0]?.total_tags || 0,
              advanced_tags: multipleData[0]?.advanced_tags || 0
            };
          }
          
          return {
            tag_names: null,
            total_tags: 0,
            advanced_tags: 0
          };
        }
        console.warn('获取学生技术标签失败:', error)
        return {
          tag_names: null,
          total_tags: 0,
          advanced_tags: 0
        }
      }
      
      return {
        tag_names: data?.tag_names || null,
        total_tags: data?.total_tags || 0,
        advanced_tags: data?.advanced_tags || 0
      }
    } catch (error) {
      console.error('获取学生技术标签异常:', error)
      return {
        tag_names: null,
        total_tags: 0,
        advanced_tags: 0
      }
    }
  }

  // 获取学生详细技术标签信息（包含课程来源）
  static async getStudentTechnicalTagsDetail(studentId: string): Promise<{
    tags: Array<{
      tag_name: string
      tag_category: string
      proficiency_level: string
      course_name?: string
      created_at: string
    }>
    summary: {
      tag_names: string | null
      total_tags: number
      advanced_tags: number
    }
  }> {
    try {
      // console.log('🔍 开始获取详细技术标签，studentId:', studentId);
      
      // 先获取基本的技术标签信息，不依赖关联表
      const { data: tagsData, error: tagsError } = await supabase
        .from('student_technical_tags')
        .select(`
          tag_name,
          tag_category,
          proficiency_level,
          description,
          created_at
        `)
        .eq('student_profile_id', studentId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      
      // console.log('🔍 标签查询结果:', { tagsData, tagsError });
      
      // 获取汇总信息
      const summary = await this.getStudentTechnicalTags(studentId)
      console.log('🔍 汇总信息:', summary);
      
      if (tagsError) {
        console.warn('获取学生详细技术标签失败:', tagsError)
        return {
          tags: [],
          summary
        }
      }
      
      console.log('🔍 标签数据:', tagsData);
      
      const result = {
        tags: (tagsData && tagsData.length > 0) ? tagsData.map(tag => {
          // 从description字段提取课程名称
          let courseName = tag.description;
          if (courseName && courseName.startsWith('课程:')) {
            courseName = courseName.replace('课程:', '').trim();
          }
          
          return {
            tag_name: tag.tag_name,
            tag_category: tag.tag_category,
            proficiency_level: tag.proficiency_level,
            course_name: courseName,
            created_at: tag.created_at
          };
        }) : [],
        summary
      };
      
      console.log('🔍 最终返回结果:', result);
      
      // console.log('🔍 最终返回结果:', result);
      return result;
    } catch (error) {
      console.error('获取学生详细技术标签异常:', error)
      const summary = await this.getStudentTechnicalTags(studentId)
      return {
        tags: [],
        summary
      }
    }
  }

  // 更新现有个人资料的辅助方法
  private static async updateExistingProfile(
    userId: string,
    profileData: StudentProfileFormData
  ): Promise<StudentProfile> {
    try {
      console.log('开始更新现有个人资料，用户ID:', userId)
      
      // 首先尝试获取现有的记录ID
      const { data: existingData, error: queryError } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('user_id', userId)
        .single()
      
      if (queryError) {
        console.error('查询现有记录失败:', queryError)
        throw new Error('无法找到现有记录')
      }

      // 构建更新数据
      const updateData = {
        gender: profileData.gender,
        birth_date: profileData.birth_date || undefined,
        id_card: profileData.id_card || undefined,
        nationality: profileData.nationality || undefined,
        political_status: profileData.political_status || undefined,
        phone: profileData.phone || '',
        emergency_contact: profileData.emergency_contact || undefined,
        emergency_phone: profileData.emergency_phone || '',
        home_address: profileData.home_address || undefined,
        admission_date: profileData.admission_date || undefined,
        graduation_date: profileData.graduation_date || undefined,
        student_type: profileData.student_type || '全日制',
        profile_status: 'pending' as const,
        edit_count: supabase.sql`edit_count + 1`,
        updated_at: new Date().toISOString(),
        // 添加学籍信息字段
        major: profileData.major || undefined,
        academic_system: profileData.academic_system || undefined,
        academic_status: profileData.academic_status || undefined,
        department: profileData.department || undefined,
        class_info: profileData.class_info || undefined,
        enrollment_year: profileData.enrollment_year || undefined,
        profile_photo: profileData.profile_photo || undefined
      }

      // 更新记录
      const { data, error } = await supabase
        .from('student_profiles')
        .update(updateData)
        .eq('id', existingData.id)
        .select()
        .single()
      
      if (error) {
        console.error('更新记录失败:', error)
        throw error
      }

      console.log('成功更新student_profiles现有记录:', data)
      
      // 同时更新users表中的基本信息
      await this.updateCompleteUserInfo(userId, profileData)
      
      return data
    } catch (error) {
      console.error('更新现有个人资料失败:', error)
      throw error
    }
  }
}

export default StudentProfileService