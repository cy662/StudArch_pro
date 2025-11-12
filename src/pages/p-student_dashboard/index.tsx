

import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '学生服务平台 - 学档通';
    return () => { document.title = originalTitle; };
  }, []);

  const handleNotificationClick = () => {
    alert('您有2条新消息：\n1. 联系方式修改申请已提交\n2. 期末考试成绩已公布');
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
            {/* 消息通知 */}
            <button 
              onClick={handleNotificationClick}
              className="relative p-2 text-text-secondary hover:text-secondary transition-colors"
            >
              <i className="fas fa-bell text-lg"></i>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">2</span>
            </button>
            
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
                <div className="font-medium text-text-primary">李小明</div>
                <div className="text-text-secondary">计算机科学与技术1班</div>
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
          
          {/* 教学任务与安排相关导航 */}
          <div className="pt-4 mt-4 border-t border-border-light">
            <h3 className="px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">教学任务与安排</h3>
            
            <Link 
              to="/student-task-list" 
              className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
            >
              <i className="fas fa-tasks text-lg"></i>
              <span className="font-medium">教学任务</span>
            </Link>
            
            <Link 
              to="/student-course-schedule" 
              className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
            >
              <i className="fas fa-calendar-alt text-lg"></i>
              <span className="font-medium">课程安排</span>
            </Link>
            
            <Link 
              to="/student-task-progress" 
              className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
            >
              <i className="fas fa-chart-line text-lg"></i>
              <span className="font-medium">完成情况</span>
            </Link>
          </div>
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="ml-64 mt-16 p-6 min-h-screen">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">欢迎回来，李小明同学</h2>
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
          <h3 className="text-lg font-semibold text-text-primary mb-4">个人概览</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 学籍状态 */}
            <div className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm mb-1">学籍状态</p>
                  <p className="text-xl font-bold text-green-600">在读</p>
                  <p className="text-text-secondary text-sm mt-1">计算机科学与技术1班</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-user-graduate text-white text-xl"></i>
                </div>
              </div>
            </div>

            {/* 待办事项 */}
            <div className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm mb-1">待办事项</p>
                  <p className="text-3xl font-bold text-orange-600">1</p>
                  <p className="text-text-secondary text-sm mt-1">联系方式修改待审核</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-tasks text-white text-xl"></i>
                </div>
              </div>
            </div>

            {/* 已获学分 */}
            <div className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm mb-1">已获学分</p>
                  <p className="text-3xl font-bold text-blue-600">128</p>
                  <p className="text-text-secondary text-sm mt-1">总学分：140</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-book text-white text-xl"></i>
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

        {/* 重要通知 */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">重要通知</h3>
          </div>
          
          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="space-y-4">
              {/* 通知项目1 */}
              <div className="flex items-start space-x-4 p-4 rounded-lg bg-blue-50 border-l-4 border-blue-400">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <i className="fas fa-bullhorn text-blue-600 text-sm"></i>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900">关于2024届毕业生毕业去向填报的通知</h4>
                  <p className="text-sm text-blue-700 mt-1">请各位毕业生于3月1日前完成毕业去向填报，具体要求详见附件...</p>
                  <p className="text-xs text-blue-600 mt-2">发布时间：2024年1月10日</p>
                </div>
              </div>

              {/* 通知项目2 */}
              <div className="flex items-start space-x-4 p-4 rounded-lg bg-green-50 border-l-4 border-green-400">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <i className="fas fa-info-circle text-green-600 text-sm"></i>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-green-900">期末考试成绩查询系统已开放</h4>
                  <p className="text-sm text-green-700 mt-1">本学期期末考试成绩已全部录入，学生可登录系统查询...</p>
                  <p className="text-xs text-green-600 mt-2">发布时间：2024年1月8日</p>
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

