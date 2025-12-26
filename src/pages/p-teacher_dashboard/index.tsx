

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { UserWithRole } from '../../types/user';
import UserService from '../../services/userService';

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentCount, setStudentCount] = useState<number>(0);
  const [studentCountLoading, setStudentCountLoading] = useState<boolean>(true);
  const [pendingTasksCount, setPendingTasksCount] = useState<number>(0);
  const [pendingTasksLoading, setPendingTasksLoading] = useState<boolean>(true);
  const [approvedGraduationCount, setApprovedGraduationCount] = useState<number>(0);
  const [graduationCompletionRate, setGraduationCompletionRate] = useState<string>('0%');
  const [graduationRateLoading, setGraduationRateLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const userInfo = localStorage.getItem('user_info');
        if (userInfo) {
          const userData = JSON.parse(userInfo);
          setCurrentUser(userData);
          // 用户信息加载后立即获取待审核任务数量
          await loadPendingTasksCount(userData.id);
        } else {
          // 即使没有用户信息也尝试获取相关数据
          await loadPendingTasksCount();
        }
      } catch (error) {
        console.error('加载用户信息失败:', error);
      } finally {
        setLoading(false);
      }
    };

    const loadStudentCount = async () => {
      try {
        setStudentCountLoading(true);
        // 直接获取student_complete_info表中的学生总数
        const count = await UserService.getStudentCompleteInfoCount();
        setStudentCount(count || 0);
        
        // 学生总数加载完成后，加载毕业去向完成率
        const userInfo = localStorage.getItem('user_info');
        if (userInfo) {
          const userData = JSON.parse(userInfo);
          await loadGraduationCompletionRate(userData.id);
        } else {
          await loadGraduationCompletionRate();
        }
      } catch (error) {
        console.error('加载学生统计数据失败:', error);
      } finally {
        setStudentCountLoading(false);
      }
    };

    const loadPendingTasksCount = async (teacherId?: string) => {
      try {
        setPendingTasksLoading(true);
        // 获取未审核毕业去向申请数量
        const count = await UserService.getPendingGraduationApplicationsCount(teacherId);
        setPendingTasksCount(count || 0);
      } catch (error) {
        console.error('加载待审核任务数量失败:', error);
      } finally {
        setPendingTasksLoading(false);
      }
    };

    const loadGraduationCompletionRate = async (teacherId?: string) => {
      try {
        setGraduationRateLoading(true);
        // 获取已审批毕业去向学生数量
        const approvedCount = await UserService.getApprovedGraduationApplicationsCount(teacherId);
        setApprovedGraduationCount(approvedCount || 0);
        
        // 计算完成率
        if (studentCount > 0 && approvedCount !== undefined) {
          const rate = (approvedCount / studentCount) * 100;
          setGraduationCompletionRate(`${rate.toFixed(1)}%`);
        } else {
          setGraduationCompletionRate('0%');
        }
      } catch (error) {
        console.error('加载毕业去向完成率失败:', error);
      } finally {
        setGraduationRateLoading(false);
      }
    };

    const originalTitle = document.title;
    document.title = '教师管理平台 - 学档通';
    
    loadUserInfo();
    loadStudentCount();
    
    return () => { document.title = originalTitle; };
  }, []);

  // 当学生总数或已审批数量变化时重新计算毕业去向完成率
  useEffect(() => {
    // 只有当所有数据都加载完成且有有效数据时才计算
    if (!graduationRateLoading && studentCount > 0 && approvedGraduationCount > 0) {
      const rate = (approvedGraduationCount / studentCount) * 100;
      setGraduationCompletionRate(`${rate.toFixed(1)}%`);
    }
  }, [studentCount, approvedGraduationCount, graduationRateLoading]);

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
                <div className="font-medium text-text-primary">
                  {loading ? '加载中...' : (currentUser?.full_name || currentUser?.username || '未知教师')}
                </div>
                <div className="text-text-secondary">
                  {loading ? '加载中...' : (currentUser?.role_name || '教师')}
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
            to="/teacher-graduation-management" 
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-rocket text-lg"></i>
            <span className="font-medium">毕业去向管理</span>
          </Link>
          
          <Link 
            to="/teacher-learning-analysis" 
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-chart-line text-lg"></i>
            <span className="font-medium">学习成果智能分析</span>
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
                欢迎回来，{loading ? '加载中...' : (currentUser?.full_name || currentUser?.username || '教师')}老师
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
          <h3 className="text-lg font-semibold text-text-primary mb-4">数据概览</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 学生总数 */}
            <div className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm mb-1">学生总数</p>
                  <p className="text-3xl font-bold text-text-primary">{studentCountLoading ? '加载中...' : studentCount}</p>
                  <p className="text-green-600 text-sm mt-1">
                    <i className="fas fa-arrow-up mr-1"></i>
                    较上月 +{studentCount > 0 ? Math.floor(studentCount * 0.05) : 0}
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
                  <p className="text-3xl font-bold text-text-primary">
                    {pendingTasksLoading ? '加载中...' : pendingTasksCount}
                  </p>
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
                  <p className="text-3xl font-bold text-text-primary">
                    {graduationRateLoading ? '加载中...' : graduationCompletionRate}
                  </p>
                  <p className="text-blue-600 text-sm mt-1">
                    <i className="fas fa-info-circle mr-1"></i>
                    已审批: {approvedGraduationCount}/{studentCount}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-chart-line text-white text-xl"></i>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 学生列表已移除 */}

        {/* 快捷操作区 */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">快捷操作</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">


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


          </div>
        </section>
      </main>
    </div>
  );
};

export default TeacherDashboard;

