

import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '教师管理平台 - 学档通';
    return () => { document.title = originalTitle; };
  }, []);

  const handleNotificationClick = () => {
    console.log('查看通知功能');
  };

  const handleUserInfoClick = () => {
    console.log('用户信息菜单');
  };

  const handleLogoutClick = () => {
    if (confirm('确定要退出登录吗？')) {
      navigate('/login');
    }
  };

  const handleEditProfile = (studentId: string) => {
    console.log('编辑学生档案功能需要弹窗实现', studentId);
  };

  const handleFilterClass = () => {
    console.log('班级筛选功能');
  };

  const handleFilterStatus = () => {
    console.log('状态筛选功能');
  };

  const handlePrevPage = () => {
    console.log('上一页功能');
  };

  const handlePageClick = (page: number) => {
    console.log(`第${page}页`);
  };

  const handleNextPage = () => {
    console.log('下一页功能');
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
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
            </button>
            
            {/* 用户信息 */}
            <div 
              onClick={handleUserInfoClick}
              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
            >
              <img 
                src="https://s.coze.cn/image/CMFdm7Dv1Bo/" 
                alt="教师头像" 
                className="w-8 h-8 rounded-full" 
              />
              <div className="text-sm">
                <div className="font-medium text-text-primary">张老师</div>
                <div className="text-text-secondary">辅导员</div>
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
            to="/teacher-dashboard" 
            className={`${styles.navItem} ${styles.navItemActive} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors`}
          >
            <i className="fas fa-home text-lg"></i>
            <span className="font-medium">教师管理平台</span>
          </Link>
          
          <Link 
            to="/teacher-student-list" 
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-users text-lg"></i>
            <span className="font-medium">我的学生</span>
          </Link>
          
          <Link 
            to="/teacher-academic-management" 
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-book text-lg"></i>
            <span className="font-medium">学业信息管理</span>
          </Link>
          
          <Link 
            to="/teacher-graduation-management" 
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-rocket text-lg"></i>
            <span className="font-medium">毕业去向管理</span>
          </Link>
          
          <Link 
            to="/teacher-report" 
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-chart-bar text-lg"></i>
            <span className="font-medium">统计报表</span>
          </Link>
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="ml-64 mt-16 p-6 min-h-screen">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">欢迎回来，张老师</h2>
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
          <h3 className="text-lg font-semibold text-text-primary mb-4">数据概览</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 负责班级数 */}
            <div className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm mb-1">负责班级</p>
                  <p className="text-3xl font-bold text-text-primary">3</p>
                  <p className="text-secondary text-sm mt-1">
                    <i className="fas fa-arrow-up mr-1"></i>
                    较上月 +1
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
                  <i className="fas fa-chalkboard-teacher text-white text-xl"></i>
                </div>
              </div>
            </div>

            {/* 学生总数 */}
            <div className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm mb-1">学生总数</p>
                  <p className="text-3xl font-bold text-text-primary">126</p>
                  <p className="text-green-600 text-sm mt-1">
                    <i className="fas fa-arrow-up mr-1"></i>
                    较上月 +8
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-users text-white text-xl"></i>
                </div>
              </div>
            </div>

            {/* 待审核任务 */}
            <div className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm mb-1">待审核任务</p>
                  <p className="text-3xl font-bold text-text-primary">5</p>
                  <p className="text-orange-600 text-sm mt-1">
                    <i className="fas fa-clock mr-1"></i>
                    需要处理
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-tasks text-white text-xl"></i>
                </div>
              </div>
            </div>

            {/* 毕业去向完成率 */}
            <div className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm mb-1">毕业去向完成率</p>
                  <p className="text-3xl font-bold text-text-primary">85%</p>
                  <p className="text-blue-600 text-sm mt-1">
                    <i className="fas fa-arrow-up mr-1"></i>
                    较上周 +5%
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-chart-line text-white text-xl"></i>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 我的学生列表 */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">我的学生</h3>
            <Link 
              to="/teacher-student-list" 
              className="text-secondary hover:text-accent font-medium transition-colors"
            >
              查看全部 <i className="fas fa-arrow-right ml-1"></i>
            </Link>
          </div>
          
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            {/* 表格头部 */}
            <div className="px-6 py-4 border-b border-border-light">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-text-primary">最近活动的学生</h4>
                <div className="flex space-x-2">
                  <button 
                    onClick={handleFilterClass}
                    className="px-3 py-1 text-sm border border-border-light rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    班级 <i className="fas fa-chevron-down ml-1"></i>
                  </button>
                  <button 
                    onClick={handleFilterStatus}
                    className="px-3 py-1 text-sm border border-border-light rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    状态 <i className="fas fa-chevron-down ml-1"></i>
                  </button>
                </div>
              </div>
            </div>
            
            {/* 学生列表 */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">学号</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">姓名</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">班级</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">学籍状态</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">最近活动</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-border-light">
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">2021001</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img 
                          className="h-8 w-8 rounded-full mr-3" 
                          src="https://s.coze.cn/image/en3aZ7ttDcs/" 
                          alt="学生头像"
                        />
                        <Link 
                          to="/teacher-student-detail?studentId=2021001" 
                          className="text-secondary hover:text-accent font-medium"
                        >
                          李小明
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">计算机科学与技术1班</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">在读</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">2小时前更新了联系方式</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <Link 
                        to="/teacher-student-detail?studentId=2021001"
                        className="text-secondary hover:text-accent transition-colors"
                      >
                        <i className="fas fa-eye"></i>
                      </Link>
                      <button 
                        onClick={() => handleEditProfile('2021001')}
                        className="text-text-secondary hover:text-secondary transition-colors"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">2021002</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img 
                          className="h-8 w-8 rounded-full mr-3" 
                          src="https://s.coze.cn/image/2hMk7EsbH1U/" 
                          alt="学生头像"
                        />
                        <Link 
                          to="/teacher-student-detail?studentId=2021002" 
                          className="text-secondary hover:text-accent font-medium"
                        >
                          王小红
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">软件工程2班</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">毕业</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">1天前提交了毕业去向</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <Link 
                        to="/teacher-student-detail?studentId=2021002"
                        className="text-secondary hover:text-accent transition-colors"
                      >
                        <i className="fas fa-eye"></i>
                      </Link>
                      <button 
                        onClick={() => handleEditProfile('2021002')}
                        className="text-text-secondary hover:text-secondary transition-colors"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">2021003</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img 
                          className="h-8 w-8 rounded-full mr-3" 
                          src="https://s.coze.cn/image/AnpWEL72Gzw/" 
                          alt="学生头像"
                        />
                        <Link 
                          to="/teacher-student-detail?studentId=2021003" 
                          className="text-secondary hover:text-accent font-medium"
                        >
                          张大力
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">计算机科学与技术1班</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">在读</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">3天前申请了奖学金</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <Link 
                        to="/teacher-student-detail?studentId=2021003"
                        className="text-secondary hover:text-accent transition-colors"
                      >
                        <i className="fas fa-eye"></i>
                      </Link>
                      <button 
                        onClick={() => handleEditProfile('2021003')}
                        className="text-text-secondary hover:text-secondary transition-colors"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">2021004</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img 
                          className="h-8 w-8 rounded-full mr-3" 
                          src="https://s.coze.cn/image/XYv6PTWe-DI/" 
                          alt="学生头像"
                        />
                        <Link 
                          to="/teacher-student-detail?studentId=2021004" 
                          className="text-secondary hover:text-accent font-medium"
                        >
                          刘美丽
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">软件工程2班</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">休学</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">1周前提交了休学申请</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <Link 
                        to="/teacher-student-detail?studentId=2021004"
                        className="text-secondary hover:text-accent transition-colors"
                      >
                        <i className="fas fa-eye"></i>
                      </Link>
                      <button 
                        onClick={() => handleEditProfile('2021004')}
                        className="text-text-secondary hover:text-secondary transition-colors"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">2021005</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img 
                          className="h-8 w-8 rounded-full mr-3" 
                          src="https://s.coze.cn/image/QS8MUGV3_Ls/" 
                          alt="学生头像"
                        />
                        <Link 
                          to="/teacher-student-detail?studentId=2021005" 
                          className="text-secondary hover:text-accent font-medium"
                        >
                          陈志强
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">计算机科学与技术3班</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">在读</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">5天前参加了社会实践</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <Link 
                        to="/teacher-student-detail?studentId=2021005"
                        className="text-secondary hover:text-accent transition-colors"
                      >
                        <i className="fas fa-eye"></i>
                      </Link>
                      <button 
                        onClick={() => handleEditProfile('2021005')}
                        className="text-text-secondary hover:text-secondary transition-colors"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* 分页 */}
            <div className="px-6 py-4 border-t border-border-light flex items-center justify-between">
              <div className="text-sm text-text-secondary">
                显示 1-5 条，共 126 条记录
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={handlePrevPage}
                  className="px-3 py-1 text-sm border border-border-light rounded-lg hover:bg-gray-50 transition-colors"
                >
                  上一页
                </button>
                <button 
                  onClick={() => handlePageClick(1)}
                  className="px-3 py-1 text-sm bg-secondary text-white rounded-lg"
                >
                  1
                </button>
                <button 
                  onClick={() => handlePageClick(2)}
                  className="px-3 py-1 text-sm border border-border-light rounded-lg hover:bg-gray-50 transition-colors"
                >
                  2
                </button>
                <button 
                  onClick={() => handlePageClick(3)}
                  className="px-3 py-1 text-sm border border-border-light rounded-lg hover:bg-gray-50 transition-colors"
                >
                  3
                </button>
                <button 
                  onClick={handleNextPage}
                  className="px-3 py-1 text-sm border border-border-light rounded-lg hover:bg-gray-50 transition-colors"
                >
                  下一页
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 快捷操作区 */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">快捷操作</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 录入成绩 */}
            <Link 
              to="/teacher-academic-management"
              className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300 cursor-pointer block`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
                  <i className="fas fa-edit text-white text-xl"></i>
                </div>
                <div>
                  <h4 className="font-medium text-text-primary">录入成绩</h4>
                  <p className="text-sm text-text-secondary">批量或单个录入学生成绩</p>
                </div>
              </div>
            </Link>

            {/* 审核毕业去向 */}
            <Link 
              to="/teacher-graduation-management"
              className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300 cursor-pointer block`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-check-circle text-white text-xl"></i>
                </div>
                <div>
                  <h4 className="font-medium text-text-primary">审核毕业去向</h4>
                  <p className="text-sm text-text-secondary">查看和审核学生毕业去向</p>
                </div>
              </div>
            </Link>

            {/* 生成报表 */}
            <Link 
              to="/teacher-report"
              className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300 cursor-pointer block`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-file-alt text-white text-xl"></i>
                </div>
                <div>
                  <h4 className="font-medium text-text-primary">生成报表</h4>
                  <p className="text-sm text-text-secondary">生成班级统计分析报表</p>
                </div>
              </div>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TeacherDashboard;

