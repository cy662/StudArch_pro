

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { UserWithRole } from '../../types/user';
import UserService from '../../services/userService';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const loadUserInfo = () => {
      try {
        const userInfo = localStorage.getItem('user_info');
        if (userInfo) {
          const userData = JSON.parse(userInfo);
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error('加载用户信息失败:', error);
      } finally {
        setLoading(false);
      }
    };

    const originalTitle = document.title;
    document.title = '超级管理平台 - 学档通';
    
    loadUserInfo();
    loadDashboardStats();
    
    return () => { document.title = originalTitle; };
  }, []);



  const handleUserInfoClick = () => {
    alert(`超级管理员信息：
用户名：admin
角色：超级管理员
最后登录：2024-01-15 08:30`);
  };

  const handleLogoutClick = () => {
    if (confirm('确定要退出登录吗？')) {
      navigate('/login');
    }
  };

  const handleQuickActionClick = (path: string) => {
    navigate(path);
  };

  // 加载统计数据
  const loadDashboardStats = async () => {
    try {
      setStatsLoading(true);
      const stats = await UserService.getDashboardStats();
      setStatsData(stats);
    } catch (error) {
      console.error('加载统计数据失败:', error);
      // 如果获取失败，使用默认数据
      setStatsData({
        total_users: 1248,
        total_students: 1126,
        total_teachers: 122,
        user_growth_rate: 12.3,
        student_growth_rate: 8.5,
        teacher_growth_rate: 3.2
      });
    } finally {
      setStatsLoading(false);
    }
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
                src="https://s.coze.cn/image/-3sTA4qR9pY/" 
                alt="超级管理员头像" 
                className="w-8 h-8 rounded-full" 
              />
              <div className="text-sm">
                <div className="font-medium text-text-primary">
                  {loading ? '加载中...' : (currentUser?.full_name || currentUser?.username || '未知管理员')}
                </div>
                <div className="text-text-secondary">
                  {loading ? '加载中...' : (currentUser?.role_name || '超级管理员')}
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
            to="/admin-dashboard" 
            className={`${styles.navItem} ${styles.navItemActive} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors`}
          >
            <i className="fas fa-home text-lg"></i>
            <span className="font-medium">超级管理平台</span>
          </Link>
          
          <Link 
            to="/admin-user-management" 
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-users-cog text-lg"></i>
            <span className="font-medium">用户管理</span>
          </Link>
          
          <Link 
            to="/admin-role-permission" 
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-user-shield text-lg"></i>
            <span className="font-medium">角色权限管理</span>
          </Link>
          
          <Link 
            to="/admin-system-settings" 
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-cog text-lg"></i>
            <span className="font-medium">系统设置</span>
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
                欢迎回来，{loading ? '加载中...' : (currentUser?.full_name || currentUser?.username || '管理员')}
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

        {/* 数据概览区 */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">系统概览</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 用户总数 */}
            <div className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm mb-1">用户总数</p>
                  <p className="text-3xl font-bold text-text-primary">
                    {statsLoading ? '...' : (statsData?.total_users || 0).toLocaleString()}
                  </p>
                  <p className="text-secondary text-sm mt-1">
                    <i className="fas fa-arrow-up mr-1"></i>
                    较上月 +{statsLoading ? '...' : (statsData?.user_growth_rate || 0)}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
                  <i className="fas fa-users text-white text-xl"></i>
                </div>
              </div>
            </div>

            {/* 学生总数 */}
            <div className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm mb-1">学生总数</p>
                  <p className="text-3xl font-bold text-text-primary">
                    {statsLoading ? '...' : (statsData?.total_students || 0).toLocaleString()}
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    <i className="fas fa-arrow-up mr-1"></i>
                    较上月 +{statsLoading ? '...' : (statsData?.student_growth_rate || 0)}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-user-graduate text-white text-xl"></i>
                </div>
              </div>
            </div>

            {/* 教师总数 */}
            <div className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm mb-1">教师总数</p>
                  <p className="text-3xl font-bold text-text-primary">
                    {statsLoading ? '...' : (statsData?.total_teachers || 0).toLocaleString()}
                  </p>
                  <p className="text-blue-600 text-sm mt-1">
                    <i className="fas fa-arrow-up mr-1"></i>
                    较上月 +{statsLoading ? '...' : (statsData?.teacher_growth_rate || 0)}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-chalkboard-teacher text-white text-xl"></i>
                </div>
              </div>
            </div>


          </div>
        </section>



        {/* 快捷操作区 */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">快捷操作</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 用户管理 */}
            <div 
              onClick={() => handleQuickActionClick('/admin-user-management')}
              className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300 cursor-pointer`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
                  <i className="fas fa-users-cog text-white text-xl"></i>
                </div>
                <div>
                  <h4 className="font-medium text-text-primary">用户管理</h4>
                  <p className="text-sm text-text-secondary">管理学生和教师账号</p>
                </div>
              </div>
            </div>

            {/* 角色权限配置 */}
            <div 
              onClick={() => handleQuickActionClick('/admin-role-permission')}
              className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300 cursor-pointer`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-user-shield text-white text-xl"></i>
                </div>
                <div>
                  <h4 className="font-medium text-text-primary">角色权限配置</h4>
                  <p className="text-sm text-text-secondary">配置用户角色和权限</p>
                </div>
              </div>
            </div>

            {/* 系统设置 */}
            <div 
              onClick={() => handleQuickActionClick('/admin-system-settings')}
              className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300 cursor-pointer`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-cog text-white text-xl"></i>
                </div>
                <div>
                  <h4 className="font-medium text-text-primary">系统设置</h4>
                  <p className="text-sm text-text-secondary">系统状态和备份管理</p>
                </div>
              </div>
            </div>


          </div>
        </section>


      </main>
    </div>
  );
};

export default AdminDashboard;

