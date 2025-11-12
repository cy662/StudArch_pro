

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

const StudentCourseSchedule: React.FC = () => {
  const navigate = useNavigate();
  const [remindButtonsState, setRemindButtonsState] = useState<{
    [key: string]: { isSet: boolean; text: string; className: string }
  }>({
    'remind-btn-1': {
      isSet: false,
      text: '设置提醒',
      className: 'ml-4 px-3 py-1 border border-secondary text-secondary rounded-lg text-sm hover:bg-secondary hover:text-white transition-colors'
    },
    'remind-btn-2': {
      isSet: false,
      text: '设置提醒',
      className: 'ml-4 px-3 py-1 border border-secondary text-secondary rounded-lg text-sm hover:bg-secondary hover:text-white transition-colors'
    }
  });

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '课程安排 - 学档通';
    return () => { document.title = originalTitle; };
  }, []);

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      navigate('/login');
    }
  };

  const handleNotificationClick = () => {
    alert('您有2条新消息：\n1. 联系方式修改申请已提交\n2. 期末考试成绩已公布');
  };

  const handleUserInfoClick = () => {
    navigate('/student-my-profile');
  };

  const handlePrevSemester = () => {
    alert('切换到上一学期课程表');
  };

  const handleNextSemester = () => {
    alert('切换到下一学期课程表');
  };

  const handleCourseClick = (courseName: string) => {
    alert(`查看课程 "${courseName}" 的详细信息`);
  };

  const handleRemindButtonClick = (buttonId: string) => {
    setRemindButtonsState(prevState => ({
      ...prevState,
      [buttonId]: {
        isSet: true,
        text: '已设置提醒',
        className: 'ml-4 px-3 py-1 bg-green-100 text-green-800 border border-green-200 rounded-lg text-sm'
      }
    }));
    alert('已为课程设置提醒');
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
                src="https://s.coze.cn/image/3HE5Zyo1Vys/" 
                alt="学生头像" 
                className="w-8 h-8 rounded-full" 
              />
              <div className="text-sm">
                <div className="font-medium text-text-primary">李小明</div>
                <div className="text-text-secondary">计算机科学与技术1班</div>
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
          
          {/* 教学任务与安排相关导航 */}
          <div className="pt-4 mt-4 border-t border-border-light">
            <h3 className="px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">教学任务与安排</h3>
            
            <Link 
              to="/student-task-list" 
              className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
            >
              <i className="fas fa-tasks text-lg"></i>
              <span className="font-medium">培养方案</span>
            </Link>
            
            <Link 
              to="/student-course-schedule" 
              className={`${styles.navItem} ${styles.navItemActive} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors`}
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
              <h2 className="text-2xl font-bold text-text-primary mb-2">课程安排</h2>
              <nav className="text-sm text-text-secondary">
                <Link to="/student-dashboard" className="hover:text-secondary">首页</Link>
                <span className="mx-2">/</span>
                <span>课程安排</span>
              </nav>
            </div>
            <div className="text-right">
              <div className="text-sm text-text-secondary">今天是</div>
              <div className="text-lg font-medium text-text-primary">2024年1月15日 星期一</div>
            </div>
          </div>
        </div>

        {/* 学期选择器 */}
        <div className="bg-white rounded-xl shadow-card p-6 mb-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text-primary">学期选择</h3>
            <div className="flex space-x-2">
              <button 
                onClick={handlePrevSemester}
                className="px-4 py-2 border border-border-light rounded-lg text-text-secondary hover:bg-gray-50 transition-colors"
              >
                <i className="fas fa-chevron-left mr-1"></i> 上学期
              </button>
              <button className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors">
                2023-2024学年第二学期
              </button>
              <button 
                onClick={handleNextSemester}
                className="px-4 py-2 border border-border-light rounded-lg text-text-secondary hover:bg-gray-50 transition-colors"
              >
                下学期 <i className="fas fa-chevron-right ml-1"></i>
              </button>
            </div>
          </div>
        </div>

        {/* 课程表 */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <div className="p-6 border-b border-border-light">
              <h3 className="text-lg font-semibold text-text-primary">本周课程安排</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-border-light">
                    <th className="w-24 px-4 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">时间/日期</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">星期一</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">星期二</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">星期三</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">星期四</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">星期五</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">星期六</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">星期日</th>
                  </tr>
                </thead>
                <tbody>
                  {/* 第一节课 */}
                  <tr className="border-b border-border-light">
                    <td className="w-24 px-4 py-2 text-center text-sm text-text-secondary bg-gray-50">
                      08:00-09:40
                    </td>
                    <td className="px-4 py-2">
                      <div 
                        onClick={() => handleCourseClick('操作系统')}
                        className={`${styles.scheduleItem} bg-blue-50 border-l-4 border-blue-500 p-3 rounded-lg cursor-pointer`}
                      >
                        <div className="font-medium text-text-primary">操作系统</div>
                        <div className="text-xs text-text-secondary mt-1">李教授 | 计算机楼A301</div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div 
                        onClick={() => handleCourseClick('人工智能导论')}
                        className={`${styles.scheduleItem} bg-purple-50 border-l-4 border-purple-500 p-3 rounded-lg cursor-pointer`}
                      >
                        <div className="font-medium text-text-primary">人工智能导论</div>
                        <div className="text-xs text-text-secondary mt-1">王教授 | 计算机楼B203</div>
                      </div>
                    </td>
                    <td className="px-4 py-2"></td>
                    <td className="px-4 py-2">
                      <div 
                        onClick={() => handleCourseClick('操作系统')}
                        className={`${styles.scheduleItem} bg-blue-50 border-l-4 border-blue-500 p-3 rounded-lg cursor-pointer`}
                      >
                        <div className="font-medium text-text-primary">操作系统</div>
                        <div className="text-xs text-text-secondary mt-1">李教授 | 计算机楼A301</div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div 
                        onClick={() => handleCourseClick('人工智能导论')}
                        className={`${styles.scheduleItem} bg-purple-50 border-l-4 border-purple-500 p-3 rounded-lg cursor-pointer`}
                      >
                        <div className="font-medium text-text-primary">人工智能导论</div>
                        <div className="text-xs text-text-secondary mt-1">王教授 | 计算机楼B203</div>
                      </div>
                    </td>
                    <td className="px-4 py-2"></td>
                    <td className="px-4 py-2"></td>
                  </tr>
                  
                  {/* 第二节课 */}
                  <tr className="border-b border-border-light">
                    <td className="w-24 px-4 py-2 text-center text-sm text-text-secondary bg-gray-50">
                      10:00-11:40
                    </td>
                    <td className="px-4 py-2">
                      <div 
                        onClick={() => handleCourseClick('软件工程实践')}
                        className={`${styles.scheduleItem} bg-green-50 border-l-4 border-green-500 p-3 rounded-lg cursor-pointer`}
                      >
                        <div className="font-medium text-text-primary">软件工程实践</div>
                        <div className="text-xs text-text-secondary mt-1">赵教授 | 实验楼C402</div>
                      </div>
                    </td>
                    <td className="px-4 py-2"></td>
                    <td className="px-4 py-2">
                      <div 
                        onClick={() => handleCourseClick('软件工程实践')}
                        className={`${styles.scheduleItem} bg-green-50 border-l-4 border-green-500 p-3 rounded-lg cursor-pointer`}
                      >
                        <div className="font-medium text-text-primary">软件工程实践</div>
                        <div className="text-xs text-text-secondary mt-1">赵教授 | 实验楼C402</div>
                      </div>
                    </td>
                    <td className="px-4 py-2"></td>
                    <td className="px-4 py-2"></td>
                    <td className="px-4 py-2"></td>
                    <td className="px-4 py-2"></td>
                  </tr>
                  
                  {/* 午休 */}
                  <tr className="border-b border-border-light">
                    <td className="w-24 px-4 py-2 text-center text-sm text-text-secondary bg-gray-50">
                      午休
                    </td>
                    <td colSpan={7} className="px-4 py-2 text-center text-sm text-text-secondary bg-gray-50">
                      12:00-14:00
                    </td>
                  </tr>
                  
                  {/* 第三节课 */}
                  <tr className="border-b border-border-light">
                    <td className="w-24 px-4 py-2 text-center text-sm text-text-secondary bg-gray-50">
                      14:00-15:40
                    </td>
                    <td className="px-4 py-2"></td>
                    <td className="px-4 py-2">
                      <div 
                        onClick={() => handleCourseClick('高等数学')}
                        className={`${styles.scheduleItem} bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded-lg cursor-pointer`}
                      >
                        <div className="font-medium text-text-primary">高等数学</div>
                        <div className="text-xs text-text-secondary mt-1">陈教授 | 教学楼D105</div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div 
                        onClick={() => handleCourseClick('高等数学')}
                        className={`${styles.scheduleItem} bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded-lg cursor-pointer`}
                      >
                        <div className="font-medium text-text-primary">高等数学</div>
                        <div className="text-xs text-text-secondary mt-1">陈教授 | 教学楼D105</div>
                      </div>
                    </td>
                    <td className="px-4 py-2"></td>
                    <td className="px-4 py-2"></td>
                    <td className="px-4 py-2"></td>
                    <td className="px-4 py-2"></td>
                  </tr>
                  
                  {/* 第四节课 */}
                  <tr>
                    <td className="w-24 px-4 py-2 text-center text-sm text-text-secondary bg-gray-50">
                      16:00-17:40
                    </td>
                    <td className="px-4 py-2"></td>
                    <td className="px-4 py-2"></td>
                    <td className="px-4 py-2"></td>
                    <td className="px-4 py-2">
                      <div 
                        onClick={() => handleCourseClick('大学英语')}
                        className={`${styles.scheduleItem} bg-red-50 border-l-4 border-red-500 p-3 rounded-lg cursor-pointer`}
                      >
                        <div className="font-medium text-text-primary">大学英语</div>
                        <div className="text-xs text-text-secondary mt-1">刘教授 | 外语楼E201</div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div 
                        onClick={() => handleCourseClick('大学英语')}
                        className={`${styles.scheduleItem} bg-red-50 border-l-4 border-red-500 p-3 rounded-lg cursor-pointer`}
                      >
                        <div className="font-medium text-text-primary">大学英语</div>
                        <div className="text-xs text-text-secondary mt-1">刘教授 | 外语楼E201</div>
                      </div>
                    </td>
                    <td className="px-4 py-2"></td>
                    <td className="px-4 py-2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
        
        {/* 今日课程 */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-card p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">今日课程</h3>
            
            <div className="space-y-4">
              <div className="flex items-center p-4 border border-border-light rounded-lg hover:border-secondary transition-colors">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-laptop-code text-blue-600 text-xl"></i>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-text-primary">操作系统</h4>
                    <span className="text-sm text-blue-600">08:00-09:40</span>
                  </div>
                  <p className="text-sm text-text-secondary mt-1">李教授 | 计算机楼A301</p>
                </div>
                <button 
                  onClick={() => handleRemindButtonClick('remind-btn-1')}
                  className={remindButtonsState['remind-btn-1'].className}
                >
                  {remindButtonsState['remind-btn-1'].text}
                </button>
              </div>
              
              <div className="flex items-center p-4 border border-border-light rounded-lg hover:border-secondary transition-colors">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-code-branch text-green-600 text-xl"></i>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-text-primary">软件工程实践</h4>
                    <span className="text-sm text-green-600">10:00-11:40</span>
                  </div>
                  <p className="text-sm text-text-secondary mt-1">赵教授 | 实验楼C402</p>
                </div>
                <button 
                  onClick={() => handleRemindButtonClick('remind-btn-2')}
                  className={remindButtonsState['remind-btn-2'].className}
                >
                  {remindButtonsState['remind-btn-2'].text}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentCourseSchedule;

