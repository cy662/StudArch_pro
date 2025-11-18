

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { UserWithRole } from '../../types/user';
import { useAuth } from '../../hooks/useAuth';
import useStudentProfile from '../../hooks/useStudentProfile';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading, needsProfileCompletion, clearProfileCompletionReminder } = useAuth();
  const [showProfileReminder, setShowProfileReminder] = useState(false);
  const [loading, setLoading] = useState(true);

  // 使用useStudentProfile hook获取个人信息状态
  const { 
    profile, 
    loading: profileLoading, 
    getCompletionRate,
    isProfileComplete 
  } = useStudentProfile(currentUser?.id || '');

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '学生服务平台 - 学档通';
    
    // 检查是否需要显示个人信息完成提醒
    if (needsProfileCompletion()) {
      setShowProfileReminder(true);
    }
    
    setLoading(false);
    
    return () => { document.title = originalTitle; };
  }, [needsProfileCompletion]);

  // 处理关闭提醒
  const handleCloseReminder = () => {
    setShowProfileReminder(false);
    clearProfileCompletionReminder();
  };

  // 立即填写个人信息
  const handleFillProfile = () => {
    handleCloseReminder();
    navigate('/student-profile-edit');
  };



  const handleLogoutClick = () => {
    if (confirm('确定要退出登录吗？')) {
      navigate('/login');
    }
  };

  const handleActivityClick = () => {
    navigate('/student-profile-edit');
  };

  const handleQuickActionClick = (path: string) => {
    navigate(path);
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
            <Link 
              to="/student-my-profile"
              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
            >
              <img 
                src="https://s.coze.cn/image/DQIklNDlQyw/" 
                alt="学生头像" 
                className="w-8 h-8 rounded-full" 
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
            </Link>
            
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
      <aside className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-border-light ${styles.sidebarTransition} z-40`}>
        <nav className="p-4 space-y-2">
          <Link 
            to="/student-dashboard" 
            className={`${styles.navItem} ${styles.navItemActive} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors`}
          >
            <i className="fas fa-home text-lg"></i>
            <span className="font-medium">学生服务平台</span>
          </Link>
          
          <Link 
            to="/student-my-profile" 
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
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
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="ml-64 mt-16 p-6 min-h-screen">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                欢迎回来，{loading ? '加载中...' : (currentUser?.full_name || currentUser?.username || '同学')}同学
              </h2>
              <nav className="text-sm text-text-secondary">
                <span>首页</span>
              </nav>
            </div>
            <div className="text-right">
              <div className="text-sm text-text-secondary">今天是</div>
              <div className="text-lg font-medium text-text-primary">{new Date().toLocaleDateString('zh-CN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}</div>
            </div>
          </div>
        </div>

        {/* 个人信息完成提醒 */}
        {showProfileReminder && (
          <section className="mb-6">
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-l-4 border-orange-500 p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-user-edit text-orange-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-orange-900">首次登录提醒</h3>
                    <p className="text-orange-700 mt-1">
                      检测到您是首次登录系统，请及时完善个人信息以使用完整功能。
                    </p>
                    <p className="text-sm text-orange-600 mt-2">
                      个人信息完成度：
                      <span className="font-bold ml-2">
                        {profileLoading ? '加载中...' : `${getCompletionRate()}%`}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={handleCloseReminder}
                    className="px-4 py-2 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors"
                  >
                    稍后再说
                  </button>
                  <button 
                    onClick={handleFillProfile}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    立即填写
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 数据概览区 */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">个人概览</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 个人信息完成度 */}
            <div className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm mb-1">个人信息完成度</p>
                  <p className={`text-3xl font-bold ${
                    getCompletionRate() >= 80 ? 'text-green-600' : 
                    getCompletionRate() >= 50 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {profileLoading ? '--' : `${getCompletionRate()}%`}
                  </p>
                  <p className="text-text-secondary text-sm mt-1">
                    {profileLoading ? '加载中...' : 
                     isProfileComplete() ? '已完成' : '需完善'}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  getCompletionRate() >= 80 ? 'bg-gradient-to-br from-green-400 to-green-600' : 
                  getCompletionRate() >= 50 ? 'bg-gradient-to-br from-orange-400 to-orange-600' : 
                  'bg-gradient-to-br from-red-400 to-red-600'
                }`}>
                  <i className="fas fa-user-check text-white text-xl"></i>
                </div>
              </div>
            </div>

            {/* 学籍状态 */}
            <div className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm mb-1">学籍状态</p>
                  <p className="text-xl font-bold text-green-600">在读</p>
                  <p className="text-text-secondary text-sm mt-1">
                    {loading ? '加载中...' : (currentUser?.class_name || '未知班级')}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-user-graduate text-white text-xl"></i>
                </div>
              </div>
            </div>



            {/* 平均绩点 */}
            <div className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm mb-1">平均绩点</p>
                  <p className="text-3xl font-bold text-secondary">3.75</p>
                  <p className="text-text-secondary text-sm mt-1">排名：前15%</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
                  <i className="fas fa-star text-white text-xl"></i>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 最新动态 */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">最新动态</h3>
            <Link 
              to="/student-my-profile" 
              className="text-secondary hover:text-accent font-medium transition-colors"
            >
              查看全部 <i className="fas fa-arrow-right ml-1"></i>
            </Link>
          </div>
          
          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="space-y-4">
              {/* 动态项目1 */}
              <div 
                onClick={handleActivityClick}
                className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-edit text-green-600"></i>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-text-primary">联系方式修改申请</h4>
                    <span className="text-sm text-orange-600">待审核</span>
                  </div>
                  <p className="text-sm text-text-secondary mt-1">您于2024年1月14日提交了手机号码修改申请，正在等待辅导员审核</p>
                  <p className="text-xs text-text-secondary mt-2">2小时前</p>
                </div>
              </div>

              {/* 动态项目2 */}
              <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-graduation-cap text-blue-600"></i>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-text-primary">期末考试成绩公布</h4>
                    <span className="text-sm text-green-600">已完成</span>
                  </div>
                  <p className="text-sm text-text-secondary mt-1">《数据结构》课程成绩已公布，您的成绩为85分，绩点3.5</p>
                  <p className="text-xs text-text-secondary mt-2">1天前</p>
                </div>
              </div>

              {/* 动态项目3 */}
              <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-certificate text-purple-600"></i>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-text-primary">获得校级奖学金</h4>
                    <span className="text-sm text-green-600">已完成</span>
                  </div>
                  <p className="text-sm text-text-secondary mt-1">恭喜您获得2023-2024学年校级二等奖学金</p>
                  <p className="text-xs text-text-secondary mt-2">3天前</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 快捷操作区 */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">快捷操作</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 查看档案 */}
            <div 
              onClick={() => handleQuickActionClick('/student-my-profile')}
              className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300 cursor-pointer`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
                  <i className="fas fa-user text-white text-xl"></i>
                </div>
                <div>
                  <h4 className="font-medium text-text-primary">查看档案</h4>
                  <p className="text-sm text-text-secondary">查看个人完整档案信息</p>
                </div>
              </div>
            </div>

            {/* 修改信息 */}
            <div 
              onClick={() => handleQuickActionClick('/student-profile-edit')}
              className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300 cursor-pointer`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-edit text-white text-xl"></i>
                </div>
                <div>
                  <h4 className="font-medium text-text-primary">修改信息</h4>
                  <p className="text-sm text-text-secondary">更新个人联系方式等信息</p>
                </div>
              </div>
            </div>

            {/* 填报去向 */}
            <div 
              onClick={() => handleQuickActionClick('/student-graduation-fill')}
              className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300 cursor-pointer`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-rocket text-white text-xl"></i>
                </div>
                <div>
                  <h4 className="font-medium text-text-primary">填报去向</h4>
                  <p className="text-sm text-text-secondary">提交毕业去向信息</p>
                </div>
              </div>
            </div>

            {/* 下载证明 */}
            <div 
              onClick={() => handleQuickActionClick('/student-document-view')}
              className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300 cursor-pointer`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-download text-white text-xl"></i>
                </div>
                <div>
                  <h4 className="font-medium text-text-primary">下载证明</h4>
                  <p className="text-sm text-text-secondary">获取成绩单、在校证明等</p>
                </div>
              </div>
            </div>
          </div>
        </section>


      </main>
    </div>
  );
};

export default StudentDashboard;

