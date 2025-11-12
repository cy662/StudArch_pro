

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

interface TaskData {
  id: string;
  name: string;
  description: string;
  type: string;
  priority: string;
  deadline: string;
  progress: number;
  status: string;
  isOverdue?: boolean;
  isUrgent?: boolean;
  isNormal?: boolean;
}

const StudentTaskListPage: React.FC = () => {
  const navigate = useNavigate();
  const [isTaskDetailModalVisible, setIsTaskDetailModalVisible] = useState(false);
  const [selectedTaskData, setSelectedTaskData] = useState<TaskData | null>(null);

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '我的任务 - 学档通';
    return () => { document.title = originalTitle; };
  }, []);

  // 模拟任务数据
  const taskListData: TaskData[] = [
    {
      id: '1',
      name: '毕业去向填报',
      description: '提交就业协议或升学证明',
      type: '毕业相关',
      priority: '高',
      deadline: '2024-01-10 (已逾期)',
      progress: 30,
      status: '逾期',
      isOverdue: true
    },
    {
      id: '2',
      name: '个人信息完善',
      description: '更新联系方式和家庭住址',
      type: '个人信息',
      priority: '中',
      deadline: '2024-01-20',
      progress: 60,
      status: '进行中',
      isUrgent: true
    },
    {
      id: '3',
      name: '社会实践报告提交',
      description: '上传寒假社会实践总结',
      type: '实践活动',
      priority: '低',
      deadline: '2024-02-15',
      progress: 10,
      status: '进行中',
      isNormal: true
    },
    {
      id: '4',
      name: '奖学金申请材料',
      description: '国家奖学金申请表格提交',
      type: '奖励申请',
      priority: '中',
      deadline: '2024-01-25',
      progress: 100,
      status: '已完成'
    },
    {
      id: '5',
      name: '课程评价填写',
      description: '完成本学期课程教学评价',
      type: '学业相关',
      priority: '低',
      deadline: '2024-01-30',
      progress: 40,
      status: '进行中',
      isNormal: true
    }
  ];

  const handleLogoutButtonClick = () => {
    if (confirm('确定要退出登录吗？')) {
      navigate('/login');
    }
  };

  const handleEditTaskButtonClick = (taskData: TaskData) => {
    if (taskData.name.includes('毕业去向')) {
      navigate('/student-graduation-fill');
    } else if (taskData.name.includes('个人信息')) {
      navigate('/student-profile-edit');
    } else {
      alert(`跳转到${taskData.name}编辑页面`);
    }
  };

  const handleViewTaskButtonClick = (taskData: TaskData) => {
    setSelectedTaskData(taskData);
    setIsTaskDetailModalVisible(true);
  };

  const handleCloseTaskDetailModal = () => {
    setIsTaskDetailModalVisible(false);
    setSelectedTaskData(null);
  };

  const handleTaskDetailModalBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCloseTaskDetailModal();
    }
  };

  const handleFilterStatusButtonClick = () => {
    console.log('打开状态筛选');
  };

  const handleFilterPriorityButtonClick = () => {
    console.log('打开优先级筛选');
  };

  const handleCurriculumNavigationClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    console.log('跳转到培养方案页面');
  };

  const getTaskRowClassName = (taskData: TaskData) => {
    let className = 'hover:bg-gray-50 transition-colors';
    if (taskData.isOverdue) className += ` ${styles.taskOverdue}`;
    if (taskData.isUrgent) className += ` ${styles.taskUrgent}`;
    if (taskData.isNormal) className += ` ${styles.taskNormal}`;
    return className;
  };

  const getPriorityBadgeClassName = (priority: string) => {
    switch (priority) {
      case '高':
        return 'px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full';
      case '中':
        return 'px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full';
      case '低':
        return 'px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full';
      default:
        return 'px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full';
    }
  };

  const getTypeBadgeClassName = (type: string) => {
    switch (type) {
      case '毕业相关':
        return 'px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full';
      case '个人信息':
        return 'px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full';
      case '实践活动':
        return 'px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full';
      case '奖励申请':
        return 'px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full';
      case '学业相关':
        return 'px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full';
      default:
        return 'px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full';
    }
  };

  const getStatusBadgeClassName = (status: string) => {
    switch (status) {
      case '逾期':
        return 'px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full';
      case '进行中':
        return 'px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full';
      case '已完成':
        return 'px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full';
      default:
        return 'px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full';
    }
  };

  const getProgressBarClassName = (status: string) => {
    switch (status) {
      case '逾期':
        return `bg-red-500 h-2 rounded-full ${styles.taskProgress}`;
      case '进行中':
        if (taskListData.find(t => t.status === status)?.isUrgent) {
          return `bg-orange-500 h-2 rounded-full ${styles.taskProgress}`;
        }
        return `bg-blue-500 h-2 rounded-full ${styles.taskProgress}`;
      case '已完成':
        return `bg-green-500 h-2 rounded-full ${styles.taskProgress}`;
      default:
        return `bg-gray-500 h-2 rounded-full ${styles.taskProgress}`;
    }
  };

  const getDeadlineClassName = (status: string) => {
    switch (status) {
      case '逾期':
        return 'text-sm text-red-600 font-medium';
      case '进行中':
        if (taskListData.find(t => t.status === status)?.isUrgent) {
          return 'text-sm text-orange-600 font-medium';
        }
        return 'text-sm text-text-secondary';
      default:
        return 'text-sm text-text-secondary';
    }
  };

  const getTaskIndicatorColor = (status: string) => {
    switch (status) {
      case '逾期':
        return 'bg-red-500';
      case '进行中':
        if (taskListData.find(t => t.status === status)?.isUrgent) {
          return 'bg-orange-500';
        }
        return 'bg-blue-500';
      case '已完成':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
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
            {/* 消息通知 */}
            <button className="relative p-2 text-text-secondary hover:text-secondary transition-colors">
              <i className="fas fa-bell text-lg"></i>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">2</span>
            </button>
            
            {/* 用户信息 */}
            <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors">
              <img 
                src="https://s.coze.cn/image/CrKLQnPnVxs/" 
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
              onClick={handleLogoutButtonClick}
              className="text-text-secondary hover:text-red-500 transition-colors"
            >
              <i className="fas fa-sign-out-alt text-lg"></i>
            </button>
          </div>
        </div>
      </header>

      {/* 左侧菜单 */}
      <aside className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-border-light z-40 ${styles.sidebarTransition}`}>
        <nav className="p-4 space-y-4">
          <Link 
            to="/student-dashboard" 
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-home text-lg w-6 text-center"></i>
            <span className="font-medium">学生服务平台</span>
          </Link>
          
          <Link 
            to="/student-my-profile" 
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-user text-lg w-6 text-center"></i>
            <span className="font-medium">我的档案</span>
          </Link>
          
          <Link 
            to="/student-profile-edit" 
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-edit text-lg w-6 text-center"></i>
            <span className="font-medium">个人信息维护</span>
          </Link>
          
          <Link 
            to="/student-graduation-fill" 
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-rocket text-lg w-6 text-center"></i>
            <span className="font-medium">毕业去向填报</span>
          </Link>
          
          <Link 
            to="/student-document-view" 
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-file-alt text-lg w-6 text-center"></i>
            <span className="font-medium">信息查看与下载</span>
          </Link>
          
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-2">教学任务与安排</h3>
            <a 
              href="#" 
              onClick={handleCurriculumNavigationClick}
              className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
            >
              <i className="fas fa-book text-lg w-6 text-center"></i>
              <span className="font-medium">培养方案</span>
            </a>
            <Link 
              to="/student-course-schedule" 
              className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
            >
              <i className="fas fa-calendar-alt text-lg w-6 text-center"></i>
              <span className="font-medium">课程安排</span>
            </Link>
            <Link 
              to="/student-task-list" 
              className={`${styles.navItem} ${styles.navItemActive} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors`}
            >
              <i className="fas fa-check-circle text-lg w-6 text-center"></i>
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
              <h2 className="text-2xl font-bold text-text-primary mb-2">我的任务</h2>
              <nav className="text-sm text-text-secondary">
                <span>首页</span>
                <i className="fas fa-chevron-right mx-2"></i>
                <span>我的任务</span>
              </nav>
            </div>
            <div className="text-right">
              <div className="text-sm text-text-secondary">今天是</div>
              <div className="text-lg font-medium text-text-primary">2024年1月15日 星期一</div>
            </div>
          </div>
        </div>

        {/* 任务概览 */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">任务概览</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 待完成任务 */}
            <div className={`bg-white rounded-xl shadow-card p-6 transition-all duration-300 ${styles.cardHover}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm mb-1">待完成任务</p>
                  <p className="text-3xl font-bold text-text-primary">5</p>
                  <p className="text-orange-600 text-sm mt-1">
                    <i className="fas fa-clock mr-1"></i>
                    需要关注
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-hourglass-half text-white text-xl"></i>
                </div>
              </div>
            </div>

            {/* 进行中任务 */}
            <div className={`bg-white rounded-xl shadow-card p-6 transition-all duration-300 ${styles.cardHover}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm mb-1">进行中任务</p>
                  <p className="text-3xl font-bold text-text-primary">3</p>
                  <p className="text-blue-600 text-sm mt-1">
                    <i className="fas fa-play mr-1"></i>
                    按计划进行
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-cog text-white text-xl"></i>
                </div>
              </div>
            </div>

            {/* 已完成任务 */}
            <div className={`bg-white rounded-xl shadow-card p-6 transition-all duration-300 ${styles.cardHover}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm mb-1">已完成任务</p>
                  <p className="text-3xl font-bold text-text-primary">12</p>
                  <p className="text-green-600 text-sm mt-1">
                    <i className="fas fa-check mr-1"></i>
                    完成率 70%
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-check-circle text-white text-xl"></i>
                </div>
              </div>
            </div>

            {/* 逾期任务 */}
            <div className={`bg-white rounded-xl shadow-card p-6 transition-all duration-300 ${styles.cardHover}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm mb-1">逾期任务</p>
                  <p className="text-3xl font-bold text-text-primary">1</p>
                  <p className="text-red-600 text-sm mt-1">
                    <i className="fas fa-exclamation-triangle mr-1"></i>
                    需要立即处理
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-exclamation-circle text-white text-xl"></i>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 任务列表 */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">任务详情</h3>
            <div className="flex space-x-2">
              <button 
                onClick={handleFilterStatusButtonClick}
                className="px-3 py-1 text-sm border border-border-light rounded-lg hover:bg-gray-50 transition-colors"
              >
                状态 <i className="fas fa-chevron-down ml-1"></i>
              </button>
              <button 
                onClick={handleFilterPriorityButtonClick}
                className="px-3 py-1 text-sm border border-border-light rounded-lg hover:bg-gray-50 transition-colors"
              >
                优先级 <i className="fas fa-chevron-down ml-1"></i>
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            {/* 表格头部 */}
            <div className="px-6 py-4 border-b border-border-light">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-text-primary">当前任务</h4>
                <div className="text-sm text-text-secondary">
                  共 21 个任务，显示 1-10 个
                </div>
              </div>
            </div>
            
            {/* 任务列表 */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">任务名称</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">类型</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">优先级</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">截止时间</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">进度</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">状态</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-border-light">
                  {taskListData.map((taskData) => (
                    <tr key={taskData.id} className={getTaskRowClassName(taskData)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 ${getTaskIndicatorColor(taskData.status)} rounded-full mr-3`}></div>
                          <div>
                            <div className="font-medium text-text-primary">{taskData.name}</div>
                            <div className="text-sm text-text-secondary">{taskData.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getTypeBadgeClassName(taskData.type)}>{taskData.type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getPriorityBadgeClassName(taskData.priority)}>{taskData.priority}</span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${getDeadlineClassName(taskData.status)}`}>
                        {taskData.deadline}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={getProgressBarClassName(taskData.status)} 
                              style={{ width: `${taskData.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-text-secondary">{taskData.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadgeClassName(taskData.status)}>{taskData.status}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        {taskData.status === '已完成' ? (
                          <button className="text-text-secondary hover:text-secondary transition-colors">
                            <i className="fas fa-check-circle"></i>
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleEditTaskButtonClick(taskData)}
                            className="text-secondary hover:text-accent transition-colors"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                        )}
                        <button 
                          onClick={() => handleViewTaskButtonClick(taskData)}
                          className="text-text-secondary hover:text-secondary transition-colors"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* 分页 */}
            <div className="px-6 py-4 border-t border-border-light flex items-center justify-between">
              <div className="text-sm text-text-secondary">
                显示 1-5 条，共 21 条记录
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm border border-border-light rounded-lg hover:bg-gray-50 transition-colors">
                  上一页
                </button>
                <button className="px-3 py-1 text-sm bg-secondary text-white rounded-lg">1</button>
                <button className="px-3 py-1 text-sm border border-border-light rounded-lg hover:bg-gray-50 transition-colors">2</button>
                <button className="px-3 py-1 text-sm border border-border-light rounded-lg hover:bg-gray-50 transition-colors">3</button>
                <button className="px-3 py-1 text-sm border border-border-light rounded-lg hover:bg-gray-50 transition-colors">
                  下一页
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 任务详情弹窗 */}
        {isTaskDetailModalVisible && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={handleTaskDetailModalBackgroundClick}
          >
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
                <div className="p-6 border-b border-border-light">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-text-primary">任务详情</h3>
                    <button 
                      onClick={handleCloseTaskDetailModal}
                      className="text-text-secondary hover:text-text-primary transition-colors"
                    >
                      <i className="fas fa-times text-xl"></i>
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {selectedTaskData && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-text-primary mb-2">任务名称</h4>
                        <p className="text-text-secondary">{selectedTaskData.name}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-text-primary mb-2">任务描述</h4>
                        <p className="text-text-secondary">{selectedTaskData.description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-text-primary mb-2">类型</h4>
                          <p className="text-text-secondary">{selectedTaskData.type}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-text-primary mb-2">优先级</h4>
                          <p className="text-text-secondary">{selectedTaskData.priority}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-text-primary mb-2">截止时间</h4>
                          <p className="text-text-secondary">{selectedTaskData.deadline}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-text-primary mb-2">进度</h4>
                          <p className="text-text-secondary">{selectedTaskData.progress}%</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-text-primary mb-2">当前状态</h4>
                        <p className="text-text-secondary">{selectedTaskData.status}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentTaskListPage;

