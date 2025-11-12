

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

const StudentTaskProgressPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSemester, setSelectedSemester] = useState('current');

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '完成情况 - 学档通';
    return () => { document.title = originalTitle; };
  }, []);

  const handleNotificationClick = () => {
    alert('您有2条新消息：\n1. 联系方式修改申请已提交\n2. 期末考试成绩已公布');
  };

  const handleUserInfoClick = () => {
    navigate('/student-my-profile');
  };

  const handleLogoutClick = () => {
    if (confirm('确定要退出登录吗？')) {
      navigate('/login');
    }
  };

  const handleSemesterFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    setSelectedSemester(selectedValue);
    alert(`切换到${selectedValue === 'current' ? '当前学期' : selectedValue === 'previous' ? '上一学期' : '全部学期'}的完成情况`);
  };

  const handleNextPageClick = () => {
    alert('跳转到第2页');
  };

  const handleViewTaskDetail = (taskId: string) => {
    alert(`查看任务ID: ${taskId} 的详细信息`);
  };

  const handleMarkAsDone = (taskId: string) => {
    alert(`标记任务ID: ${taskId} 为已完成`);
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
                src="https://s.coze.cn/image/DQIklNDlQyw/" 
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
              className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
            >
              <i className="fas fa-calendar-alt text-lg"></i>
              <span className="font-medium">课程安排</span>
            </Link>
            
            <Link 
              to="/student-task-progress" 
              className={`${styles.navItem} ${styles.navItemActive} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors`}
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
              <h2 className="text-2xl font-bold text-text-primary mb-2">完成情况</h2>
              <nav className="text-sm text-text-secondary">
                <Link to="/student-dashboard" className="hover:text-secondary">首页</Link>
                <span className="mx-2">/</span>
                <span>完成情况</span>
              </nav>
            </div>
            <div className="text-right">
              <div className="text-sm text-text-secondary">今天是</div>
              <div className="text-lg font-medium text-text-primary">2024年1月15日 星期一</div>
            </div>
          </div>
        </div>

        {/* 完成情况概览 */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 总学分完成度 */}
            <div className={`bg-white rounded-xl shadow-card p-6 transition-all duration-300 ${styles.cardHover}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-text-primary">总学分完成度</h3>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-graduation-cap text-blue-600"></i>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-text-secondary">已完成 128 / 140 学分</span>
                  <span className="text-sm font-medium text-blue-600">91%</span>
                </div>
                <div className={styles.progressBar}>
                  <div className={`${styles.progressFill} bg-blue-500`} style={{width: '91%'}}></div>
                </div>
              </div>
              <p className="text-xs text-text-secondary mt-2">预计还需完成 12 学分</p>
            </div>
            
            {/* 当前学期完成度 */}
            <div className={`bg-white rounded-xl shadow-card p-6 transition-all duration-300 ${styles.cardHover}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-text-primary">当前学期完成度</h3>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-calendar-check text-green-600"></i>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-text-secondary">已完成 4 / 16 周</span>
                  <span className="text-sm font-medium text-green-600">25%</span>
                </div>
                <div className={styles.progressBar}>
                  <div className={`${styles.progressFill} bg-green-500`} style={{width: '25%'}}></div>
                </div>
              </div>
              <p className="text-xs text-text-secondary mt-2">本学期共 20 学分</p>
            </div>
            
            {/* 作业完成率 */}
            <div className={`bg-white rounded-xl shadow-card p-6 transition-all duration-300 ${styles.cardHover}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-text-primary">作业完成率</h3>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-book-open text-purple-600"></i>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-text-secondary">已完成 8 / 10 项作业</span>
                  <span className="text-sm font-medium text-purple-600">80%</span>
                </div>
                <div className={styles.progressBar}>
                  <div className={`${styles.progressFill} bg-purple-500`} style={{width: '80%'}}></div>
                </div>
              </div>
              <p className="text-xs text-text-secondary mt-2">2 项作业即将到期</p>
            </div>
            
            {/* 平均成绩 */}
            <div className={`bg-white rounded-xl shadow-card p-6 transition-all duration-300 ${styles.cardHover}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-text-primary">平均成绩</h3>
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-star text-yellow-600"></i>
                </div>
              </div>
              <div className="text-3xl font-bold text-text-primary mb-1">85.5</div>
              <div className="flex items-center mb-2">
                <div className="flex">
                  <i className="fas fa-star text-yellow-400"></i>
                  <i className="fas fa-star text-yellow-400"></i>
                  <i className="fas fa-star text-yellow-400"></i>
                  <i className="fas fa-star text-yellow-400"></i>
                  <i className="fas fa-star-half-alt text-yellow-400"></i>
                </div>
                <span className="text-xs text-text-secondary ml-2">4.5/5.0</span>
              </div>
              <p className="text-xs text-text-secondary">较上学期提高 2.3 分</p>
            </div>
          </div>
        </section>

        {/* 课程完成情况详情 */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <div className="p-6 border-b border-border-light flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">课程完成情况详情</h3>
              <div className="relative">
                <select 
                  value={selectedSemester}
                  onChange={handleSemesterFilterChange}
                  className="appearance-none bg-gray-50 border border-gray-200 text-text-primary py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50"
                >
                  <option value="current">当前学期</option>
                  <option value="previous">上一学期</option>
                  <option value="all">全部学期</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-secondary">
                  <i className="fas fa-chevron-down text-xs"></i>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-border-light">
                    <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">课程名称</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">学分</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">完成进度</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">作业完成率</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">考试成绩</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {/* 课程1 */}
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-text-primary">操作系统</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-text-primary">4</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-32 mr-2 ${styles.progressBar}`}>
                          <div className={`${styles.progressFill} bg-blue-500`} style={{width: '30%'}}></div>
                        </div>
                        <span className="text-sm text-text-secondary">30%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-32 mr-2 ${styles.progressBar}`}>
                          <div className={`${styles.progressFill} bg-green-500`} style={{width: '60%'}}></div>
                        </div>
                        <span className="text-sm text-text-secondary">60%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-text-secondary">-</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">进行中</span>
                    </td>
                  </tr>
                  
                  {/* 课程2 */}
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-text-primary">人工智能导论</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-text-primary">3</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-32 mr-2 ${styles.progressBar}`}>
                          <div className={`${styles.progressFill} bg-blue-500`} style={{width: '25%'}}></div>
                        </div>
                        <span className="text-sm text-text-secondary">25%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-32 mr-2 ${styles.progressBar}`}>
                          <div className={`${styles.progressFill} bg-green-500`} style={{width: '40%'}}></div>
                        </div>
                        <span className="text-sm text-text-secondary">40%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-text-secondary">-</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">进行中</span>
                    </td>
                  </tr>
                  
                  {/* 课程3 */}
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-text-primary">软件工程实践</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-text-primary">5</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-32 mr-2 ${styles.progressBar}`}>
                          <div className={`${styles.progressFill} bg-blue-500`} style={{width: '10%'}}></div>
                        </div>
                        <span className="text-sm text-text-secondary">10%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-32 mr-2 ${styles.progressBar}`}>
                          <div className={`${styles.progressFill} bg-green-500`} style={{width: '0%'}}></div>
                        </div>
                        <span className="text-sm text-text-secondary">0%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-text-secondary">-</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">未开始</span>
                    </td>
                  </tr>
                  
                  {/* 课程4 */}
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-text-primary">数据结构</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-text-primary">4</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-32 mr-2 ${styles.progressBar}`}>
                          <div className={`${styles.progressFill} bg-blue-500`} style={{width: '100%'}}></div>
                        </div>
                        <span className="text-sm text-text-secondary">100%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-32 mr-2 ${styles.progressBar}`}>
                          <div className={`${styles.progressFill} bg-green-500`} style={{width: '100%'}}></div>
                        </div>
                        <span className="text-sm text-text-secondary">100%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-text-primary">85</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">已完成</span>
                    </td>
                  </tr>
                  
                  {/* 课程5 */}
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-text-primary">计算机网络</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-text-primary">4</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-32 mr-2 ${styles.progressBar}`}>
                          <div className={`${styles.progressFill} bg-blue-500`} style={{width: '100%'}}></div>
                        </div>
                        <span className="text-sm text-text-secondary">100%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-32 mr-2 ${styles.progressBar}`}>
                          <div className={`${styles.progressFill} bg-green-500`} style={{width: '100%'}}></div>
                        </div>
                        <span className="text-sm text-text-secondary">100%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-text-primary">92</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">已完成</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* 分页 */}
            <div className="px-6 py-4 border-t border-border-light flex items-center justify-between">
              <div className="text-sm text-text-secondary">
                显示 1 至 5 条，共 12 条
              </div>
              <div className="flex space-x-1">
                <button 
                  className="px-3 py-1 rounded border border-border-light text-text-secondary hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" 
                  disabled
                >
                  <i className="fas fa-chevron-left text-xs"></i>
                </button>
                <button className="px-3 py-1 rounded border border-secondary bg-secondary text-white">1</button>
                <button className="px-3 py-1 rounded border border-border-light text-text-secondary hover:bg-gray-50">2</button>
                <button className="px-3 py-1 rounded border border-border-light text-text-secondary hover:bg-gray-50">3</button>
                <button 
                  onClick={handleNextPageClick}
                  className="px-3 py-1 rounded border border-border-light text-text-secondary hover:bg-gray-50"
                >
                  <i className="fas fa-chevron-right text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        </section>
        
        {/* 待完成任务提醒 */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">待完成任务提醒</h3>
              <Link 
                to="/student-task-list" 
                className="text-secondary hover:text-accent font-medium transition-colors text-sm"
              >
                查看全部 <i className="fas fa-arrow-right ml-1"></i>
              </Link>
            </div>
            
            <div className="space-y-4">
              {/* 任务1 */}
              <div className="flex items-start space-x-4 p-4 rounded-lg border border-orange-200 bg-orange-50">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-tasks text-orange-600"></i>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-text-primary">操作系统作业3</h4>
                    <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">3天后截止</span>
                  </div>
                  <p className="text-sm text-text-secondary mt-1">完成进程调度算法实现与分析</p>
                  <div className="flex items-center mt-2">
                    <button 
                      onClick={() => handleViewTaskDetail('1')}
                      className="text-secondary hover:text-accent text-sm mr-4"
                    >
                      查看详情
                    </button>
                    <button 
                      onClick={() => handleMarkAsDone('1')}
                      className="text-green-600 hover:text-green-800 text-sm"
                    >
                      标记完成
                    </button>
                  </div>
                </div>
              </div>
              
              {/* 任务2 */}
              <div className="flex items-start space-x-4 p-4 rounded-lg border border-red-200 bg-red-50">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-exam text-red-600"></i>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-text-primary">人工智能导论测验</h4>
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">明天截止</span>
                  </div>
                  <p className="text-sm text-text-secondary mt-1">完成机器学习基础概念测验</p>
                  <div className="flex items-center mt-2">
                    <button 
                      onClick={() => handleViewTaskDetail('2')}
                      className="text-secondary hover:text-accent text-sm mr-4"
                    >
                      查看详情
                    </button>
                    <button 
                      onClick={() => handleMarkAsDone('2')}
                      className="text-green-600 hover:text-green-800 text-sm"
                    >
                      标记完成
                    </button>
                  </div>
                </div>
              </div>
              
              {/* 任务3 */}
              <div className="flex items-start space-x-4 p-4 rounded-lg border border-yellow-200 bg-yellow-50">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-file-alt text-yellow-600"></i>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-text-primary">软件工程实践预习报告</h4>
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">5天后截止</span>
                  </div>
                  <p className="text-sm text-text-secondary mt-1">提交敏捷开发方法预习报告</p>
                  <div className="flex items-center mt-2">
                    <button 
                      onClick={() => handleViewTaskDetail('3')}
                      className="text-secondary hover:text-accent text-sm mr-4"
                    >
                      查看详情
                    </button>
                    <button 
                      onClick={() => handleMarkAsDone('3')}
                      className="text-green-600 hover:text-green-800 text-sm"
                    >
                      标记完成
                    </button>
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

export default StudentTaskProgressPage;

