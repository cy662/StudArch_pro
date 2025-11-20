import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { useAuth } from '../../hooks/useAuth';
import useStudentProfile from '../../hooks/useStudentProfile';

const StudentAcademicTasks: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading } = useAuth();
  const { profile: studentProfile } = useStudentProfile(currentUser?.id || '');

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '教学任务与安排 - 学档通';
    return () => { document.title = originalTitle; };
  }, []);

  const handleLogoutClick = () => {
    if (confirm('确定要退出登录吗？')) {
      navigate('/login');
    }
  };

  const handleUserInfoClick = () => {
    navigate('/student-my-profile');
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
                src={studentProfile?.profile_photo || currentUser?.avatar || "https://s.coze.cn/image/DQIklNDlQyw/"} 
                alt="学生头像" 
                className="w-8 h-8 rounded-full object-cover" 
              />
              <div className="text-sm">
                <div className="font-medium text-text-primary">
                  {authLoading ? '加载中...' : (currentUser?.full_name || currentUser?.username || '未知用户')}
                </div>
                <div className="text-text-secondary">
                  {authLoading ? '加载中...' : (currentUser?.class_name || '未知班级')}
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
      <aside className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-border-light ${styles.sidebarTransition} z-40`}>
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
            className={`${styles.navItem} ${styles.navItemActive} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors`}
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
              <h2 className="text-2xl font-bold text-text-primary mb-2">教学任务与安排</h2>
              <nav className="text-sm text-text-secondary">
                <Link to="/student-dashboard" className="hover:text-secondary">首页</Link>
                <span className="mx-2">/</span>
                <span>教学任务与安排</span>
              </nav>
            </div>
            <div className="text-right">
              <div className="text-sm text-text-secondary">今天是</div>
              <div className="text-lg font-medium text-text-primary">2024年1月15日 星期一</div>
            </div>
          </div>
        </div>

        {/* 页面内容占位 */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-card p-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-book text-gray-400 text-3xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-4">教学任务与安排</h3>
              <p className="text-text-secondary mb-6">此页面内容待完善，后续将提供详细的教学任务和课程安排信息。</p>
              <div className="text-sm text-text-secondary">
                <i className="fas fa-info-circle mr-2"></i>
                具体功能正在开发中，请等待后续更新
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentAcademicTasks;