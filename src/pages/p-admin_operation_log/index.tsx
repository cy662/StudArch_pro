

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

interface LogDetails {
  action: string;
  [key: string]: any;
}

interface OperationLog {
  id: number;
  user: string;
  operation: 'create' | 'update' | 'delete' | 'login' | 'logout';
  target: 'student' | 'user' | 'grade' | 'destination' | 'role' | 'system';
  targetName?: string;
  time: string;
  ip: string;
  details: LogDetails;
}

const AdminOperationLog: React.FC = () => {
  const navigate = useNavigate();
  
  // 模拟日志数据
  const mockLogs: OperationLog[] = [
    {
      id: 1,
      user: '张老师',
      operation: 'update',
      target: 'student',
      targetName: '李小明',
      time: '2024-01-15 14:30:25',
      ip: '192.168.1.100',
      details: {
        action: '更新学生信息',
        field: '联系方式',
        oldValue: '13800138000',
        newValue: '13900139000',
        timestamp: '2024-01-15 14:30:25'
      }
    },
    {
      id: 2,
      user: '管理员',
      operation: 'create',
      target: 'user',
      targetName: '王老师',
      time: '2024-01-15 13:45:12',
      ip: '192.168.1.101',
      details: {
        action: '创建用户',
        username: 'teacher_wang',
        role: '辅导员',
        department: '计算机学院',
        timestamp: '2024-01-15 13:45:12'
      }
    },
    {
      id: 3,
      user: '李小明',
      operation: 'login',
      target: 'system',
      targetName: '系统登录',
      time: '2024-01-15 12:20:33',
      ip: '192.168.1.102',
      details: {
        action: '用户登录',
        username: 'student_li',
        role: '学生',
        timestamp: '2024-01-15 12:20:33'
      }
    },
    {
      id: 4,
      user: '张老师',
      operation: 'update',
      target: 'grade',
      targetName: '高等数学',
      time: '2024-01-15 11:15:47',
      ip: '192.168.1.100',
      details: {
        action: '更新成绩',
        student: '王小红',
        course: '高等数学',
        oldValue: '85',
        newValue: '88',
        timestamp: '2024-01-15 11:15:47'
      }
    },
    {
      id: 5,
      user: '王小红',
      operation: 'create',
      target: 'destination',
      targetName: '毕业去向',
      time: '2024-01-15 10:30:15',
      ip: '192.168.1.103',
      details: {
        action: '提交毕业去向',
        type: '就业',
        company: '腾讯科技',
        position: '前端开发工程师',
        timestamp: '2024-01-15 10:30:15'
      }
    },
    {
      id: 6,
      user: '管理员',
      operation: 'update',
      target: 'role',
      targetName: '辅导员角色',
      time: '2024-01-15 09:45:22',
      ip: '192.168.1.101',
      details: {
        action: '更新角色权限',
        role: '辅导员',
        addedPermissions: ['学生管理', '成绩录入'],
        removedPermissions: [],
        timestamp: '2024-01-15 09:45:22'
      }
    },
    {
      id: 7,
      user: '李小明',
      operation: 'logout',
      target: 'system',
      targetName: '系统退出',
      time: '2024-01-14 18:30:15',
      ip: '192.168.1.102',
      details: {
        action: '用户退出',
        username: 'student_li',
        timestamp: '2024-01-14 18:30:15'
      }
    },
    {
      id: 8,
      user: '张老师',
      operation: 'delete',
      target: 'student',
      targetName: '陈志强',
      time: '2024-01-14 16:20:30',
      ip: '192.168.1.100',
      details: {
        action: '删除学生记录',
        studentId: '2021005',
        reason: '退学',
        timestamp: '2024-01-14 16:20:30'
      }
    }
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const [filteredLogs, setFilteredLogs] = useState<OperationLog[]>(mockLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [operationFilter, setOperationFilter] = useState('');
  const [targetFilter, setTargetFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<OperationLog | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const pageSize = 10;

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '操作日志审计 - 学档通';
    return () => { document.title = originalTitle; };
  }, []);

  // 筛选日志
  const filterLogs = () => {
    let filtered = mockLogs.filter(log => {
      // 搜索筛选
      const matchesSearch = !searchTerm || 
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getOperationText(log.operation).toLowerCase().includes(searchTerm.toLowerCase()) ||
        getTargetText(log.target).toLowerCase().includes(searchTerm.toLowerCase());
      
      // 时间筛选
      const matchesTime = !timeFilter || filterByTime(log.time, timeFilter);
      
      // 操作类型筛选
      const matchesOperation = !operationFilter || log.operation === operationFilter;
      
      // 操作对象筛选
      const matchesTarget = !targetFilter || log.target === targetFilter;
      
      return matchesSearch && matchesTime && matchesOperation && matchesTarget;
    });
    
    setFilteredLogs(filtered);
    setCurrentPage(1);
  };

  // 时间筛选
  const filterByTime = (logTime: string, filter: string): boolean => {
    const logDate = new Date(logTime);
    const now = new Date();
    
    switch (filter) {
      case 'today':
        return logDate.toDateString() === now.toDateString();
      case 'week':
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return logDate >= oneWeekAgo;
      case 'month':
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return logDate >= oneMonthAgo;
      default:
        return true;
    }
  };

  // 监听筛选条件变化
  useEffect(() => {
    filterLogs();
  }, [searchTerm, timeFilter, operationFilter, targetFilter]);

  // 获取当前页日志
  const getCurrentPageLogs = (): OperationLog[] => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredLogs.slice(start, end);
  };

  // 计算总页数
  const getTotalPages = (): number => {
    return Math.ceil(filteredLogs.length / pageSize);
  };

  // 生成页码按钮
  const generatePageNumbers = (): number[] => {
    const totalPages = getTotalPages();
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  // 页码点击处理
  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // 上一页
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // 下一页
  const handleNextPage = () => {
    if (currentPage < getTotalPages()) {
      setCurrentPage(currentPage + 1);
    }
  };

  // 刷新日志
  const handleRefresh = () => {
    console.log('刷新操作日志数据');
    filterLogs();
  };

  // 导出日志
  const handleExport = () => {
    console.log('导出操作日志');
    alert('日志导出功能正在开发中...');
  };

  // 显示日志详情
  const showLogDetail = (logId: number) => {
    const log = mockLogs.find(l => l.id === logId);
    if (log) {
      setSelectedLog(log);
      setIsModalVisible(true);
    }
  };

  // 关闭模态框
  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedLog(null);
  };

  // 退出登录
  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      navigate('/login');
    }
  };

  // 获取操作类型文本
  const getOperationText = (operation: string): string => {
    const map: { [key: string]: string } = {
      'create': '创建',
      'update': '更新',
      'delete': '删除',
      'login': '登录',
      'logout': '退出'
    };
    return map[operation] || operation;
  };

  // 获取操作类型颜色
  const getOperationColor = (operation: string): string => {
    const map: { [key: string]: string } = {
      'create': 'bg-green-100 text-green-800',
      'update': 'bg-blue-100 text-blue-800',
      'delete': 'bg-red-100 text-red-800',
      'login': 'bg-purple-100 text-purple-800',
      'logout': 'bg-gray-100 text-gray-800'
    };
    return map[operation] || 'bg-gray-100 text-gray-800';
  };

  // 获取操作对象文本
  const getTargetText = (target: string): string => {
    const map: { [key: string]: string } = {
      'student': '学生',
      'user': '用户',
      'grade': '成绩',
      'destination': '毕业去向',
      'role': '角色',
      'system': '系统'
    };
    return map[target] || target;
  };

  const currentPageLogs = getCurrentPageLogs();
  const totalPages = getTotalPages();
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, filteredLogs.length);

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
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
            </button>
            
            {/* 用户信息 */}
            <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors">
              <img 
                src="https://s.coze.cn/image/iOICpyidQMU/" 
                alt="管理员头像" 
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
              onClick={handleLogout}
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
            to="/admin-dashboard" 
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-home text-lg"></i>
            <span className="font-medium">超级管理平台</span>
          </Link>
          
          <Link 
            to="/admin-user-management" 
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-users text-lg"></i>
            <span className="font-medium">用户管理</span>
          </Link>
          
          <Link 
            to="/admin-role-permission" 
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-shield-alt text-lg"></i>
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
            className={`${styles.navItem} ${styles.navItemActive} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors`}
          >
            <i className="fas fa-file-alt text-lg"></i>
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
              <h2 className="text-2xl font-bold text-text-primary mb-2">操作日志审计</h2>
              <nav className="text-sm text-text-secondary">
                <span>首页</span>
                <i className="fas fa-chevron-right mx-2"></i>
                <span>操作日志审计</span>
              </nav>
            </div>
            <div className="text-right">
              <div className="text-sm text-text-secondary">今天是</div>
              <div className="text-lg font-medium text-text-primary">2024年1月15日 星期一</div>
            </div>
          </div>
        </div>

        {/* 工具栏区域 */}
        <section className="mb-6">
          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* 搜索框 */}
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"></i>
                  <input 
                    type="text" 
                    placeholder="搜索用户名、操作类型..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                  />
                </div>
                
                {/* 筛选条件 */}
                <div className="flex space-x-4">
                  <select 
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  >
                    <option value="">全部时间</option>
                    <option value="today">今天</option>
                    <option value="week">最近一周</option>
                    <option value="month">最近一月</option>
                    <option value="custom">自定义</option>
                  </select>
                  
                  <select 
                    value={operationFilter}
                    onChange={(e) => setOperationFilter(e.target.value)}
                    className="px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  >
                    <option value="">全部操作类型</option>
                    <option value="create">创建</option>
                    <option value="update">更新</option>
                    <option value="delete">删除</option>
                    <option value="login">登录</option>
                    <option value="logout">退出</option>
                  </select>
                  
                  <select 
                    value={targetFilter}
                    onChange={(e) => setTargetFilter(e.target.value)}
                    className="px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  >
                    <option value="">全部操作对象</option>
                    <option value="student">学生</option>
                    <option value="user">用户</option>
                    <option value="grade">成绩</option>
                    <option value="destination">毕业去向</option>
                    <option value="role">角色</option>
                  </select>
                </div>
              </div>
              
              {/* 操作按钮 */}
              <div className="flex space-x-3">
                <button 
                  onClick={handleRefresh}
                  className="px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <i className="fas fa-sync-alt mr-2"></i>刷新
                </button>
                <button 
                  onClick={handleExport}
                  className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors"
                >
                  <i className="fas fa-download mr-2"></i>导出
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 操作日志列表 */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            {/* 表格头部 */}
            <div className="px-6 py-4 border-b border-border-light">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-text-primary">操作日志列表</h4>
                <div className="text-sm text-text-secondary">
                  共 <span>{filteredLogs.length.toLocaleString()}</span> 条记录
                </div>
              </div>
            </div>
            
            {/* 日志表格 */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary">
                      操作人 <i className="fas fa-sort ml-1"></i>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary">
                      操作类型 <i className="fas fa-sort ml-1"></i>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary">
                      操作对象 <i className="fas fa-sort ml-1"></i>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary">
                      操作时间 <i className="fas fa-sort ml-1"></i>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      IP地址
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      操作详情
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-border-light">
                  {currentPageLogs.map(log => (
                    <tr key={log.id} className={`${styles.tableRow} transition-colors`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{log.user}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium ${getOperationColor(log.operation)} rounded-full`}>
                          {getOperationText(log.operation)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                        {getTargetText(log.target)}{log.targetName ? ` - ${log.targetName}` : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{log.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{log.ip}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button 
                          onClick={() => showLogDetail(log.id)}
                          className="text-secondary hover:text-accent transition-colors"
                        >
                          <i className="fas fa-eye mr-1"></i>查看详情
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
                显示 <span>{startItem}</span>-<span>{endItem}</span> 条，共 <span>{filteredLogs.length.toLocaleString()}</span> 条记录
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-border-light rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <i className="fas fa-chevron-left mr-1"></i>上一页
                </button>
                <div className="flex space-x-1">
                  {generatePageNumbers().map(page => (
                    <button 
                      key={page}
                      onClick={() => handlePageClick(page)}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        page === currentPage 
                          ? 'bg-secondary text-white' 
                          : 'border border-border-light hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1 text-sm border border-border-light rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  下一页<i className="fas fa-chevron-right ml-1"></i>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 操作日志详情模态框 */}
      {isModalVisible && (
        <div className="fixed inset-0 z-50">
          <div 
            className={styles.modalBackdrop}
            onClick={closeModal}
          ></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`bg-white rounded-xl shadow-card max-w-2xl w-full max-h-96 overflow-y-auto ${styles.modalEnter}`}>
              <div className="px-6 py-4 border-b border-border-light">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-text-primary">操作日志详情</h3>
                  <button 
                    onClick={closeModal}
                    className="text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>
              <div className="p-6">
                {selectedLog && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary">操作人</label>
                        <p className="text-text-primary">{selectedLog.user}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary">操作类型</label>
                        <span className={`px-2 py-1 text-xs font-medium ${getOperationColor(selectedLog.operation)} rounded-full`}>
                          {getOperationText(selectedLog.operation)}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary">操作对象</label>
                        <p className="text-text-primary">
                          {getTargetText(selectedLog.target)}{selectedLog.targetName ? ` - ${selectedLog.targetName}` : ''}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary">操作时间</label>
                        <p className="text-text-primary">{selectedLog.time}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary">IP地址</label>
                      <p className="text-text-primary">{selectedLog.ip}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary">详细信息</label>
                      <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                        <pre className="text-sm text-text-primary whitespace-pre-wrap">
                          {JSON.stringify(selectedLog.details, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOperationLog;

