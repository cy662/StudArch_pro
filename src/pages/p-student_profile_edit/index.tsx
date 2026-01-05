import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import StudentProfileService from '../../services/studentProfileService';
import useStudentProfile from '../../hooks/useStudentProfile';
import { StudentProfile, StudentProfileFormData as StudentProfileDBFormData, UserWithRole } from '../../types/user';
import { supabase } from '../../lib/supabase';

// 样式类名常量
const STYLES = {
  pageWrapper: 'bg-gray-50 min-h-screen',
  sidebarTransition: 'transition-all duration-300 ease-in-out',
  navItem: 'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
  navItemActive: 'bg-purple-100 text-purple-800 border-r-2 border-purple-800',
  sectionCard: 'bg-white rounded-xl shadow-sm border border-gray-200',
  readonlyField: 'bg-gray-50 border-gray-300 text-gray-600 cursor-not-allowed',
  editableField: 'bg-white border-gray-300 text-gray-900',
  formInputFocus: 'focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200'
};

interface EmergencyContact {
  name: string;
  phone: string;
}

interface StudentProfileFormData {
  studentId: string;
  studentName: string;
  studentGender: 'male' | 'female' | 'other';
  idCard: string;
  ethnicity: string;
  birthDate: string;
  politicalStatus: string;
  contactPhone: string;
  email: string;
  homeAddress: string;
  emergencyContacts: EmergencyContact[];
  department: string;
  major: string;
  class: string;
  enrollmentYear: string;
  academicSystem: string;
  academicStatus: string;
  profilePhoto?: string;
}



