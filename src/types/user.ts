export interface User {
  id: string
  username: string
  email: string
  user_number: string
  full_name: string
  password?: string // 明文密码（仅用于创建时）
  password_hash?: string // 加密后的密码
  role_id: string
  status: 'active' | 'inactive' | 'pending'
  phone?: string
  department?: string
  grade?: string
  class_name?: string
  created_at: string
  updated_at: string
  last_login_at?: string
}

export interface Role {
  id: string
  role_name: 'super_admin' | 'teacher' | 'student'
  role_description: string
  permissions: any
  is_system_default: boolean
  created_at: string
  updated_at: string
}

export interface UserWithRole extends User {
  role: Role
  user_id?: string // 原始用户ID（与档案ID不同时的映射）
}

export interface UserSearchParams {
  keyword?: string
  role_id?: string
  status?: string
  page?: number
  limit?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface UserListResponse {
  users: UserWithRole[]
  total: number
  page: number
  limit: number
  total_pages: number
}



// ==================== 学生个人信息相关类型 ====================
export interface StudentProfile {
  id: string
  user_id: string
  gender?: 'male' | 'female' | 'other'
  birth_date?: string
  id_card?: string
  nationality?: string
  political_status?: string
  phone?: string
  emergency_contact?: string
  emergency_phone?: string
  emergency_contacts_json?: string
  home_address?: string
  admission_date?: string
  graduation_date?: string
  student_type?: string
  class_id?: string
  class_name?: string
  profile_photo?: string
  major?: string
  academic_system?: string
  academic_status?: string
  department?: string
  class_info?: string
  enrollment_year?: string
  profile_status: 'incomplete' | 'pending' | 'approved' | 'rejected'
  edit_count: number
  last_edit_at?: string
  reviewed_by?: string
  reviewed_at?: string
  review_notes?: string
  created_at: string
  updated_at: string
}

export interface ClassInfo {
  id: string
  class_name: string
  class_code?: string
  grade: string
  department?: string
  head_teacher_id?: string
  student_count: number
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface SystemSetting {
  id: string
  setting_key: string
  setting_value: string
  setting_description?: string
  is_editable: boolean
  created_at: string
  updated_at: string
}

export interface ProfileEditLog {
  id: string
  student_profile_id: string
  user_id: string
  changed_fields: Record<string, any>
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  edit_reason?: string
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface StudentCompleteInfo {
  user_id: string
  username: string
  email: string
  user_number: string
  full_name: string
  user_status: string
  user_phone?: string
  department?: string
  grade?: string
  user_class_name?: string
  profile_id?: string
  gender?: 'male' | 'female' | 'other'
  birth_date?: string
  id_card?: string
  nationality?: string
  political_status?: string
  profile_phone?: string
  emergency_contact?: string
  emergency_phone?: string
  home_address?: string
  admission_date?: string
  graduation_date?: string
  student_type?: string
  class_id?: string
  profile_class_name?: string
  profile_photo?: string
  profile_status: 'incomplete' | 'pending' | 'approved' | 'rejected'
  edit_count: number
  last_edit_at?: string
  reviewed_by?: string
  reviewed_at?: string
  review_notes?: string
  class_code?: string
  head_teacher_id?: string
  student_count: number
  class_status: string
  profile_status_text: string
}

export interface StudentProfileFormData {
  full_name?: string
  user_number?: string
  email?: string
  gender?: 'male' | 'female' | 'other'
  birth_date?: string
  id_card?: string
  nationality?: string
  political_status?: string
  phone?: string
  emergency_contact?: string
  emergency_phone?: string
  emergency_contacts_json?: string
  home_address?: string
  admission_date?: string
  graduation_date?: string
  student_type?: string
  class_id?: string
  class_name?: string
  profile_photo?: string
  major?: string
  academic_system?: string
  academic_status?: string
  department?: string
  class_info?: string
  enrollment_year?: string
  admission_year?: number
  study_duration?: number
  photo_url?: string
  edit_reason?: string
}

export interface StudentSearchParams {
  keyword?: string
  class_id?: string
  grade?: string
  department?: string
  profile_status?: string
  page?: number
  limit?: number
}

export interface StudentListResponse {
  students: StudentCompleteInfo[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface StudentBatchOperation {
  id: string
  operation_type: 'grade_upload' | 'class_change' | 'status_update'
  description: string
  operation_data: Record<string, any>
  affected_count: number
  success_count: number
  failed_count: number
  operated_by: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error_log?: string
  created_at: string
  completed_at?: string
}