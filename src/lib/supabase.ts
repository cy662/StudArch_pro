import { createClient } from '@supabase/supabase-js'

// 检查环境变量，如果未配置则使用模拟模式
const isConfigured = import.meta.env.VITE_SUPABASE_URL && 
                    import.meta.env.VITE_SUPABASE_ANON_KEY &&
                    !import.meta.env.VITE_SUPABASE_URL.includes('your-project-ref') &&
                    !import.meta.env.VITE_SUPABASE_URL.includes('demo.supabase.co') &&
                    import.meta.env.VITE_SUPABASE_URL.startsWith('https://')

let supabase: any

if (isConfigured) {
  // 使用真实Supabase客户端
  supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    }
  )
} else {
  // 模拟模式 - 提供更完善的模拟数据支持
  console.warn('Supabase未配置，使用模拟模式')
  supabase = {
    from: (tableName: string) => {
      console.log(`模拟查询表: ${tableName}`)
      return {
        select: (columns: string = '*') => {
          console.log(`选择字段: ${columns}`)
          return {
            eq: (column: string, value: any) => ({
              single: () => ({
                then: (callback: any) => {
                  setTimeout(() => {
                    if (tableName === 'student_profiles') {
                      callback({
                        data: {
                          id: 'mock-profile-id',
                          user_id: value,
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
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString()
                        },
                        error: null
                      })
                    } else if (tableName === 'system_settings') {
                      callback({
                        data: {
                          setting_key: value,
                          setting_value: 'true'
                        },
                        error: null
                      })
                    } else {
                      callback({
                        data: null,
                        error: { code: 'PGRST116', message: '记录不存在' }
                      })
                    }
                  }, 300)
                }
              }),
              range: (from: number, to: number) => ({
                order: (column: string, options: any) => ({
                  then: (callback: any) => {
                    setTimeout(() => {
                      callback({
                        data: [],
                        error: null
                      })
                    }, 300)
                  }
                })
              })
            }),
            or: (conditions: string) => ({
              eq: (column: string, value: any) => ({
                range: (from: number, to: number) => ({
                  order: (column: string, options: any) => ({
                    then: (callback: any) => {
                      setTimeout(() => {
                        callback({
                          data: [],
                          error: null,
                          count: 0
                        })
                      }, 300)
                    }
                  })
                })
              })
            })
          }
        }
      }
    },
    rpc: (functionName: string) => ({
      then: (callback: any) => {
        setTimeout(() => {
          if (functionName === 'initialize_student_profile') {
            callback({
              data: 'mock-profile-id',
              error: null
            })
          } else {
            callback({
              data: null,
              error: { message: 'RPC函数不存在' }
            })
          }
        }, 300)
      }
    })
  }
}

export { supabase }
export default supabase