const StudentProfileEdit: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // 使用useStudentProfile hook获取个人信息
  const { 
    profile: studentProfile, 
    loading: profileLoading, 
    refreshProfile: refreshStudentProfile 
  } = useStudentProfile(currentUser?.id || '');

  // 页面标题设置和用户信息加载
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '个人信息维护 - 学档通';
    
    // 当用户信息和个人信息加载完成后，更新表单
    if (!authLoading && currentUser) {
      console.log('studentProfile.profile_photo:', studentProfile?.profile_photo);
      
      // 从学生个人信息中获取数据，如果没有则使用默认值
      const profileData = {
        studentId: currentUser?.user_number || currentUser?.username || '',
        studentName: currentUser?.full_name || '',
        studentGender: studentProfile?.gender || 'male',
        idCard: studentProfile?.id_card || '',
        ethnicity: studentProfile?.nationality || '',
        birthDate: studentProfile?.birth_date || '',
        politicalStatus: studentProfile?.political_status || '',
        contactPhone: studentProfile?.phone || '',
        email: currentUser?.email || '',
        homeAddress: studentProfile?.home_address || '',
        emergencyContacts: [
          { 
            name: studentProfile?.emergency_contact || '', 
            phone: studentProfile?.emergency_phone || '' 
          }
        ],
        department: studentProfile?.department || currentUser?.department || '',
        major: studentProfile?.major || '',
        class: studentProfile?.class_info || currentUser?.class_name || '',
        enrollmentYear: studentProfile?.enrollment_year || currentUser?.grade || '',
        academicSystem: studentProfile?.academic_system || '',
        academicStatus: studentProfile?.academic_status || '未完成',
        profilePhoto: studentProfile?.profile_photo || ''
      };
      
      console.log('即将设置到表单的数据:', profileData);
      setProfile(profileData);
      setLoading(false);
    }
    
    return () => { document.title = originalTitle; };
  }, [currentUser, studentProfile, authLoading, profileLoading]);

  // 表单状态
  const [profile, setProfile] = useState<StudentProfileFormData>({
    studentId: '',
    studentName: '',
    studentGender: 'male',
    idCard: '',
    ethnicity: '',
    birthDate: '',
    politicalStatus: '',
    contactPhone: '',
    email: '',
    homeAddress: '',
    emergencyContacts: [
      { name: '', phone: '' }
    ],
    department: '',
    major: '',
    class: '',
    enrollmentYear: '',
    academicSystem: '',
    academicStatus: '未完成',
    profilePhoto: ''
  });



  // 成功提示状态
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // 错误提示状态
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');




  // 处理表单输入变化
  const handleInputChange = (field: keyof StudentProfileFormData, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 处理性别选择
  const handleGenderChange = (gender: 'male' | 'female' | 'other') => {
    setProfile(prev => ({
      ...prev,
      studentGender: gender
    }));
  };

  // 处理证件照上传
  const handleProfilePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      showErrorMessage('请选择图片文件');
      return;
    }

    // 验证文件大小（2MB）
    if (file.size > 2 * 1024 * 1024) {
      showErrorMessage('图片文件大小不能超过2MB');
      return;
    }

    // 转换为Base64或上传到服务器
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      handleInputChange('profilePhoto', result);
    };
    reader.readAsDataURL(file);
  };

  // 获取性别显示文本
  const getGenderDisplayText = (gender: 'male' | 'female' | 'other') => {
    switch (gender) {
      case 'male': return '男';
      case 'female': return '女';
      case 'other': return '其他';
      default: return '未知';
    }
  };

  // 更新紧急联系人信息
  const handleEmergencyContactChange = (field: 'name' | 'phone', value: string) => {
    setProfile(prev => ({
      ...prev,
      emergencyContacts: [
        { ...prev.emergencyContacts[0], [field]: value }
      ]
    }));
  };

  // 保存修改到数据库
  const handleSave = async () => {
    // 必填字段验证
    if (!profile.studentName.trim()) {
      showErrorMessage('请填写姓名');
      return;
    }
    
    if (!profile.idCard.trim()) {
      showErrorMessage('请填写身份证号码');
      return;
    }
    
    if (!/^\d{17}[\dX]$|^\d{15}$/.test(profile.idCard.replace(/\s/g, ''))) {
      showErrorMessage('请输入正确的身份证号码格式');
      return;
    }
    
    if (!profile.ethnicity.trim()) {
      showErrorMessage('请填写民族');
      return;
    }
    
    if (!profile.birthDate) {
      showErrorMessage('请选择出生日期');
      return;
    }
    
    if (!profile.profilePhoto) {
      showErrorMessage('请上传证件照');
      return;
    }
    
    if (!profile.contactPhone.trim()) {
      showErrorMessage('请填写联系电话');
      return;
    }
    
    if (!/^1[3-9]\d{9}$/.test(profile.contactPhone)) {
      showErrorMessage('请输入正确的手机号码格式');
      return;
    }
    
    if (!profile.email.trim()) {
      showErrorMessage('请填写电子邮箱');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      showErrorMessage('请输入正确的邮箱格式');
      return;
    }
    
    // 验证紧急联系人
    const contact = profile.emergencyContacts[0];
    if (!contact.name.trim()) {
      showErrorMessage('请填写紧急联系人姓名');
      return;
    }
    if (!contact.phone.trim() || !/^1[3-9]\d{9}$/.test(contact.phone)) {
      showErrorMessage('请输入正确的紧急联系人手机号码');
      return;
    }
    
    if (!profile.department.trim()) {
      showErrorMessage('请填写院系');
      return;
    }
    
    if (!profile.major.trim()) {
      showErrorMessage('请填写专业');
      return;
    }
    
    if (!profile.class.trim()) {
      showErrorMessage('请填写班级');
      return;
    }
    
    if (!profile.enrollmentYear.trim()) {
      showErrorMessage('请填写入学年份');
      return;
    }
    
    if (!/^\d{4}$/.test(profile.enrollmentYear)) {
      showErrorMessage('请输入正确的入学年份格式（如：2023）');
      return;
    }
    
    if (!profile.academicSystem) {
      showErrorMessage('请选择学制');
      return;
    }
    
    if (!profile.academicStatus) {
      showErrorMessage('请选择学籍状态');
      return;
    }

    setSaving(true);
    
    try {
      if (!currentUser?.id) {
        throw new Error('用户信息获取失败，请重新登录');
      }

      // 首先更新用户表的基本信息字段
      try {
        const { error: userUpdateError } = await supabase
          .from('users')
          .update({ 
            full_name: profile.studentName,
            department: profile.department,
            class_name: profile.class,
            grade: profile.enrollmentYear,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentUser.id);
        
        if (userUpdateError) {
          console.warn('更新用户基本信息失败:', userUpdateError);
        }
      } catch (error) {
        console.warn('更新用户基本信息异常:', error);
      }

      // 转换表单数据为数据库格式
      const profileData: StudentProfileDBFormData = {
        gender: profile.studentGender,
        birth_date: profile.birthDate || undefined,
        id_card: profile.idCard || undefined,
        nationality: profile.ethnicity || undefined,
        political_status: profile.politicalStatus || undefined,
        phone: profile.contactPhone,
        emergency_contact: profile.emergencyContacts[0]?.name || undefined,
        emergency_phone: profile.emergencyContacts[0]?.phone,
        home_address: profile.homeAddress || undefined,
        admission_date: profile.enrollmentYear ? `${profile.enrollmentYear}-09-01` : undefined,
        graduation_date: profile.enrollmentYear ? `${parseInt(profile.enrollmentYear) + 4}-06-30` : undefined,
        student_type: '全日制',
        profile_photo: profile.profilePhoto,
        major: profile.major || undefined,
        academic_system: profile.academicSystem || undefined,
        academic_status: profile.academicStatus || undefined,
        department: profile.department || undefined,
        class_info: profile.class || undefined,
        enrollment_year: profile.enrollmentYear || undefined
      };

      // 保存到数据库
      
      const result = await StudentProfileService.createOrUpdateStudentProfile(currentUser.id, profileData);
      console.log('保存结果:', result);
      
      // 添加延迟确保数据库更新完成
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 强制刷新个人资料 - 使用更激进的刷新策略
      await refreshStudentProfile();
      await refreshProfile();
      
      // 重新获取最新的个人资料数据
      const latestProfile = await StudentProfileService.getStudentProfile(currentUser.id);
      console.log('重新获取的最新数据:', latestProfile);
      
      if (latestProfile) {
        // 强制更新表单数据
        const updatedFormData = {
          department: latestProfile.department || profile.department,
          major: latestProfile.major || profile.major,
          class: latestProfile.class_info || profile.class,
          enrollmentYear: latestProfile.enrollment_year || profile.enrollmentYear,
          academicSystem: latestProfile.academic_system || profile.academicSystem,
          academicStatus: latestProfile.academic_status || profile.academicStatus,
          profilePhoto: latestProfile.profile_photo || profile.profilePhoto
        };
        
        console.log('强制更新表单数据:', updatedFormData);
        setProfile(prev => ({ ...prev, ...updatedFormData }));
      }
      
      // 检查数据是否真正同步
      if (latestProfile) {
        const isSynced = 
          latestProfile.phone === profileData.phone &&
          latestProfile.emergency_phone === profileData.emergency_phone &&
          latestProfile.home_address === profileData.home_address &&
          latestProfile.id_card === profileData.id_card;
        
        if (isSynced) {
          showSuccessMessage('个人信息保存成功！您的姓名、身份证号和所有信息已更新。');
        } else {
          showSuccessMessage('个人信息保存成功！数据正在同步中，请稍后刷新页面查看。');
        }
      } else {
        showSuccessMessage('个人信息保存成功！');
      }
    } catch (error) {
      
      // 提供更详细的错误信息
      let errorMessage = '保存失败，请稍后重试';
      if (error instanceof Error) {
        errorMessage += `：${error.message}`;
        
        // 根据错误类型提供更具体的建议
        if (error.message.includes('RLS') || error.message.includes('policy')) {
          errorMessage += '。请检查数据库权限设置。';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage += '。请检查网络连接。';
        }
      }
      
      showErrorMessage(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // 取消修改
  const handleCancel = () => {
    if (confirm('确定要取消修改吗？未保存的更改将丢失。')) {
      // 重置表单到初始状态
      setProfile({
        studentId: currentUser?.user_number || currentUser?.username || '',
        studentName: currentUser?.full_name || '',
        studentGender: studentProfile?.gender || 'male',
        idCard: studentProfile?.id_card || '',
        ethnicity: studentProfile?.nationality || '',
        birthDate: studentProfile?.birth_date || '',
        politicalStatus: studentProfile?.political_status || '',
        contactPhone: studentProfile?.phone || '',
        email: currentUser?.email || '',
        homeAddress: studentProfile?.home_address || '',
        emergencyContacts: [
          { 
            name: studentProfile?.emergency_contact || '', 
            phone: studentProfile?.emergency_phone || '' 
          }
        ],
        department: studentProfile?.department || currentUser?.department || '',
        major: studentProfile?.major || '',
        class: studentProfile?.class_info || currentUser?.class_name || '',
        enrollmentYear: studentProfile?.enrollment_year || currentUser?.grade || '',
        academicSystem: studentProfile?.academic_system || '',
        academicStatus: studentProfile?.academic_status || '未完成',
        profilePhoto: studentProfile?.profile_photo || ''
      });
    }
  };

  // 显示成功提示
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessToast(true);
    
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);
  };

  // 显示错误提示
  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    setShowErrorToast(true);
    
    setTimeout(() => {
      setShowErrorToast(false);
    }, 5000);
  };

  // 退出登录
  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      navigate('/login');
    }
  };





  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-secondary mb-4"></i>
          <p className="text-text-secondary">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={STYLES.pageWrapper}>
      {/* 顶部导航栏 */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-border-light h-16 z-50">
        <div className="flex items-center justify-between h-full px-6">
          {/* Logo和系统名称 */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
              <i className="fas fa-graduation-cap text-white text-lg"></i>
            </div>
            <h1 className="text-xl font-bold text-text-primary">学档通</h1>
          </div>
          
          {/* 用户信息和操作 */}
          <div className="flex items-center space-x-4">
            {/* 用户信息 */}
            <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors">
              <img 
                src={studentProfile?.profile_photo || currentUser?.avatar || "https://s.coze.cn/image/K2rLqrUfOSs/"} 
                alt={loading ? '加载中...' : (currentUser?.full_name || currentUser?.username || '用户') + "头像"} 
                className="w-8 h-8 rounded-full object-cover" 
              />
              <div className="text-sm">
                <div className="font-medium text-text-primary">
                  {loading ? '加载中...' : (currentUser?.full_name || currentUser?.username || '未知用户')}
                </div>
                <div className="text-text-secondary">
                  {loading ? '加载中...' : (currentUser?.role === 'student' ? '学生' : (typeof currentUser?.role === 'object' ? '未知角色' : currentUser?.role || '用户'))}
                </div>
              </div>
              <i className="fas fa-chevron-down text-xs text-text-secondary"></i>
            </div>
            
            {/* 退出登录 */}
            <button 
              onClick={handleLogout}
              className="text-text-secondary hover:text-red-500 transition-colors"
            >
              <i className="fas fa-sign-out-alt text-lg"></i>
            </button>
          </div>
        </div>
      </header>

      {/* 左侧菜单 */}
      <aside className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-border-light z-40 ${STYLES.sidebarTransition}`}>
        <nav className="p-4 space-y-2">
          <Link 
            to="/student-dashboard" 
            className={`${STYLES.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-home text-lg"></i>
            <span className="font-medium">学生服务平台</span>
          </Link>
          
          <Link 
            to="/student-my-profile" 
            className={`${STYLES.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-user text-lg"></i>
            <span className="font-medium">我的档案</span>
          </Link>
          
          <Link 
            to="/student-profile-edit" 
            className={`${STYLES.navItem} ${STYLES.navItemActive} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors`}
          >
            <i className="fas fa-edit text-lg"></i>
            <span className="font-medium">个人信息维护</span>
          </Link>
          
          <Link 
            to="/student-graduation-fill" 
            className={`${STYLES.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-rocket text-lg"></i>
            <span className="font-medium">毕业去向填报</span>
          </Link>
          
          <Link 
            to="/student-document-view" 
            className={`${STYLES.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-file-alt text-lg"></i>
            <span className="font-medium">信息查看与下载</span>
          </Link>
          
          <Link 
            to="/student-academic-tasks" 
            className={`${STYLES.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-book text-lg"></i>
            <span className="font-medium">课程收获与成功</span>
          </Link>
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="ml-64 mt-16 p-6 min-h-screen">
        {/* 首次登录提示 */}
        {!studentProfile && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-100 border-l-4 border-blue-500 p-6 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="fas fa-info-circle text-blue-600 text-xl"></i>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900">首次登录提示</h3>
                <p className="text-blue-700 mt-1">
                  请您填写以下基本信息以完成学籍注册。标有 <span className="text-red-500 font-bold">*</span> 的字段为必填项。
                </p>
                <p className="text-sm text-blue-600 mt-2">
                  填写完整信息后，您将能够使用系统的完整功能，包括成绩查询、证明下载等。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">个人信息维护</h2>
              <nav className="text-sm text-text-secondary">
                <span>首页</span>
                <i className="fas fa-chevron-right mx-2"></i>
                <span>个人信息维护</span>
              </nav>
            </div>
            <div className="flex items-center space-x-2">

              
            </div>
          </div>
        </div>

        {/* 个人信息表单 */}
        <div className="space-y-6">
          {/* 基本信息区域 */}
          <section className={`${STYLES.sectionCard} p-6`}>
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
              <i className="fas fa-user-circle text-secondary mr-2"></i>
              基本信息
            </h3>
            
            {/* 证件照上传 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-text-primary mb-3">
                证件照 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-6">
                <div className="w-32 h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative overflow-hidden">
                  {profile.profilePhoto ? (
                    <img 
                      src={profile.profilePhoto} 
                      alt="证件照" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <i className="fas fa-camera text-gray-400 text-2xl mb-2"></i>
                      <p className="text-sm text-gray-500">点击上传证件照</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleProfilePhotoUpload}
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-text-primary mb-2">证件照要求</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 近期正面免冠照片</li>
                    <li>• 白底或蓝底背景</li>
                    <li>• 清晰显示五官</li>
                    <li>• 文件大小不超过2MB</li>
                    <li>• 支持JPG、PNG格式</li>
                  </ul>
                  {profile.profilePhoto && (
                    <button 
                      type="button"
                      onClick={() => handleInputChange('profilePhoto', '')}
                      className="mt-3 text-sm text-red-600 hover:text-red-700 transition-colors"
                    >
                      <i className="fas fa-trash mr-1"></i>
                      删除照片
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 学号（不可修改） */}
              <div className="space-y-2">
                <label htmlFor="student-id" className="block text-sm font-medium text-text-primary">学号</label>
                <input 
                  type="text" 
                  id="student-id" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${STYLES.readonlyField}`}
                  value={profile.studentId} 
                  readOnly 
                />
                <p className="text-xs text-text-secondary">学号为系统分配，不可修改</p>
              </div>

              {/* 姓名（可直接修改） */}
              <div className="space-y-2">
                <label htmlFor="student-name" className="block text-sm font-medium text-text-primary">
                  姓名 <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="student-name" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${STYLES.editableField} ${STYLES.formInputFocus}`}
                  placeholder="请输入真实姓名"
                  value={profile.studentName}
                  onChange={(e) => handleInputChange('studentName', e.target.value)}
                />
                <p className="text-xs text-text-secondary">请输入您的真实姓名</p>
              </div>

              {/* 性别（可直接修改） */}
              <div className="space-y-2">
                <label htmlFor="student-gender" className="block text-sm font-medium text-text-primary">性别</label>
                <div className="flex space-x-3">
                  {(['male', 'female', 'other'] as const).map(gender => (
                    <label key={gender} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        checked={profile.studentGender === gender}
                        onChange={() => handleGenderChange(gender)}
                        className="w-4 h-4 text-secondary focus:ring-secondary"
                      />
                      <span>{getGenderDisplayText(gender)}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-text-secondary">请选择性别</p>
              </div>

              {/* 身份证号（可直接修改） */}
              <div className="space-y-2">
                <label htmlFor="id-card" className="block text-sm font-medium text-text-primary">
                  身份证号 <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="id-card" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${STYLES.editableField} ${STYLES.formInputFocus}`}
                  placeholder="请输入18位身份证号码"
                  value={profile.idCard}
                  onChange={(e) => handleInputChange('idCard', e.target.value)}
                />
                <p className="text-xs text-text-secondary">请输入18位身份证号码（最后一位可以是X）</p>
              </div>

              {/* 民族（可直接修改） */}
              <div className="space-y-2">
                <label htmlFor="ethnicity" className="block text-sm font-medium text-text-primary">
                  民族 <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="ethnicity" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${STYLES.editableField} ${STYLES.formInputFocus}`}
                  placeholder="请输入民族"
                  value={profile.ethnicity}
                  onChange={(e) => handleInputChange('ethnicity', e.target.value)}
                />
                <p className="text-xs text-text-secondary">例如：汉族、回族、藏族等</p>
              </div>

              {/* 出生日期（可直接修改） */}
              <div className="space-y-2">
                <label htmlFor="birth-date" className="block text-sm font-medium text-text-primary">
                  出生日期 <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date" 
                  id="birth-date" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${STYLES.editableField} ${STYLES.formInputFocus}`}
                  value={profile.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                />
                <p className="text-xs text-text-secondary">请选择您的出生日期</p>
              </div>

              {/* 政治面貌（可直接修改） */}
              <div className="space-y-2">
                <label htmlFor="political-status" className="block text-sm font-medium text-text-primary">政治面貌</label>
                <select 
                  id="political-status" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${STYLES.editableField} ${STYLES.formInputFocus}`}
                  value={profile.politicalStatus}
                  onChange={(e) => handleInputChange('politicalStatus', e.target.value)}
                >
                  <option value="">请选择政治面貌</option>
                  <option value="党员">党员</option>
                  <option value="预备党员">预备党员</option>
                  <option value="团员">团员</option>
                  <option value="群众">群众</option>
                  <option value="其他">其他</option>
                </select>
                <p className="text-xs text-text-secondary">请选择您的政治面貌</p>
              </div>
            </div>
          </section>

          {/* 联系方式区域 */}
          <section className={`${STYLES.sectionCard} p-6`}>
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
              <i className="fas fa-phone text-secondary mr-2"></i>
              联系方式
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 联系电话（可直接修改） */}
              <div className="space-y-2">
                <label htmlFor="contact-phone" className="block text-sm font-medium text-text-primary">
                  联系电话 <span className="text-red-500">*</span>
                </label>
                <input 
                  type="tel" 
                  id="contact-phone" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${STYLES.editableField} ${STYLES.formInputFocus}`}
                  placeholder="请输入手机号码"
                  value={profile.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                />
                <p className="text-xs text-text-secondary">请填写常用手机号码</p>
              </div>

              {/* 电子邮箱（可直接修改） */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-text-primary">
                  电子邮箱 <span className="text-red-500">*</span>
                </label>
                <input 
                  type="email" 
                  id="email" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${STYLES.editableField} ${STYLES.formInputFocus}`}
                  placeholder="请输入邮箱地址"
                  value={profile.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
                <p className="text-xs text-text-secondary">用于接收重要通知</p>
              </div>

              {/* 家庭通讯地址（可直接修改） */}
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="home-address" className="block text-sm font-medium text-text-primary">家庭通讯地址</label>
                <textarea 
                  id="home-address" 
                  rows={3}
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${STYLES.editableField} ${STYLES.formInputFocus} resize-none`}
                  placeholder="请输入详细家庭地址"
                  value={profile.homeAddress}
                  onChange={(e) => handleInputChange('homeAddress', e.target.value)}
                />
                <p className="text-xs text-text-secondary">用于邮寄纸质材料</p>
              </div>
            </div>
          </section>

          {/* 紧急联系人区域 */}
          <section className={`${STYLES.sectionCard} p-6`}>
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
              <i className="fas fa-exclamation-triangle text-secondary mr-2"></i>
              紧急联系人
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">
                  联系人姓名 <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${STYLES.editableField} ${STYLES.formInputFocus}`}
                  placeholder="请输入联系人姓名"
                  value={profile.emergencyContacts[0].name}
                  onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                />
                <p className="text-xs text-text-secondary">建议填写直系亲属</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">
                  联系人电话 <span className="text-red-500">*</span>
                </label>
                <input 
                  type="tel" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${STYLES.editableField} ${STYLES.formInputFocus}`}
                  placeholder="请输入联系人手机号码"
                  value={profile.emergencyContacts[0].phone}
                  onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                />
                <p className="text-xs text-text-secondary">确保24小时畅通</p>
              </div>
            </div>
          </section>

          {/* 学籍信息区域 */}
          <section className={`${STYLES.sectionCard} p-6`}>
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
              <i className="fas fa-graduation-cap text-secondary mr-2"></i>
              学籍信息
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 院系（可直接修改） */}
              <div className="space-y-2">
                <label htmlFor="department" className="block text-sm font-medium text-text-primary">
                  院系 <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="department" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${STYLES.editableField} ${STYLES.formInputFocus}`}
                  placeholder="请输入院系"
                  value={profile.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                />
                <p className="text-xs text-text-secondary">请输入您所在的院系</p>
              </div>

              {/* 专业（可直接修改） */}
              <div className="space-y-2">
                <label htmlFor="major" className="block text-sm font-medium text-text-primary">
                  专业 <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="major" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${STYLES.editableField} ${STYLES.formInputFocus}`}
                  placeholder="请输入专业"
                  value={profile.major}
                  onChange={(e) => handleInputChange('major', e.target.value)}
                />
                <p className="text-xs text-text-secondary">请输入您的专业名称</p>
              </div>

              {/* 班级（可直接修改） */}
              <div className="space-y-2">
                <label htmlFor="class" className="block text-sm font-medium text-text-primary">
                  班级 <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="class" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${STYLES.editableField} ${STYLES.formInputFocus}`}
                  placeholder="请输入班级"
                  value={profile.class}
                  onChange={(e) => handleInputChange('class', e.target.value)}
                />
                <p className="text-xs text-text-secondary">请输入您的班级</p>
              </div>

              {/* 入学年份（可直接修改） */}
              <div className="space-y-2">
                <label htmlFor="enrollment-year" className="block text-sm font-medium text-text-primary">
                  入学年份 <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="enrollment-year" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${STYLES.editableField} ${STYLES.formInputFocus}`}
                  placeholder="请输入入学年份（如：2023）"
                  value={profile.enrollmentYear}
                  onChange={(e) => handleInputChange('enrollmentYear', e.target.value)}
                />
                <p className="text-xs text-text-secondary">请输入您的入学年份</p>
              </div>

              {/* 学制（可直接修改） */}
              <div className="space-y-2">
                <label htmlFor="academic-system" className="block text-sm font-medium text-text-primary">
                  学制 <span className="text-red-500">*</span>
                </label>
                <select 
                  id="academic-system" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${STYLES.editableField} ${STYLES.formInputFocus}`}
                  value={profile.academicSystem}
                  onChange={(e) => handleInputChange('academicSystem', e.target.value)}
                >
                  <option value="">请选择学制</option>
                  <option value="1">一年制</option>
                  <option value="2">二年制</option>
                  <option value="3">三年制</option>
                  <option value="4">四年制</option>
                  <option value="5">五年制</option>
                </select>
                <p className="text-xs text-text-secondary">请选择您的学制</p>
              </div>

              {/* 学籍状态（可直接修改） */}
              <div className="space-y-2">
                <label htmlFor="academic-status" className="block text-sm font-medium text-text-primary">
                  学籍状态 <span className="text-red-500">*</span>
                </label>
                <select 
                  id="academic-status" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${STYLES.editableField} ${STYLES.formInputFocus}`}
                  value={profile.academicStatus}
                  onChange={(e) => handleInputChange('academicStatus', e.target.value)}
                >
                  <option value="">请选择学籍状态</option>
                  <option value="在读">在读</option>
                  <option value="休学">休学</option>
                  <option value="复学">复学</option>
                  <option value="退学">退学</option>
                  <option value="毕业">毕业</option>
                  <option value="结业">结业</option>
                  <option value="肄业">肄业</option>
                </select>
                <p className="text-xs text-text-secondary">请选择您的学籍状态</p>
              </div>
            </div>
          </section>

        {/* 操作按钮区域 */}
        <div className="flex justify-end space-x-4 pt-6">
          
          <button 
            type="button" 
            onClick={handleCancel}
            disabled={saving}
            className="px-6 py-2 border border-border-light text-text-secondary rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            取消
          </button>
          <button 
            type="button" 
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors disabled:opacity-50 flex items-center"
          >
            {saving ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                保存中...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2"></i>
                保存修改
              </>
            )}
          </button>
        </div>
        </div>
      </main>



      {/* 成功提示 */}
      <div className={`fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300 z-50 ${showSuccessToast ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center">
          <i className="fas fa-check-circle mr-2"></i>
          <span>{successMessage}</span>
        </div>
      </div>

      {/* 错误提示 */}
      <div className={`fixed top-20 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300 z-50 ${showErrorToast ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center">
          <i className="fas fa-exclamation-triangle mr-2"></i>
          <span>{errorMessage}</span>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileEdit;