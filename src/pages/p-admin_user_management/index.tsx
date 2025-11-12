

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

interface User {
  id: number;
  username: string;
  role: 'super_admin' | 'teacher' | 'student';
  user_number: string;
  name: string;
  status: 'active' | 'inactive';
  created_at: string;
}

interface UserFormData {
  username: string;
  role: string;
  user_number: string;
  name: string;
  password: string;
  status: 'active' | 'inactive';
}

const AdminUserManagement: React.FC = () => {
  const navigate = useNavigate();
  
  // 模拟用户数据
  const mockUsers: User[] = [
    {
      id: 1,
      username: 'admin',
      role: 'super_admin',
      user_number: 'ADMIN001',
      name: '超级管理员',
      status: 'active',
      created_at: '2024-01-01 10:00:00'
    },
    {
      id: 2,
      username: 'teacher_zhang',
      role: 'teacher',
      user_number: 'T2024001',
      name: '张老师',
      status: 'active',
      created_at: '2024-01-02 14:30:00'
    },
    {
      id: 3,
      username: 'teacher_li',
      role: 'teacher',
      user_number: 'T2024002',
      name: '李老师',
      status: 'inactive',
      created_at: '2024-01-03 09:15:00'
    },
    {
      id: 4,
      username: 'student_2021001',
      role: 'student',
      user_number: '2021001',
      name: '李小明',
      status: 'active',
      created_at: '2024-01-04 16:20:00'
    },
    {
      id: 5,
      username: 'student_2021002',
      role: 'student',
      user_number: '2021002',
      name: '王小红',
      status: 'active',
      created_at: '2024-01-05 11:45:00'
    },
    {
      id: 6,
      username: 'student_2021003',
      role: 'student',
      user_number: '2021003',
      name: '张大力',
      status: 'active',
      created_at: '2024-01-06 13:10:00'
    },
    {
      id: 7,
      username: 'student_2021004',
      role: 'student',
      user_number: '2021004',
      name: '刘美丽',
      status: 'inactive',
      created_at: '2024-01-07 15:50:00'
    },
    {
      id: 8,
      username: 'student_2021005',
      role: 'student',
      user_number: '2021005',
      name: '陈志强',
      status: 'active',
      created_at: '2024-01-08 10:30:00'
    }
  ];

  // 状态管理
  const [currentUsers, setCurrentUsers] = useState<User[]>([...mockUsers]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  
  // 表单数据
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    role: '',
    user_number: '',
    name: '',
    password: '',
    status: 'active'
  });

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '用户管理 - 学档通';
    return () => { document.title = originalTitle; };
  }, []);

  // 筛选用户
  const filterUsers = () => {
    let filteredUsers = [...mockUsers];
    
    // 搜索筛选
    if (searchTerm) {
      filteredUsers = filteredUsers.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.user_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // 角色筛选
    if (roleFilter) {
      filteredUsers = filteredUsers.filter(user => user.role === roleFilter);
    }
    
    // 状态筛选
    if (statusFilter) {
      filteredUsers = filteredUsers.filter(user => user.status === statusFilter);
    }
    
    setCurrentUsers(filteredUsers);
    setCurrentPage(1);
    setSelectedUsers(new Set());
  };

  // 应用筛选
  useEffect(() => {
    filterUsers();
  }, [searchTerm, roleFilter, statusFilter]);

  // 排序用户
  const sortUsers = () => {
    if (!sortField) return;
    
    const sortedUsers = [...currentUsers].sort((a, b) => {
      let aValue = a[sortField as keyof User];
      let bValue = b[sortField as keyof User];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase() as any;
        bValue = bValue.toLowerCase() as any;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setCurrentUsers(sortedUsers);
  };

  // 应用排序
  useEffect(() => {
    sortUsers();
  }, [sortField, sortOrder]);

  // 处理排序点击
  const handleSortClick = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // 处理分页
  const totalPages = Math.ceil(currentUsers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, currentUsers.length);
  const currentPageUsers = currentUsers.slice(startIndex, endIndex);

  // 处理全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pageUserIds = currentPageUsers.map(user => user.id);
      setSelectedUsers(new Set(pageUserIds));
    } else {
      setSelectedUsers(new Set());
    }
  };

  // 处理单选
  const handleSelectUser = (userId: number, checked: boolean) => {
    const newSelectedUsers = new Set(selectedUsers);
    if (checked) {
      newSelectedUsers.add(userId);
    } else {
      newSelectedUsers.delete(userId);
    }
    setSelectedUsers(newSelectedUsers);
  };

  // 检查是否全选
  const isAllSelected = currentPageUsers.length > 0 && 
    currentPageUsers.every(user => selectedUsers.has(user.id));

  // 打开用户模态框
  const openUserModal = (user: User | null = null) => {
    setEditingUser(user);
    if (user) {
      setFormData({
        username: user.username,
        role: user.role,
        user_number: user.user_number,
        name: user.name,
        password: '',
        status: user.status
      });
    } else {
      setFormData({
        username: '',
        role: '',
        user_number: '',
        name: '',
        password: '',
        status: 'active'
      });
    }
    setShowUserModal(true);
  };

  // 保存用户
  const saveUser = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('保存用户数据:', formData);
    alert('用户保存成功');
    setShowUserModal(false);
    setEditingUser(null);
  };

  // 编辑用户
  const editUser = (userId: number) => {
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      openUserModal(user);
    }
  };

  // 重置密码
  const resetPassword = (userId: number) => {
    if (confirm('确定要重置该用户的密码吗？')) {
      console.log('重置用户密码:', userId);
      alert('密码重置成功，新密码已发送到用户邮箱');
    }
  };

  // 删除用户
  const deleteUser = (userId: number) => {
    if (confirm('确定要删除该用户吗？此操作不可撤销。')) {
      console.log('删除用户:', userId);
      alert('用户删除成功');
      setSelectedUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  // 批量重置密码
  const batchResetPassword = () => {
    if (selectedUsers.size === 0) {
      alert('请选择要重置密码的用户');
      return;
    }
    if (confirm(`确定要重置选中的 ${selectedUsers.size} 个用户的密码吗？`)) {
      console.log('批量重置密码', Array.from(selectedUsers));
      alert('密码重置成功');
      setSelectedUsers(new Set());
    }
  };

  // 批量删除
  const batchDelete = () => {
    if (selectedUsers.size === 0) {
      alert('请选择要删除的用户');
      return;
    }
    if (confirm(`确定要删除选中的 ${selectedUsers.size} 个用户吗？此操作不可撤销。`)) {
      console.log('批量删除用户', Array.from(selectedUsers));
      alert('用户删除成功');
      setSelectedUsers(new Set());
    }
  };

  // 下载模板
  const downloadTemplate = () => {
    console.log('下载Excel模板');
  };

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };

  // 移除文件
  const removeFile = () => {
    setImportFile(null);
  };

  // 确认导入
  const confirmImport = () => {
    console.log('开始批量导入用户');
    alert('导入功能演示：文件上传成功，正在处理数据...');
    setShowImportModal(false);
    setImportFile(null);
  };

  // 退出登录
  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      navigate('/login');
    }
  };

  // 获取角色样式
  const getRoleClass = (role: string) => {
    switch(role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 获取角色文本
  const getRoleText = (role: string) => {
    switch(role) {
      case 'super_admin': return '超级管理员';
      case 'teacher': return '教师';
      case 'student': return '学生';
      default: return '未知角色';
    }
  };

  // 获取状态样式
  const getStatusClass = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    return status === 'active' ? '启用' : '停用';
  };

  // 渲染页码
  const renderPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              i === currentPage 
                ? 'bg-secondary text-white' 
                : 'border border-border-light hover:bg-gray-50'
            }`}
          >
            {i}
          </button>
        );
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push(
          <span key={`ellipsis-${i}`} className="px-2 text-sm text-text-secondary">
            ...
          </span>
        );
      }
    }
    return pages;
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
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
            </button>
            
            {/* 用户信息 */}
            <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors">
              <img 
                src="https://s.coze.cn/image/EYh_e8aK6NY/" 
                alt="超级管理员头像" 
                className="w-8 h-8 rounded-full" 
              />
              <div className="text-sm">
                <div className="font-medium text-text-primary">超级管理员</div>
                <div className="text-text-secondary">系统管理员</div>
              </div>
              <i className="fas fa-chevron-down text-xs text-text-secondary"></i>
            </div>
            
            {/* 退出登录 */}
            <button onClick={handleLogout} className="text-text-secondary hover:text-red-500 transition-colors">
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
            className={`${styles.navItem} ${styles.navItemActive} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors`}
          >
            <i className="fas fa-users text-lg"></i>
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
            <i className="fas fa-history text-lg"></i>
            <span className="font-medium">操作日志审计</span>
          </Link>
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="ml-64 mt-16 p-6 min-h-screen">
        {/* 页面头部 */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">用户管理</h2>
              <nav className="text-sm text-text-secondary">
                <span>首页</span>
                <i className="fas fa-chevron-right mx-2"></i>
                <span>用户管理</span>
              </nav>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowImportModal(true)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <i className="fas fa-upload mr-2"></i>批量导入
              </button>
              <button 
                onClick={() => openUserModal()}
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors"
              >
                <i className="fas fa-plus mr-2"></i>新增用户
              </button>
            </div>
          </div>
        </div>

        {/* 工具栏区域 */}
        <div className="bg-white rounded-xl shadow-card p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* 搜索框 */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="搜索用户名/学号/工号" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-80 px-4 py-2 pl-10 border border-border-light rounded-lg ${styles.formInputFocus}`}
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"></i>
              </div>
            </div>
            
            {/* 筛选条件 */}
            <div className="flex items-center space-x-4">
              <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className={`px-3 py-2 border border-border-light rounded-lg ${styles.formInputFocus}`}
              >
                <option value="">全部角色</option>
                <option value="super_admin">超级管理员</option>
                <option value="teacher">教师</option>
                <option value="student">学生</option>
              </select>
              
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`px-3 py-2 border border-border-light rounded-lg ${styles.formInputFocus}`}
              >
                <option value="">全部状态</option>
                <option value="active">启用</option>
                <option value="inactive">停用</option>
              </select>
              
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={isAllSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-border-light"
                />
                <span className="text-sm text-text-secondary">全选</span>
              </div>
              
              <div className="flex space-x-2">
                <button 
                  onClick={batchResetPassword}
                  className="px-3 py-2 text-sm border border-border-light rounded-lg hover:bg-gray-50 transition-colors"
                >
                  批量重置密码
                </button>
                <button 
                  onClick={batchDelete}
                  className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  批量删除
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 用户列表 */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider w-10">
                    <input 
                      type="checkbox" 
                      checked={isAllSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-border-light"
                    />
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary"
                    onClick={() => handleSortClick('username')}
                  >
                    用户名 <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary"
                    onClick={() => handleSortClick('role')}
                  >
                    角色 <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary"
                    onClick={() => handleSortClick('user_number')}
                  >
                    学号/工号 <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary"
                    onClick={() => handleSortClick('name')}
                  >
                    姓名 <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary"
                    onClick={() => handleSortClick('status')}
                  >
                    状态 <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary"
                    onClick={() => handleSortClick('created_at')}
                  >
                    创建时间 <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border-light">
                {currentPageUsers.map(user => (
                  <tr key={user.id} className={`${styles.tableRow} transition-colors`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        value={user.id}
                        checked={selectedUsers.has(user.id)}
                        onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                        className="rounded border-border-light"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{user.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium ${getRoleClass(user.role)} rounded-full`}>
                        {getRoleText(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{user.user_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium ${getStatusClass(user.status)} rounded-full`}>
                        {getStatusText(user.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{user.created_at}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button 
                        onClick={() => editUser(user.id)}
                        className="text-secondary hover:text-accent transition-colors"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        onClick={() => resetPassword(user.id)}
                        className="text-orange-500 hover:text-orange-700 transition-colors"
                      >
                        <i className="fas fa-key"></i>
                      </button>
                      <button 
                        onClick={() => deleteUser(user.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* 分页区域 */}
          <div className="px-6 py-4 border-t border-border-light flex items-center justify-between">
            <div className="text-sm text-text-secondary">
              显示 <span>{startIndex + 1}</span>-<span>{endIndex}</span> 条，共 <span>{currentUsers.length}</span> 条记录
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-border-light rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                上一页
              </button>
              <div className="flex space-x-1">
                {renderPageNumbers()}
              </div>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-border-light rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                下一页
              </button>
              <select 
                value={pageSize}
                onChange={(e) => {
                  setPageSize(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                className={`px-2 py-1 text-sm border border-border-light rounded-lg ${styles.formInputFocus}`}
              >
                <option value="10">10条/页</option>
                <option value="20">20条/页</option>
                <option value="50">50条/页</option>
              </select>
            </div>
          </div>
        </div>
      </main>

      {/* 新增/编辑用户模态框 */}
      {showUserModal && (
        <div className="fixed inset-0 z-50">
          <div className={styles.modalOverlay}></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`${styles.modalContent} bg-white rounded-xl shadow-xl w-full max-w-2xl`}>
              <div className="flex items-center justify-between p-6 border-b border-border-light">
                <h3 className="text-lg font-semibold text-text-primary">
                  {editingUser ? '编辑用户' : '新增用户'}
                </h3>
                <button 
                  onClick={() => {
                    setShowUserModal(false);
                    setEditingUser(null);
                  }}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              
              <form onSubmit={saveUser} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="form-username" className="block text-sm font-medium text-text-primary">
                      用户名 *
                    </label>
                    <input 
                      type="text" 
                      id="form-username" 
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({...prev, username: e.target.value}))}
                      disabled={editingUser !== null}
                      placeholder={editingUser ? '用户名不可修改' : ''}
                      required
                      className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.formInputFocus}`}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="form-role" className="block text-sm font-medium text-text-primary">
                      角色 *
                    </label>
                    <select 
                      id="form-role" 
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({...prev, role: e.target.value}))}
                      required
                      className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.formInputFocus}`}
                    >
                      <option value="">请选择角色</option>
                      <option value="teacher">教师</option>
                      <option value="student">学生</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="form-user-number" className="block text-sm font-medium text-text-primary">
                      学号/工号 *
                    </label>
                    <input 
                      type="text" 
                      id="form-user-number" 
                      value={formData.user_number}
                      onChange={(e) => setFormData(prev => ({...prev, user_number: e.target.value}))}
                      required
                      className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.formInputFocus}`}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="form-name" className="block text-sm font-medium text-text-primary">
                      姓名 *
                    </label>
                    <input 
                      type="text" 
                      id="form-name" 
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                      required
                      className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.formInputFocus}`}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="form-password" className="block text-sm font-medium text-text-primary">
                      密码
                    </label>
                    <input 
                      type="password" 
                      id="form-password" 
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                      placeholder="不填则使用默认密码"
                      className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.formInputFocus}`}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="form-status" className="block text-sm font-medium text-text-primary">
                      状态
                    </label>
                    <select 
                      id="form-status" 
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({...prev, status: e.target.value as 'active' | 'inactive'}))}
                      className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.formInputFocus}`}
                    >
                      <option value="active">启用</option>
                      <option value="inactive">停用</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border-light">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowUserModal(false);
                      setEditingUser(null);
                    }}
                    className="px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors"
                  >
                    保存
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 批量导入模态框 */}
      {showImportModal && (
        <div className="fixed inset-0 z-50">
          <div className={styles.modalOverlay}></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`${styles.modalContent} bg-white rounded-xl shadow-xl w-full max-w-lg`}>
              <div className="flex items-center justify-between p-6 border-b border-border-light">
                <h3 className="text-lg font-semibold text-text-primary">批量导入用户</h3>
                <button 
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                  }}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">
                      <i className="fas fa-info-circle mr-2"></i>使用说明
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• 请下载Excel模板并按照格式填写用户信息</li>
                      <li>• 支持批量导入教师和学生用户</li>
                      <li>• 导入时会自动校验数据格式</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <button 
                      onClick={downloadTemplate}
                      className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <i className="fas fa-download mr-2"></i>下载模板
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-text-primary">选择文件</label>
                    <div className="relative">
                      <input 
                        type="file" 
                        accept=".xlsx,.xls" 
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <button 
                        type="button" 
                        onClick={() => document.querySelector('input[type="file"]')?.click()}
                        className="w-full px-4 py-3 border-2 border-dashed border-border-light rounded-lg hover:border-secondary hover:bg-gray-50 transition-colors"
                      >
                        <i className="fas fa-cloud-upload-alt text-2xl text-text-secondary mb-2 block"></i>
                        <span className="text-text-secondary">点击选择文件或拖拽文件到此处</span>
                      </button>
                      {importFile && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-text-primary">{importFile.name}</span>
                            <button 
                              type="button" 
                              onClick={removeFile}
                              className="text-red-500 hover:text-red-700"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border-light">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowImportModal(false);
                      setImportFile(null);
                    }}
                    className="px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button 
                    type="button" 
                    onClick={confirmImport}
                    disabled={!importFile}
                    className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
                  >
                    <i className="fas fa-upload mr-2"></i>开始导入
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;

