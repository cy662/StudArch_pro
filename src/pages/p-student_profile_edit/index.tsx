import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import StudentProfileService from '../../services/studentProfileService';
import useStudentProfile from '../../hooks/useStudentProfile';
import { StudentProfile, StudentProfileFormData as StudentProfileDBFormData, UserWithRole } from '../../types/user';

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
  emergencyContactName: string;
  emergencyContactPhone: string;
  department: string;
  major: string;
  class: string;
  enrollmentYear: string;
  academicSystem: string;
  academicStatus: string;
}

interface ChangeApplication {
  fieldName: string;
  fieldId: string;
  currentValue: string;
  newValue: string;
  reason: string;
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
        emergencyContactName: studentProfile?.emergency_contact || '',
        emergencyContactPhone: studentProfile?.emergency_phone || '',
        department: currentUser?.department || '',
        major: '',
        class: currentUser?.class_name || '',
        enrollmentYear: currentUser?.grade || '',
        academicSystem: '',
        academicStatus: studentProfile?.profile_status === 'approved' ? '在读' : '未完成'
      };
      
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
    emergencyContactName: '',
    emergencyContactPhone: '',
    department: '',
    major: '',
    class: '',
    enrollmentYear: '',
    academicSystem: '',
    academicStatus: '未完成'
  });

  // 弹窗状态
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [changeApplication, setChangeApplication] = useState<ChangeApplication>({
    fieldName: '',
    fieldId: '',
    currentValue: '',
    newValue: '',
    reason: ''
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

  // 获取性别显示文本
  const getGenderDisplayText = (gender: 'male' | 'female' | 'other') => {
    switch (gender) {
      case 'male': return '男';
      case 'female': return '女';
      case 'other': return '其他';
      default: return '未知';
    }
  };

  // 打开修改申请弹窗
  const openChangeModal = (fieldName: string, fieldId: keyof StudentProfileFormData) => {
    setChangeApplication({
      fieldName,
      fieldId: fieldId,
      currentValue: profile[fieldId],
      newValue: '',
      reason: ''
    });
    setShowChangeModal(true);
  };

  // 关闭弹窗
  const closeChangeModal = () => {
    setShowChangeModal(false);
    setChangeApplication({
      fieldName: '',
      fieldId: '',
      currentValue: '',
      newValue: '',
      reason: ''
    });
  };

  // 提交修改申请
  const submitChangeApplication = () => {
    const { newValue, reason } = changeApplication;
    
    if (!newValue.trim()) {
      showErrorMessage('请输入新值');
      return;
    }
    
    if (!reason.trim()) {
      showErrorMessage('请说明修改原因');
      return;
    }
    
    // 模拟提交申请
    closeChangeModal();
    showSuccessMessage('修改申请已提交，请等待辅导员审核');
  };

  // 保存修改到数据库
  const handleSave = async () => {
    // 表单验证
    if (!profile.contactPhone.trim()) {
      showErrorMessage('请填写联系电话');
      return;
    }
    
    if (!profile.email.trim()) {
      showErrorMessage('请填写电子邮箱');
      return;
    }
    
    if (!/^1[3-9]\d{9}$/.test(profile.contactPhone)) {
      showErrorMessage('请输入正确的手机号码格式');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      showErrorMessage('请输入正确的邮箱格式');
      return;
    }
    
    if (!profile.emergencyContactPhone.trim() || !/^1[3-9]\d{9}$/.test(profile.emergencyContactPhone)) {
      showErrorMessage('请输入正确的紧急联系人手机号码');
      return;
    }

    setSaving(true);
    
    try {
      if (!currentUser?.id) {
        throw new Error('用户信息获取失败，请重新登录');
      }

      console.log('开始保存个人信息，用户ID:', currentUser.id);
      console.log('表单数据:', profile);

      // 转换表单数据为数据库格式
      const profileData: StudentProfileDBFormData = {
        gender: profile.studentGender,
        birth_date: profile.birthDate || undefined,
        id_card: profile.idCard || undefined,
        nationality: profile.ethnicity || undefined,
        political_status: profile.politicalStatus || undefined,
        phone: profile.contactPhone,
        emergency_contact: profile.emergencyContactName || undefined,
        emergency_phone: profile.emergencyContactPhone,
        home_address: profile.homeAddress || undefined,
        admission_date: profile.enrollmentYear ? `${profile.enrollmentYear}-09-01` : undefined,
        graduation_date: profile.enrollmentYear ? `${parseInt(profile.enrollmentYear) + 4}-06-30` : undefined,
        student_type: '全日制'
      };

      console.log('转换后的数据库数据:', profileData);

      // 保存到数据库
      const result = await StudentProfileService.createOrUpdateStudentProfile(currentUser.id, profileData);
      console.log('保存成功，返回结果:', result);
      
      // 添加延迟确保数据库更新完成
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 强制刷新个人资料 - 使用更激进的刷新策略
      await refreshStudentProfile();
      await refreshProfile();
      
      // 使用新的查询重新获取最新数据
      const latestProfile = await StudentProfileService.getStudentProfile(currentUser.id);
      console.log('保存后最新数据:', latestProfile);
      
      // 检查数据是否真正同步
      if (latestProfile) {
        const isSynced = 
          latestProfile.phone === profileData.phone &&
          latestProfile.emergency_phone === profileData.emergency_phone &&
          latestProfile.home_address === profileData.home_address;
        
        if (isSynced) {
          showSuccessMessage('个人信息保存成功！数据已实时同步到档案中。');
        } else {
          showSuccessMessage('个人信息保存成功！数据正在同步中，请稍后刷新页面查看。');
        }
      } else {
        showSuccessMessage('个人信息保存成功！');
      }
    } catch (error) {
      console.error('保存个人信息失败:', error);
      
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
        emergencyContactName: studentProfile?.emergency_contact || '',
        emergencyContactPhone: studentProfile?.emergency_phone || '',
        department: currentUser?.department || '',
        major: '',
        class: currentUser?.class_name || '',
        enrollmentYear: currentUser?.grade || '',
        academicSystem: '',
        academicStatus: studentProfile?.profile_status === 'approved' ? '在读' : '未完成'
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

  // 点击弹窗背景关闭
  const handleModalBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeChangeModal();
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
            {/* 消息通知 */}
            <button className="relative p-2 text-text-secondary hover:text-secondary transition-colors">
              <i className="fas fa-bell text-lg"></i>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">1</span>
            </button>
            
            {/* 用户信息 */}
            <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors">
              <img 
                src={currentUser?.avatar || "https://s.coze.cn/image/K2rLqrUfOSs/"} 
                alt={loading ? '加载中...' : (currentUser?.full_name || currentUser?.username || '用户') + "头像"} 
                className="w-8 h-8 rounded-full" 
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
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="ml-64 mt-16 p-6 min-h-screen">
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
              {studentProfile && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  studentProfile.profile_status === 'approved' 
                    ? 'bg-green-100 text-green-800' 
                    : studentProfile.profile_status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {studentProfile.profile_status === 'approved' ? '已审核' : 
                   studentProfile.profile_status === 'pending' ? '待审核' : '未完善'}
                </span>
              )}
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

              {/* 姓名（需申请修改） */}
              <div className="space-y-2">
                <label htmlFor="student-name" className="block text-sm font-medium text-text-primary">姓名</label>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    id="student-name" 
                    className={`flex-1 px-4 py-2 border border-border-light rounded-lg ${STYLES.readonlyField}`}
                    value={profile.studentName} 
                    readOnly 
                  />
                  <button 
                    type="button" 
                    onClick={() => openChangeModal('姓名', 'studentName')}
                    className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors text-sm"
                  >
                    申请修改
                  </button>
                </div>
                <p className="text-xs text-text-secondary">姓名修改需辅导员审核</p>
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

              {/* 身份证号（需申请修改） */}
              <div className="space-y-2">
                <label htmlFor="id-card" className="block text-sm font-medium text-text-primary">身份证号</label>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    id="id-card" 
                    className={`flex-1 px-4 py-2 border border-border-light rounded-lg ${STYLES.readonlyField}`}
                    value={profile.idCard} 
                    readOnly 
                  />
                  <button 
                    type="button" 
                    onClick={() => openChangeModal('身份证号', 'idCard')}
                    className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors text-sm"
                  >
                    申请修改
                  </button>
                </div>
                <p className="text-xs text-text-secondary">身份证号修改需辅导员审核</p>
              </div>

              {/* 民族（可直接修改） */}
              <div className="space-y-2">
                <label htmlFor="ethnicity" className="block text-sm font-medium text-text-primary">民族</label>
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
                <label htmlFor="birth-date" className="block text-sm font-medium text-text-primary">出生日期</label>
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
                <label htmlFor="contact-phone" className="block text-sm font-medium text-text-primary">联系电话</label>
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
                <label htmlFor="email" className="block text-sm font-medium text-text-primary">电子邮箱</label>
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
              {/* 紧急联系人姓名（可直接修改） */}
              <div className="space-y-2">
                <label htmlFor="emergency-contact-name" className="block text-sm font-medium text-text-primary">联系人姓名</label>
                <input 
                  type="text" 
                  id="emergency-contact-name" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${STYLES.editableField} ${STYLES.formInputFocus}`}
                  placeholder="请输入联系人姓名"
                  value={profile.emergencyContactName}
                  onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                />
                <p className="text-xs text-text-secondary">建议填写直系亲属</p>
              </div>

              {/* 紧急联系人电话（可直接修改） */}
              <div className="space-y-2">
                <label htmlFor="emergency-contact-phone" className="block text-sm font-medium text-text-primary">联系人电话</label>
                <input 
                  type="tel" 
                  id="emergency-contact-phone" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${STYLES.editableField} ${STYLES.formInputFocus}`}
                  placeholder="请输入联系人手机号码"
                  value={profile.emergencyContactPhone}
                  onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
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
              {/* 院系（不可修改） */}
              <div className="space-y-2">
                <label htmlFor="department" className="block text-sm font-medium text-text-primary">院系</label>
                <input 
                  type="text" 
                  id="department" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${STYLES.readonlyField}`}
                  value={profile.department} 
                  readOnly 
                />
                <p className="text-xs text-text-secondary">院系信息不可修改</p>
              </div>

              {/* 专业（不可修改） */}
              <div className="space-y-2">
                <label htmlFor="major" className="block text-sm font-medium text-text-primary">专业</label>
                <input 
                  type="text" 
                  id="major" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${STYLES.readonlyField}`}
                  value={profile.major} 
                  readOnly 
                />
                <p className="text-xs text-text-secondary">专业信息不可修改</p>
              </div>

              {/* 班级（不可修改） */}
              <div className="space-y-2">
                <label htmlFor="class" className="block text-sm font-medium text-text-primary">班级</label>
                <input 
                  type="text" 
                  id="class" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${STYLES.readonlyField}`}
                  value={profile.class} 
                  readOnly 
                />
                <p className="text-xs text-text-secondary">班级信息不可修改</p>
              </div>

              {/* 入学年份（不可修改） */}
              <div className="space-y-2">
                <label htmlFor="enrollment-year" className="block text-sm font-medium text-text-primary">入学年份</label>
                <input 
                  type="text" 
                  id="enrollment-year" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${STYLES.readonlyField}`}
                  value={profile.enrollmentYear} 
                  readOnly 
                />
                <p className="text-xs text-text-secondary">入学年份不可修改</p>
              </div>

              {/* 学制（不可修改） */}
              <div className="space-y-2">
                <label htmlFor="academic-system" className="block text-sm font-medium text-text-primary">学制</label>
                <input 
                  type="text" 
                  id="academic-system" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${STYLES.readonlyField}`}
                  value={profile.academicSystem} 
                  readOnly 
                />
                <p className="text-xs text-text-secondary">学制信息不可修改</p>
              </div>

              {/* 学籍状态（不可修改） */}
              <div className="space-y-2">
                <label htmlFor="academic-status" className="block text-sm font-medium text-text-primary">学籍状态</label>
                <input 
                  type="text" 
                  id="academic-status" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${STYLES.readonlyField}`}
                  value={profile.academicStatus} 
                  readOnly 
                />
                <p className="text-xs text-text-secondary">学籍状态由学校统一管理</p>
              </div>
            </div>
          </section>

        {/* 操作按钮区域 */}
        <div className="flex justify-end space-x-4 pt-6">
          {/* 调试按钮（仅开发环境显示） */}
          {process.env.NODE_ENV === 'development' && (
            <button 
              type="button" 
              onClick={() => {
                console.log('当前表单数据:', profile);
                console.log('当前用户信息:', currentUser);
                console.log('学生个人信息:', studentProfile);
                showSuccessMessage('调试信息已输出到控制台');
              }}
              className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              调试信息
            </button>
          )}
          
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

      {/* 申请修改弹窗 */}
      {showChangeModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={handleModalBackgroundClick}
        >
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">申请信息修改</h3>
                <button 
                  type="button" 
                  onClick={closeChangeModal}
                  className="text-text-secondary hover:text-text-primary"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="change-field" className="block text-sm font-medium text-text-primary mb-2">修改字段</label>
                  <input 
                    type="text" 
                    id="change-field" 
                    className="w-full px-4 py-2 border border-border-light rounded-lg" 
                    value={changeApplication.fieldName}
                    readOnly 
                  />
                </div>
                
                <div>
                  <label htmlFor="current-value" className="block text-sm font-medium text-text-primary mb-2">当前值</label>
                  <input 
                    type="text" 
                    id="current-value" 
                    className="w-full px-4 py-2 border border-border-light rounded-lg" 
                    value={changeApplication.currentValue}
                    readOnly 
                  />
                </div>
                
                <div>
                  <label htmlFor="new-value" className="block text-sm font-medium text-text-primary mb-2">新值</label>
                  <input 
                    type="text" 
                    id="new-value" 
                    className={`w-full px-4 py-2 border border-border-light rounded-lg ${STYLES.formInputFocus}`}
                    placeholder="请输入新值"
                    value={changeApplication.newValue}
                    onChange={(e) => setChangeApplication(prev => ({ ...prev, newValue: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label htmlFor="change-reason" className="block text-sm font-medium text-text-primary mb-2">修改原因</label>
                  <textarea 
                    id="change-reason" 
                    rows={3}
                    className={`w-full px-4 py-2 border border-border-light rounded-lg ${STYLES.formInputFocus} resize-none`}
                    placeholder="请说明修改原因"
                    value={changeApplication.reason}
                    onChange={(e) => setChangeApplication(prev => ({ ...prev, reason: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button" 
                  onClick={closeChangeModal}
                  className="px-4 py-2 border border-border-light text-text-secondary rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button 
                  type="button" 
                  onClick={submitChangeApplication}
                  className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors"
                >
                  提交申请
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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