import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import UserService from '../../services/userService_fixed';
import { UserWithRole, UserSearchParams, UserListResponse } from '../../types/user';
import * as XLSX from 'xlsx';

interface UserFormData {
  username: string;
  role_id: string;
  user_number: string;
  full_name: string;
  email: string;
  password: string;
  status: 'active' | 'inactive';
}

const AdminUserManagement: React.FC = () => {
  const navigate = useNavigate();
  
  // 状态管理
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  
  // 表单数据
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    role_id: '',
    user_number: '',
    full_name: '',
    email: '',
    password: '',
    status: 'active'
  });

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '用户管理 - 学档通';
    return () => { document.title = originalTitle; };
  }, []);

  // 加载角色列表
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const rolesData = await UserService.getRoles();
        setRoles(rolesData);
      } catch (error) {
        console.error('加载角色列表失败:', error);
        alert('加载角色列表失败');
      }
    };
    
    loadRoles();
  }, []);

  // 加载用户数据
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const searchParams: UserSearchParams = {
          keyword: searchTerm,
          role_id: roleFilter,
          status: statusFilter,
          page: currentPage,
          limit: pageSize,
          sort_by: sortField,
          sort_order: sortOrder
        };
        
        const response: UserListResponse = await UserService.getUsers(searchParams);
        setUsers(response.users);
        setTotalUsers(response.total);
      } catch (error) {
        console.error('加载用户数据失败:', error);
        alert('加载用户数据失败');
      } finally {
        setLoading(false);
      }
    };
    
    loadUsers();
  }, [currentPage, pageSize, sortField, sortOrder, searchTerm, roleFilter, statusFilter]);

  // 处理排序点击
  const handleSortClick = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // 计算分页信息
  const totalPages = Math.ceil(totalUsers / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(startIndex + pageSize - 1, totalUsers);

  // 处理全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pageUserIds = users.map(user => user.id);
      setSelectedUsers(new Set(pageUserIds));
    } else {
      setSelectedUsers(new Set());
    }
  };

  // 处理单选
  const handleSelectUser = (userId: string, checked: boolean) => {
    const newSelectedUsers = new Set(selectedUsers);
    if (checked) {
      newSelectedUsers.add(userId);
    } else {
      newSelectedUsers.delete(userId);
    }
    setSelectedUsers(newSelectedUsers);
  };

  // 检查是否全选
  const isAllSelected = users.length > 0 && 
    users.every(user => selectedUsers.has(user.id));

  // 打开用户模态框
  const openUserModal = (user: UserWithRole | null = null) => {
    setEditingUser(user);
    if (user) {
      setFormData({
        username: user.username,
        role_id: user.role_id,
        user_number: user.user_number || '',
        full_name: user.full_name,
        email: user.email,
        password: '',
        status: user.status === 'active' || user.status === 'inactive' ? user.status as 'active' | 'inactive' : 'active'
      });
    } else {
      setFormData({
        username: '',
        role_id: '',
        user_number: '',
        full_name: '',
        email: '',
        password: '',
        status: 'active'
      });
    }
    setShowUserModal(true);
  };

  // 保存用户
  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await UserService.updateUser(editingUser.id, formData);
        alert('用户更新成功');
      } else {
        await UserService.createUser(formData);
        alert('用户创建成功');
      }
      setShowUserModal(false);
      setEditingUser(null);
      // 重新加载用户列表
      const searchParams: UserSearchParams = {
        keyword: searchTerm,
        role_id: roleFilter,
        status: statusFilter,
        page: currentPage,
        limit: pageSize,
        sort_by: sortField,
        sort_order: sortOrder
      };
      const response: UserListResponse = await UserService.getUsers(searchParams);
      setUsers(response.users);
      setTotalUsers(response.total);
    } catch (error) {
      console.error('保存用户失败:', error);
      alert('保存用户失败');
    }
  };

  // 编辑用户
  const editUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      openUserModal(user);
    }
  };

  // 重置密码
  const resetPassword = async (userId: string) => {
    if (confirm('确定要重置该用户的密码吗？')) {
      try {
        await UserService.batchResetPassword([userId]);
        alert('密码重置成功，新密码已发送到用户邮箱');
      } catch (error) {
        console.error('重置密码失败:', error);
        alert('重置密码失败');
      }
    }
  };

  // 删除用户
  const deleteUser = async (userId: string) => {
    if (confirm('确定要删除该用户吗？此操作不可撤销。')) {
      try {
        await UserService.deleteUser(userId);
        alert('用户删除成功');
        setSelectedUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
        // 重新加载用户列表
        const searchParams: UserSearchParams = {
          keyword: searchTerm,
          role_id: roleFilter,
          status: statusFilter,
          page: currentPage,
          limit: pageSize,
          sort_by: sortField,
          sort_order: sortOrder
        };
        const response: UserListResponse = await UserService.getUsers(searchParams);
        setUsers(response.users);
        setTotalUsers(response.total);
      } catch (error) {
        console.error('删除用户失败:', error);
        alert('删除用户失败');
      }
    }
  };

  // 批量重置密码
  const batchResetPassword = async () => {
    if (selectedUsers.size === 0) {
      alert('请选择要重置密码的用户');
      return;
    }
    if (confirm(`确定要重置选中的 ${selectedUsers.size} 个用户的密码吗？`)) {
      try {
        await UserService.batchResetPassword(Array.from(selectedUsers));
        alert('密码重置成功');
        setSelectedUsers(new Set());
      } catch (error) {
        console.error('批量重置密码失败:', error);
        alert('批量重置密码失败');
      }
    }
  };

  // 批量删除
  const batchDelete = async () => {
    if (selectedUsers.size === 0) {
      alert('请选择要删除的用户');
      return;
    }
    if (confirm(`确定要删除选中的 ${selectedUsers.size} 个用户吗？此操作不可撤销。`)) {
      try {
        for (const userId of selectedUsers) {
          await UserService.deleteUser(userId);
        }
        alert('用户删除成功');
        setSelectedUsers(new Set());
        // 重新加载用户列表
        const searchParams: UserSearchParams = {
          keyword: searchTerm,
          role_id: roleFilter,
          status: statusFilter,
          page: currentPage,
          limit: pageSize,
          sort_by: sortField,
          sort_order: sortOrder
        };
        const response: UserListResponse = await UserService.getUsers(searchParams);
        setUsers(response.users);
        setTotalUsers(response.total);
      } catch (error) {
        console.error('批量删除失败:', error);
        alert('批量删除失败');
      }
    }
  };

  // 下载模板
  const downloadTemplate = () => {
    // 创建Excel模板数据
    const templateData = [
      ['用户名', '角色', '学号/工号', '姓名', '邮箱', '状态'],
      ['teacher_zhang', 'teacher', 'T2024001', '张老师', 'zhang@example.com', 'active'],
      ['student_li', 'student', '2021001', '李同学', 'li@example.com', 'active'],
      ['admin_wang', 'super_admin', 'ADMIN001', '王管理员', 'wang@example.com', 'active'],
      ['', '', '', '', '', ''],
      ['说明：', '', '', '', '', ''],
      ['1. 角色字段支持：super_admin(超级管理员), teacher(教师), student(学生)', '', '', '', '', ''],
      ['2. 状态字段支持：active(启用), inactive(停用)', '', '', '', '', ''],
      ['3. 用户名必须是唯一的', '', '', '', '', ''],
      ['4. 邮箱格式必须正确', '', '', '', '', ''],
      ['5. 学号/工号可以为空', '', '', '', '', '']
    ];

    // 创建真正的Excel文件
    const worksheet = XLSX.utils.aoa_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '用户导入模板');
    
    // 设置列宽（可选，让Excel文件更美观）
    const colWidths = [
      {wch: 15}, // 用户名列
      {wch: 15}, // 角色列
      {wch: 15}, // 学号/工号列
      {wch: 15}, // 姓名列
      {wch: 20}, // 邮箱列
      {wch: 10}  // 状态列
    ];
    worksheet['!cols'] = colWidths;

    // 生成Excel文件
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '用户导入模板.xlsx';
    a.click();
    URL.revokeObjectURL(url);
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
  const confirmImport = async () => {
    if (!importFile) return;
    
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = e.target?.result as ArrayBuffer;
          console.log('文件内容:', data);
          
          let importData: any[] = [];
          
          // 检查文件类型，处理Excel文件
          if (importFile.name.endsWith('.xlsx') || importFile.name.endsWith('.xls')) {
            // 解析Excel文件
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // 将Excel数据转换为JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
            console.log('Excel解析后的数据:', jsonData);
            
            if (jsonData.length < 2) {
              alert('Excel文件内容为空或格式不正确，请检查文件格式');
              return;
            }
            
            // 解析表头
            const headers = jsonData[0].map((header: any) => 
              String(header).replace(/"/g, '').trim()
            );
            console.log('Excel表头:', headers);
            
            // 处理数据行
            for (let i = 1; i < jsonData.length; i++) {
              const rowData = jsonData[i];
              if (rowData && rowData.length > 0) {
                const row: any = {};
                
                headers.forEach((header, index) => {
                  row[header] = rowData[index] ? String(rowData[index]).trim() : '';
                });
                
                // 映射角色名称到角色ID
                let roleId = '';
                const roleValue = row['角色'] || '';
                
                if (roleValue === 'teacher' || roleValue === '教师') {
                  roleId = roles.find(r => r.role_name === 'teacher')?.id || '';
                } else if (roleValue === 'student' || roleValue === '学生') {
                  roleId = roles.find(r => r.role_name === 'student')?.id || '';
                } else if (roleValue === 'super_admin' || roleValue === '超级管理员') {
                  roleId = roles.find(r => r.role_name === 'super_admin')?.id || '';
                }
                
                console.log('Excel行数据处理:', row, '角色ID:', roleId);
                
                // 检查必填字段
                if (!row['用户名']) {
                  console.log('跳过：用户名为空', row);
                  continue;
                }
                if (!row['姓名']) {
                  console.log('跳过：姓名为空', row);
                  continue;
                }
                if (!row['邮箱']) {
                  console.log('跳过：邮箱为空', row);
                  continue;
                }
                
                if (roleId && row['用户名'] && row['姓名'] && row['邮箱']) {
                  importData.push({
                    username: row['用户名'],
                    full_name: row['姓名'],
                    email: row['邮箱'],
                    user_number: row['学号/工号'] || '',
                    role_id: roleId,
                    status: row['状态'] === 'active' ? 'active' : 'inactive',
                    password: '123456' // 默认密码，UserService会映射到password_hash
                  });
                } else {
                  console.log('跳过：角色匹配失败或必填字段缺失', row);
                }
              }
            }
            
          } else {
            // 处理CSV文件（原有逻辑）
            const content = new TextDecoder().decode(data);
            console.log('CSV文件内容:', content);
            
            // 改进的CSV解析：处理各种换行符和编码
            const lines = content
              .replace(/\r\n/g, '\n')  // 统一换行符
              .replace(/\r/g, '\n')   // 处理Mac格式
              .split('\n')
              .filter(line => line.trim() && !line.includes('说明：'));
            console.log('CSV解析后的行数:', lines.length);
            
            if (lines.length < 2) {
              alert('CSV文件内容为空或格式不正确，请检查文件格式');
              return;
            }
            
            // 解析表头，去除引号
            const headers = lines[0].split(',').map(header => 
              header.replace(/"/g, '').trim()
            );
            console.log('CSV表头:', headers);
            
            for (let i = 1; i < lines.length; i++) {
              if (lines[i].trim()) {
                // 改进数据行解析：去除引号
                const values = lines[i].split(',').map(value => 
                  value.replace(/"/g, '').trim()
                );
                const row: any = {};
                
                headers.forEach((header, index) => {
                  row[header] = values[index] || '';
                });
                
                // 映射角色名称到角色ID
                let roleId = '';
                const roleValue = row['角色'] || '';
                
                if (roleValue === 'teacher' || roleValue === '教师') {
                  roleId = roles.find(r => r.role_name === 'teacher')?.id || '';
                } else if (roleValue === 'student' || roleValue === '学生') {
                  roleId = roles.find(r => r.role_name === 'student')?.id || '';
                } else if (roleValue === 'super_admin' || roleValue === '超级管理员') {
                  roleId = roles.find(r => r.role_name === 'super_admin')?.id || '';
                }
                
                console.log('CSV行数据处理:', row, '角色ID:', roleId);
                
                // 检查必填字段
                if (!row['用户名']) {
                  console.log('跳过：用户名为空', row);
                  continue;
                }
                if (!row['姓名']) {
                  console.log('跳过：姓名为空', row);
                  continue;
                }
                if (!row['邮箱']) {
                  console.log('跳过：邮箱为空', row);
                  continue;
                }
                
                if (roleId && row['用户名'] && row['姓名'] && row['邮箱']) {
                  importData.push({
                    username: row['用户名'],
                    full_name: row['姓名'],
                    email: row['邮箱'],
                    user_number: row['学号/工号'] || '',
                    role_id: roleId,
                    status: row['状态'] === 'active' ? 'active' : 'inactive',
                    password: '123456' // 默认密码，UserService会映射到password_hash
                  });
                } else {
                  console.log('跳过：角色匹配失败或必填字段缺失', row);
                }
              }
            }
          }
          
          console.log('最终导入数据:', importData);
          
          if (importData.length === 0) {
            alert('没有找到可导入的用户数据。请检查：\n1. 文件格式是否正确（支持.xlsx, .xls, .csv格式）\n2. 数据是否按照模板格式填写\n3. 角色名称是否正确（teacher/教师, student/学生, super_admin/超级管理员）\n4. 必填字段是否完整（用户名、姓名、邮箱）');
            return;
          }
          
          // 批量导入用户
          let successCount = 0;
          let errorCount = 0;
          
          for (const userData of importData) {
            try {
              await UserService.createUser(userData);
              successCount++;
              console.log('成功导入用户:', userData.username);
            } catch (error) {
              console.error(`导入用户失败: ${userData.username}`, error);
              errorCount++;
            }
          }
          
          alert(`导入完成！成功导入 ${successCount} 个用户，失败 ${errorCount} 个用户`);
          setShowImportModal(false);
          setImportFile(null);
          
          // 重新加载用户列表
          const searchParams: UserSearchParams = {
            keyword: searchTerm,
            role_id: roleFilter,
            status: statusFilter,
            page: currentPage,
            limit: pageSize,
            sort_by: sortField,
            sort_order: sortOrder
          };
          const response: UserListResponse = await UserService.getUsers(searchParams);
          setUsers(response.users);
          setTotalUsers(response.total);
          
        } catch (error) {
          console.error('解析文件失败:', error);
          alert('文件格式错误，请检查模板格式。支持.xlsx, .xls, .csv格式的文件。');
        }
      };
      
      reader.onerror = () => {
        alert('文件读取失败，请重试');
      };
      
      // 根据文件类型选择读取方式
      if (importFile.name.endsWith('.xlsx') || importFile.name.endsWith('.xls')) {
        reader.readAsArrayBuffer(importFile);
      } else {
        reader.readAsText(importFile);
      }
      
    } catch (error) {
      console.error('导入失败:', error);
      alert('导入失败，请检查文件格式');
    }
  };

  // 退出登录
  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      navigate('/login');
    }
  };

  // 获取角色文本
  const getRoleText = (roleName: string) => {
    const role = roles.find(r => r.role_name === roleName);
    if (role) return role.role_description;
    
    // 默认角色映射
    switch(roleName) {
      case 'super_admin': return '超级管理员';
      case 'teacher': return '教师';
      case 'student': return '学生';
      default: return '未知角色';
    }
  };

  // 获取角色样式
  const getRoleClass = (roleName: string) => {
    switch(roleName) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 获取可用的角色列表（如果没有从数据库获取到，使用默认值）
  const getAvailableRoles = () => {
    if (roles.length > 0) {
      return roles;
    }
    
    // 默认角色列表
    return [
      { id: '1', role_name: 'super_admin', role_description: '超级管理员' },
      { id: '2', role_name: 'teacher', role_description: '教师' },
      { id: '3', role_name: 'student', role_description: '学生' }
    ];
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
                {getAvailableRoles().map(role => (
                  <option key={role.id} value={role.id}>
                    {role.role_description}
                  </option>
                ))}
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
                    onClick={() => handleSortClick('full_name')}
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
                {users.map(user => (
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
                      <span className={`px-2 py-1 text-xs font-medium ${getRoleClass(user.role?.role_name)} rounded-full`}>
                        {getRoleText(user.role?.role_name)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{user.user_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{user.full_name}</td>
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
              显示 <span>{startIndex}</span>-<span>{endIndex}</span> 条，共 <span>{totalUsers}</span> 条记录
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
                      value={formData.role_id}
                      onChange={(e) => setFormData(prev => ({...prev, role_id: e.target.value}))}
                      required
                      className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.formInputFocus}`}
                    >
                      <option value="">请选择角色</option>
                      {getAvailableRoles().map(role => (
                        <option key={role.id} value={role.id}>
                          {role.role_description}
                        </option>
                      ))}
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
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({...prev, full_name: e.target.value}))}
                      required
                      className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.formInputFocus}`}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="form-email" className="block text-sm font-medium text-text-primary">
                      邮箱 *
                    </label>
                    <input 
                      type="email" 
                      id="form-email" 
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
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
                        accept=".csv,.xlsx,.xls" 
                        onChange={handleFileChange}
                        className="hidden"
                        id="import-file"
                      />
                      <button 
                        type="button" 
                        onClick={() => document.getElementById('import-file')?.click()}
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