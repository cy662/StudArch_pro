

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserWithRole } from '../../types/user';
import { useAuth } from '../../hooks/useAuth';
import useStudentProfile from '../../hooks/useStudentProfile';
import { RewardPunishmentService } from '../../services/rewardPunishmentService';
import { RewardPunishment } from '../../types/rewardPunishment';
import styles from './styles.module.css';

interface TabType {
  id: string;
  label: string;
  content: string;
}

const StudentMyProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('basic');
  const [loading, setLoading] = useState(true);
  const [rewardsPunishments, setRewardsPunishments] = useState<RewardPunishment[]>([]);
  const [loadingRP, setLoadingRP] = useState(false);

  // 使用useStudentProfile hook获取个人信息
  const { 
    profile: studentProfile, 
    loading: profileLoading, 
    isProfileComplete,
    getCompletionRate 
  } = useStudentProfile(currentUser?.id || '');

  const tabs: TabType[] = [
    { id: 'basic', label: '基本信息', content: 'basic-content' },
    { id: 'academic', label: '学籍信息', content: 'academic-content' },
    { id: 'awards', label: '奖惩信息', content: 'awards-content' },
    { id: 'graduation', label: '毕业去向', content: 'graduation-content' }
  ];

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '我的档案 - 学档通';
    
    // 当个人信息和用户信息加载完成后，设置loading状态
    if (!authLoading && !profileLoading) {
      setLoading(false);
    }
    
    return () => { document.title = originalTitle; };
  }, [authLoading, profileLoading]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleEditProfileClick = () => {
    navigate('/student-profile-edit');
  };

  const handleFillGraduationClick = () => {
    navigate('/student-graduation-fill');
  };

  const handleLogoutClick = () => {
    if (confirm('确定要退出登录吗？')) {
      navigate('/login');
    }
  };

  // 获取奖惩级别的样式类
  const getLevelClass = (level?: string): string => {
    switch (level?.toLowerCase()) {
      case 'national':
        return 'bg-red-100 text-red-800';
      case 'provincial':
        return 'bg-blue-100 text-blue-800';
      case 'school':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 获取奖惩级别的显示文本
  const getLevelText = (level?: string): string => {
    switch (level?.toLowerCase()) {
      case 'national':
        return '国家级';
      case 'provincial':
        return '省级';
      case 'school':
        return '校级';
      default:
        return '其他';
    }
  };

  // 加载奖惩信息
  useEffect(() => {
    const loadRewardPunishments = async () => {
      if (!currentUser?.id || activeTab !== 'awards') return;
      
      try {
        setLoadingRP(true);
        const result = await RewardPunishmentService.getStudentRewardPunishments(currentUser.id);
        setRewardsPunishments(result.items || []);
      } catch (error) {
        console.error('加载奖惩信息失败:', error);
      } finally {
        setLoadingRP(false);
      }
    };

    loadRewardPunishments();
  }, [activeTab, currentUser?.id]);

  const handleUserInfoClick = () => {
    setActiveTab('basic')
  };

  return (
    <div className={styles.pageWrapper}>
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
            <div 
              onClick={handleUserInfoClick}
              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
            >
              <img 
                src={studentProfile?.profile_photo || currentUser?.avatar || "https://s.coze.cn/image/sFgjeSbTJRw/"} 
                alt="学生头像" 
                className="w-8 h-8 rounded-full object-cover" 
              />
              <div className="text-sm">
                <div className="font-medium text-text-primary">
                  {loading ? '加载中...' : (currentUser?.full_name || currentUser?.username || '未知用户')}
                </div>
                <div className="text-text-secondary">
                  {loading ? '加载中...' : (currentUser?.class_name || '未知班级')}
                </div>
              </div>
              <i className="fas fa-chevron-down text-xs text-text-secondary"></i>
            </div>
            
            {/* 退出登录 */}
            <button 
              onClick={handleLogoutClick}
              className="text-text-secondary hover:text-red-500 transition-colors"
            >
              <i className="fas fa-sign-out-alt text-lg"></i>
            </button>
          </div>
        </div>
      </header>

      {/* 左侧菜单 */}
      <aside className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-border-light z-40 ${styles.sidebarTransition}`}>
        <nav className="p-4 space-y-2">
          <Link 
            to="/student-dashboard" 
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-home text-lg"></i>
            <span className="font-medium">学生服务平台</span>
          </Link>
          
          <Link 
            to="/student-my-profile" 
            className={`${styles.navItem} ${styles.navItemActive} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors`}
          >
            <i className="fas fa-user text-lg"></i>
            <span className="font-medium">我的档案</span>
          </Link>
          
          <Link 
            to="/student-profile-edit" 
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-edit text-lg"></i>
            <span className="font-medium">个人信息维护</span>
          </Link>
          
          <Link 
            to="/student-graduation-fill" 
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-rocket text-lg"></i>
            <span className="font-medium">毕业去向填报</span>
          </Link>
          
          <Link 
            to="/student-document-view" 
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-file-alt text-lg"></i>
            <span className="font-medium">信息查看与下载</span>
          </Link>
          
          <Link 
            to="/student-academic-tasks" 
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-book text-lg"></i>
            <span className="font-medium">教学任务与安排</span>
          </Link>
          
          <Link 
            to="/student-profile-analysis" 
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-paint-brush text-lg"></i>
            <span className="font-medium">个人画像分析</span>
          </Link>
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="ml-64 mt-16 p-6 min-h-screen">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">我的档案</h2>
              <nav className="text-sm text-text-secondary">
                <span>首页</span>
                <i className="fas fa-chevron-right mx-2"></i>
                <span>我的档案</span>
              </nav>
            </div>
            <button 
              onClick={handleEditProfileClick}
              className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors"
            >
              <i className="fas fa-edit mr-2"></i>
              编辑信息
            </button>
          </div>
        </div>

        {/* 个人概览卡片 */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center space-x-6">
              <img 
                src={studentProfile?.profile_photo || currentUser?.avatar || "https://s.coze.cn/image/hAFUsHRaPGI/"} 
                alt={loading ? '加载中...' : (currentUser?.full_name || currentUser?.username || '用户') + "头像"} 
                className="w-20 h-20 rounded-full object-cover" 
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-text-primary">
                    {loading ? '加载中...' : (currentUser?.full_name || currentUser?.username || '未知用户')}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      loading ? 'bg-gray-100 text-gray-400' :
                      isProfileComplete() ? 'bg-green-100 text-green-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {loading ? '加载中' : (isProfileComplete() ? '信息完整' : '待完善')}
                    </span>
                    <span className={`text-sm font-medium ${
                      loading ? 'text-gray-400' :
                      getCompletionRate() >= 80 ? 'text-green-600' :
                      getCompletionRate() >= 50 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {loading ? '--' : `${getCompletionRate()}%`}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-text-secondary">学号：</span>
                    <span className="text-text-primary font-medium">
                      {loading ? '加载中...' : (currentUser?.user_number || currentUser?.username || '未知')}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-secondary">班级：</span>
                    <span className="text-text-primary font-medium">
                      {loading ? '加载中...' : (currentUser?.class_name || '未知班级')}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-secondary">学籍状态：</span>
                    <span className={`font-medium ${
                      loading ? 'text-gray-400' :
                      studentProfile?.academic_status === '在读' ? 'text-green-600' :
                      studentProfile?.academic_status === '休学' ? 'text-orange-600' :
                      studentProfile?.academic_status === '复学' ? 'text-blue-600' :
                      studentProfile?.academic_status === '毕业' ? 'text-purple-600' :
                      studentProfile?.academic_status === '退学' || studentProfile?.academic_status === '结业' || studentProfile?.academic_status === '肄业' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {loading ? '加载中...' : (studentProfile?.academic_status || '未知')}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-secondary">入学年份：</span>
                    <span className="text-text-primary font-medium">
                      {loading ? '加载中...' : (currentUser?.grade || '未知')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 档案信息标签页 */}
        <section className="mb-8">
          {/* 标签页导航 */}
          <div className="flex space-x-4 mb-6" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg focus:outline-none ${
                  activeTab === tab.id ? styles.tabActive : styles.tabInactive
                }`}
                role="tab"
                aria-controls={tab.content}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 基本信息 */}
          <div className={`${styles.tabContent} ${activeTab !== 'basic' ? styles.tabContentHidden : ''} bg-white rounded-xl shadow-card p-6`}>
            <h4 className="text-lg font-semibold text-text-primary mb-4">基本信息</h4>
            
            {/* 证件照显示 */}
            <div className="mb-6 flex items-center space-x-6 p-4 bg-gray-50 rounded-lg">
              <div className="w-24 h-32 border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
                {studentProfile?.profile_photo ? (
                  <img 
                    src={studentProfile.profile_photo} 
                    alt="证件照" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <i className="fas fa-camera text-gray-400 text-2xl mb-2"></i>
                      <p className="text-xs text-gray-500">未上传证件照</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h5 className="font-medium text-text-primary mb-2">证件照</h5>
                <p className="text-sm text-gray-600 mb-2">
                  用于身份识别和各类证明材料
                </p>
                {!studentProfile?.profile_photo && (
                  <button 
                    onClick={handleEditProfileClick}
                    className="text-sm text-secondary hover:text-accent transition-colors"
                  >
                    <i className="fas fa-plus-circle mr-1"></i>
                    上传证件照
                  </button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-text-secondary">姓名：</span>
                  <span className="text-text-primary font-medium">
                    {loading ? '加载中...' : (studentProfile?.full_name || currentUser?.full_name || '未知')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">性别：</span>
                  <span className="text-text-primary font-medium">
                    {loading ? '加载中...' : (studentProfile?.gender === 'male' ? '男' : 
                                            studentProfile?.gender === 'female' ? '女' : 
                                            studentProfile?.gender || '未知')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">身份证号：</span>
                  <span className="text-text-primary font-medium">
                    {loading ? '加载中...' : (studentProfile?.id_card || '未知')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">民族：</span>
                  <span className="text-text-primary font-medium">
                    {loading ? '加载中...' : (studentProfile?.nationality || '未知')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">出生日期：</span>
                  <span className="text-text-primary font-medium">
                    {loading ? '加载中...' : (studentProfile?.birth_date || '未知')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">政治面貌：</span>
                  <span className="text-text-primary font-medium">
                    {loading ? '加载中...' : (studentProfile?.political_status || '未知')}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-text-secondary">联系电话：</span>
                  <span className="text-text-primary font-medium">
                    {loading ? '加载中...' : (studentProfile?.phone || currentUser?.phone || '未知')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">电子邮箱：</span>
                  <span className="text-text-primary font-medium">
                    {loading ? '加载中...' : (currentUser?.email || '未知')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">家庭住址：</span>
                  <span className="text-text-primary font-medium">
                    {loading ? '加载中...' : (studentProfile?.home_address || '未知')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">紧急联系人：</span>
                  <span className="text-text-primary font-medium">
                    {loading ? '加载中...' : (studentProfile?.emergency_contact || '未知')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">紧急联系电话：</span>
                  <span className="text-text-primary font-medium">
                    {loading ? '加载中...' : (studentProfile?.emergency_phone || '未知')}
                  </span>
                </div>

              </div>
            </div>
          </div>

          {/* 学籍信息 */}
          <div className={`${styles.tabContent} ${activeTab !== 'academic' ? styles.tabContentHidden : ''} bg-white rounded-xl shadow-card p-6`}>
            <h4 className="text-lg font-semibold text-text-primary mb-4">学籍信息</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-text-secondary">院系：</span>
                  <span className="text-text-primary font-medium">
                    {loading ? '加载中...' : (studentProfile?.department || currentUser?.department || '未知')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">专业：</span>
                  <span className="text-text-primary font-medium">
                    {loading ? '加载中...' : (studentProfile?.major || '未知')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">班级：</span>
                  <span className="text-text-primary font-medium">
                    {loading ? '加载中...' : (studentProfile?.class_info || currentUser?.class_name || '未知')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">入学年份：</span>
                  <span className="text-text-primary font-medium">
                    {loading ? '加载中...' : (studentProfile?.enrollment_year || '未知')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">学制：</span>
                  <span className="text-text-primary font-medium">
                    {loading ? '加载中...' : (studentProfile?.academic_system || '未知')}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-text-secondary">学籍状态：</span>
                  <span className={`font-medium ${
                    loading ? 'text-gray-400' :
                    studentProfile?.academic_status === '在读' ? 'text-green-600' :
                    studentProfile?.academic_status === '休学' ? 'text-orange-600' :
                    studentProfile?.academic_status === '复学' ? 'text-blue-600' :
                    studentProfile?.academic_status === '毕业' ? 'text-purple-600' :
                    studentProfile?.academic_status === '退学' || studentProfile?.academic_status === '结业' || studentProfile?.academic_status === '肄业' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {loading ? '加载中...' : (studentProfile?.academic_status || '未知')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">学生类型：</span>
                  <span className="text-text-primary font-medium">
                    {loading ? '加载中...' : (studentProfile?.student_type || '未知')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">入学日期：</span>
                  <span className="text-text-primary font-medium">
                    {loading ? '加载中...' : (studentProfile?.admission_date || '未知')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">预计毕业日期：</span>
                  <span className="text-text-primary font-medium">
                    {loading ? '加载中...' : (studentProfile?.graduation_date || '未知')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">编辑次数：</span>
                  <span className="text-text-primary font-medium">
                    {loading ? '加载中...' : (studentProfile?.edit_count || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>



          {/* 奖惩信息 */}
          <div className={`${styles.tabContent} ${activeTab !== 'awards' ? styles.tabContentHidden : ''} bg-white rounded-xl shadow-card p-6`}>
            <h4 className="text-lg font-semibold text-text-primary mb-4">奖惩信息</h4>
            {loadingRP ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mb-4"></div>
                <p className="text-text-secondary">加载奖惩信息中...</p>
              </div>
            ) : rewardsPunishments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-clipboard-list text-gray-400 text-2xl"></i>
                </div>
                <p className="text-text-secondary">暂无奖惩信息记录</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rewardsPunishments.map((item) => (
                  <div key={item.id} className={`flex items-start space-x-4 p-4 ${item.type === 'reward' ? 'bg-green-50' : 'bg-red-50'} rounded-lg`}>
                    <div className={`w-10 h-10 ${item.type === 'reward' ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <i className={`fas ${item.type === 'reward' ? 'fa-trophy text-green-600' : 'fa-exclamation-triangle text-red-600'}`}></i>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-text-primary">{item.name}</h5>
                      <p className="text-sm text-text-secondary mt-1">{item.description}</p>
                      <div className="flex items-center mt-1 space-x-4">
                        <p className="text-xs text-text-secondary">{item.date}</p>
                        {item.level && (
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getLevelClass(item.level)}`}>
                            {getLevelText(item.level)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>



          {/* 毕业去向 */}
          <div className={`${styles.tabContent} ${activeTab !== 'graduation' ? styles.tabContentHidden : ''} bg-white rounded-xl shadow-card p-6`}>
            <h4 className="text-lg font-semibold text-text-primary mb-4">毕业去向</h4>
            <div className="space-y-6">
              {/* 当前状态 */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <i className="fas fa-info-circle text-blue-600"></i>
                  <span className="font-medium text-text-primary">当前状态</span>
                </div>
                <p className="text-sm text-text-secondary">尚未填报毕业去向，请及时完成毕业去向填报</p>
                <button 
                  onClick={handleFillGraduationClick}
                  className="mt-3 px-4 py-2 bg-secondary text-white text-sm rounded-lg hover:bg-accent transition-colors"
                >
                  立即填报
                </button>
              </div>

              {/* 填报说明 */}
              <div className="border border-border-light rounded-lg p-4">
                <h5 className="font-medium text-text-primary mb-3">填报说明</h5>
                <div className="space-y-2 text-sm text-text-secondary">
                  <div className="flex items-start space-x-2">
                    <i className="fas fa-check-circle text-green-600 mt-1"></i>
                    <span>请根据实际情况选择去向类型：就业、升学、创业、出国、待业等</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <i className="fas fa-check-circle text-green-600 mt-1"></i>
                    <span>需上传相关证明材料，如就业协议、录取通知书等</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <i className="fas fa-check-circle text-green-600 mt-1"></i>
                    <span>填报信息需经辅导员审核通过后方可生效</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentMyProfile;

