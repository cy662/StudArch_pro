

import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '超级管理平台 - 学档通';
    return () => { document.title = originalTitle; };
  }, []);

  const handleNotificationClick = () => {
    alert('您有2条新通知：\n1. 系统将于今晚23:00进行例行维护\n2. 有3个用户申请了权限变更');
  };

  const handleUserInfoClick = () => {
    alert('超级管理员信息：\n用户名：admin\n角色：超级管理员\n最后登录：2024-01-15 08:30');
  };

  const handleLogoutClick = () => {
    if (confirm('确定要退出登录吗？')) {
      navigate('/login');
    }
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
            {/* 消息通知 */}
            <button 
              onClick={handleNotificationClick}
              className="relative p-2 text-text-secondary hover:text-secondary transition-colors"
            >
              <i className="fas fa-bell text-lg"></i>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">2</span>
            </button>
            
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
                <div className="font-medium text-text-primary">管理员</div>
                <div className="text-text-secondary">超级管理员</div>
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
          
          <Link 
            to="/admin-operation-log" 
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-clipboard-list text-lg"></i>
            <span className="font-medium">操作日志审计</span>
          </Link>
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="ml-64 mt-16 p-6 min-h-screen">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">欢迎回来，管理员</h2>
              <nav className="text-sm text-text-secondary">
                <span>首页</span>
              </nav>
            </div>
            <div className="text-right">
              <div className="text-sm text-text-secondary">今天是</div>
              <div className="text-lg font-medium text-text-primary">2024年1月15日 星期一</div>
            </div>
          </div>
        </div>

        {/* 数据概览区 */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">系统概览</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 用户总数 */}
            <div className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm mb-1">用户总数</p>
                  <p className="text-3xl font-bold text-text-primary">1,248</p>
                  <p className="text-secondary text-sm mt-1">
                    <i className="fas fa-arrow-up mr-1"></i>
                    较上月 +12%
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
                  <p className="text-3xl font-bold text-text-primary">1,126</p>
                  <p className="text-green-600 text-sm mt-1">
                    <i className="fas fa-arrow-up mr-1"></i>
                    较上月 +8%
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
                  <p className="text-3xl font-bold text-text-primary">122</p>
                  <p className="text-blue-600 text-sm mt-1">
                    <i className="fas fa-arrow-up mr-1"></i>
                    较上月 +3%
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-chalkboard-teacher text-white text-xl"></i>
                </div>
              </div>
            </div>

            {/* 系统状态 */}
            <div className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm mb-1">系统状态</p>
                  <p className="text-3xl font-bold text-green-600">正常</p>
                  <p className="text-green-600 text-sm mt-1">
                    <i className="fas fa-check-circle mr-1"></i>
                    运行稳定
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-server text-white text-xl"></i>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 系统状态概览 */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">系统状态</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 系统运行状态 */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-text-primary">运行状态</h4>
                <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                  <i className="fas fa-circle mr-1"></i>
                  正常运行
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">CPU使用率</span>
                  <span className="text-text-primary font-medium">23%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">内存使用率</span>
                  <span className="text-text-primary font-medium">45%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">磁盘空间</span>
                  <span className="text-text-primary font-medium">67% 已使用</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">在线用户</span>
                  <span className="text-text-primary font-medium">89人</span>
                </div>
              </div>
            </div>

            {/* 最近操作 */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-text-primary">最近操作</h4>
                <Link 
                  to="/admin-operation-log" 
                  className="text-secondary hover:text-accent text-sm font-medium transition-colors"
                >
                  查看全部 <i className="fas fa-arrow-right ml-1"></i>
                </Link>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-text-secondary">张老师</span>
                  <span className="text-text-primary">批量导入了学生成绩</span>
                  <span className="text-text-secondary ml-auto">2分钟前</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-text-secondary">李小明</span>
                  <span className="text-text-primary">更新了个人联系方式</span>
                  <span className="text-text-secondary ml-auto">5分钟前</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-text-secondary">王小红</span>
                  <span className="text-text-primary">提交了毕业去向申请</span>
                  <span className="text-text-secondary ml-auto">10分钟前</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-text-secondary">管理员</span>
                  <span className="text-text-primary">创建了新的教师账号</span>
                  <span className="text-text-secondary ml-auto">15分钟前</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 快捷操作区 */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">快捷操作</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            {/* 操作日志 */}
            <div 
              onClick={() => handleQuickActionClick('/admin-operation-log')}
              className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300 cursor-pointer`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-clipboard-list text-white text-xl"></i>
                </div>
                <div>
                  <h4 className="font-medium text-text-primary">操作日志审计</h4>
                  <p className="text-sm text-text-secondary">查看系统操作记录</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 系统统计 */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">系统统计</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 用户角色分布 */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <h4 className="font-medium text-text-primary mb-4">用户角色分布</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-secondary rounded-full"></div>
                    <span className="text-sm text-text-secondary">学生</span>
                  </div>
                  <span className="text-sm font-medium text-text-primary">1,126 (90.2%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-text-secondary">教师</span>
                  </div>
                  <span className="text-sm font-medium text-text-primary">122 (9.8%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-text-secondary">超级管理员</span>
                  </div>
                  <span className="text-sm font-medium text-text-primary">1 (0.1%)</span>
                </div>
              </div>
            </div>

            {/* 本月活跃用户 */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <h4 className="font-medium text-text-primary mb-4">本月活跃用户</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">学生活跃率</span>
                  <span className="text-sm font-medium text-green-600">94.5%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">教师活跃率</span>
                  <span className="text-sm font-medium text-green-600">98.3%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">平均登录次数</span>
                  <span className="text-sm font-medium text-text-primary">12.6次/月</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">平均在线时长</span>
                  <span className="text-sm font-medium text-text-primary">2.3小时/天</span>
                </div>
              </div>
            </div>

            {/* 数据增长趋势 */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <h4 className="font-medium text-text-primary mb-4">数据增长趋势</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">用户增长</span>
                  <span className="text-sm font-medium text-green-600">+12.3%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">数据记录增长</span>
                  <span className="text-sm font-medium text-green-600">+18.7%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">操作日志增长</span>
                  <span className="text-sm font-medium text-green-600">+25.1%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">存储使用增长</span>
                  <span className="text-sm font-medium text-orange-600">+8.9%</span>
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

