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

  // 格式化时间显示
  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    
    try {
      let date: Date;
      
      // 处理各种时间格式
      if (dateString.includes('T')) {
        // ISO 格式：2024-01-01T12:00:00.000Z 或 2024-01-01T12:00:00+08:00
        date = new Date(dateString);
      } else if (dateString.includes(' ')) {
        // 标准格式：2024-01-01 12:00:00
        date = new Date(dateString);
      } else {
        // 尝试直接解析
        date = new Date(dateString);
      }
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        console.warn('无效的日期格式:', dateString);
        return dateString; // 返回原始字符串而不是 '-'
      }
      
      // 格式化为 YYYY-MM-DD HH:mm:ss
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      console.error('时间格式化错误:', error, '输入值:', dateString);
      return dateString; // 返回原始字符串而不是 '-'
    }
  };

  // 获取相对时间显示（可选功能）
  const getRelativeTime = (dateString: string) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffMinutes < 1) return '刚刚';
      if (diffMinutes < 60) return `${diffMinutes}分钟前`;
      if (diffHours < 24) return `${diffHours}小时前`;
      if (diffDays < 7) return `${diffDays}天前`;
      
      // 超过7天显示具体时间
      return formatDateTime(dateString);
    } catch (error) {
      console.error('相对时间计算错误:', error);
      return dateString;
    }
  };
  
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
  const [showBatchPasswordModal, setShowBatchPasswordModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<UserWithRole | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [batchPasswordData, setBatchPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
    resetMethod: 'set' as 'set' | 'random'
  });
  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
    resetMethod: 'set' as 'set' | 'random'
  });
  const [saving, setSaving] = useState(false);
  
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
  
  // 处理批量导出功能
  const handleBatchExport = async () => {
    try {
      // 如果有选中的用户，只导出选中的用户；否则导出当前页面的所有用户
      const usersToExport = selectedUsers.size > 0 
        ? users.filter(user => selectedUsers.has(user.id))
        : users;
      
      if (usersToExport.length === 0) {
        alert('没有可导出的用户数据');
        return;
      }
      
      // 格式化导出数据
      const exportData = usersToExport.map(user => {
        const role = roles.find(r => r.id === user.role_id);
        return {
          '用户ID': user.id,
          '用户名': user.username,
          '学号/工号': user.user_number,
          '姓名': user.full_name,
          '邮箱': user.email,
          '角色': role ? role.role_description : '-',
          '状态': getStatusText(user.status),
          '创建时间': formatDateTime(user.created_at),
          '最后登录时间': user.last_login_at ? formatDateTime(user.last_login_at) : '-',
          '密码修改时间': user.password_changed_at ? formatDateTime(user.password_changed_at) : '-'
        };
      });
      
      // 创建工作簿和工作表
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '用户数据');
      
      // 生成文件名
      const fileName = `用户数据_${new Date().toISOString().slice(0, 10)}_${new Date().getTime()}.xlsx`;
      
      // 导出文件
      XLSX.writeFile(workbook, fileName);
      
      // 显示成功提示
      alert(`成功导出 ${usersToExport.length} 条用户数据`);
    } catch (error) {
      console.error('导出用户数据失败:', error);
      alert('导出用户数据失败，请重试');
    }
  };

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
      console.log('编辑用户数据:', user); // 调试信息
      setFormData({
        username: user.username,
        role_id: user.role_id,
        user_number: user.user_number || '',
        full_name: user.full_name,
        email: user.email,
        password: '', // 编辑时默认不显示密码
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
    
    // 表单验证
    if (!formData.user_number.trim()) {
      alert('请输入学号/工号');
      return;
    }
    if (!formData.username.trim()) {
      alert('请输入用户名');
      return;
    }
    if (!formData.full_name.trim()) {
      alert('请输入姓名');
      return;
    }
    if (!formData.email.trim()) {
      alert('请输入邮箱');
      return;
    }
    if (!formData.role_id) {
      alert('请选择角色');
      return;
    }
    
    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('请输入有效的邮箱地址');
      return;
    }
    
    setSaving(true);
    
    try {
      if (editingUser) {
        // 编辑用户：只更新允许修改的字段
        const updateData: Partial<UserWithRole> = {
          full_name: formData.full_name,
          email: formData.email,
          role_id: formData.role_id,
          user_number: formData.user_number,
          status: formData.status,
          updated_at: new Date().toISOString()
        };
        
        // 如果输入了新密码，则更新密码
        if (formData.password && formData.password.trim()) {
          updateData.password = formData.password;
        }
        
        console.log('更新用户数据:', { userId: editingUser.id, updateData });
        await UserService.updateUser(editingUser.id, updateData);
        
        // 立即更新本地状态，避免重新加载
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === editingUser.id 
              ? { 
                  ...user, 
                  ...updateData,
                  // 如果有角色数据，更新角色名称
                  role: formData.role_id !== user.role_id 
                    ? roles.find(r => r.id === formData.role_id) || user.role
                    : user.role
                }
              : user
          )
        );
        
        alert('用户信息更新成功！');
        
      } else {
        // 新增用户
        await UserService.createUser(formData);
        alert('用户创建成功！');
        
        // 重新加载用户列表以获取新用户
        const searchParams: UserSearchParams = {
          keyword: searchTerm,
          role_id: roleFilter,
          status: statusFilter,
          page: 1, // 回到第一页显示新用户
          limit: pageSize,
          sort_by: sortField,
          sort_order: sortOrder
        };
        const response: UserListResponse = await UserService.getUsers(searchParams);
        setUsers(response.users);
        setTotalUsers(response.total);
        setCurrentPage(1);
      }
      
      // 关闭模态框并重置表单
      setShowUserModal(false);
      setEditingUser(null);
      setFormData({
        username: '',
        role_id: '',
        user_number: '',
        full_name: '',
        email: '',
        password: '',
        status: 'active'
      });
      
    } catch (error: any) {
      console.error('保存用户失败:', error);
      
      // 根据错误类型提供更友好的错误信息
      let errorMessage = '保存失败，请稍后重试';
      if (error.message) {
        if (error.message.includes('duplicate key') || error.message.includes('already exists')) {
          if (error.message.includes('user_number')) {
            errorMessage = '学号/工号已存在，请使用其他学号/工号';
          } else if (error.message.includes('email')) {
            errorMessage = '邮箱已被使用，请使用其他邮箱';
          } else if (error.message.includes('username')) {
            errorMessage = '用户名已存在，请使用其他用户名';
          }
        } else if (error.message.includes('permission')) {
          errorMessage = '权限不足，无法执行此操作';
        } else if (error.message.includes('network')) {
          errorMessage = '网络连接失败，请检查网络后重试';
        } else {
          errorMessage = `保存失败：${error.message}`;
        }
      }
      
      alert(errorMessage);
    } finally {
      setSaving(false);
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
  const resetPassword = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setResetPasswordUser(user);
      setResetPasswordData({ newPassword: '', confirmPassword: '', resetMethod: 'set' });
      setShowResetPasswordModal(true);
    }
  };

  // 切换用户状态
  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      setSaving(true);
      
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await UserService.updateUser(userId, { status: newStatus });
      
      // 更新本地状态
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );
      
      alert(`用户状态已${newStatus === 'active' ? '启用' : '停止'}`);
    } catch (error) {
      console.error('切换用户状态失败:', error);
      alert(`切换用户状态失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setSaving(false);
    }
  };

  // 批量切换用户状态
  const batchToggleUserStatus = async (targetStatus: 'active' | 'inactive') => {
    if (selectedUsers.length === 0) {
      alert('请先选择要操作的用户');
      return;
    }

    try {
      setSaving(true);
      
      // 批量更新用户状态
      let successCount = 0;
      for (const userId of selectedUsers) {
        try {
          await UserService.updateUser(userId, { status: targetStatus });
          successCount++;
        } catch (error) {
          console.error(`更新用户 ${userId} 状态失败:`, error);
        }
      }
      
      // 更新本地状态
      setUsers(prevUsers => 
        prevUsers.map(user => 
          selectedUsers.has(user.id) ? { ...user, status: targetStatus } : user
        )
      );
      
      // 清空选中状态
      setSelectedUsers(new Set());
      
      alert(`成功${targetStatus === 'active' ? '启用' : '停止'} ${successCount}/${selectedUsers.length} 个用户`);
    } catch (error) {
      console.error('批量切换用户状态失败:', error);
      alert(`批量操作失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setSaving(false);
    }
  };

  // 执行用户密码重置
  const executeResetPassword = async () => {
    if (!resetPasswordUser) return;
    
    try {
      setSaving(true);
      
      // 验证密码（无论哪种模式都需要验证）
      if (!resetPasswordData.newPassword) {
        alert('请输入新密码');
        return;
      }
      if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
        alert('两次输入的密码不一致');
        return;
      }
      
      // 两种模式都使用batchSetPassword方法，确保前端显示的密码与后端设置的密码一致
      await UserService.batchSetPassword([resetPasswordUser.id], resetPasswordData.newPassword);
      
      alert('密码重置成功，新密码已设置');
      setShowResetPasswordModal(false);
      setResetPasswordUser(null);
    } catch (error) {
      console.error('重置密码失败:', error);
      alert('重置密码失败');
    } finally {
      setSaving(false);
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

  // 批量修改密码
  const batchResetPassword = async () => {
    if (selectedUsers.size === 0) {
      alert('请选择要重置密码的用户');
      return;
    }
    // 打开批量修改密码模态框
    setShowBatchPasswordModal(true);
  };

  // 执行批量修改密码
  const executeBatchPasswordChange = async () => {
    const { newPassword, confirmPassword, resetMethod } = batchPasswordData;

    // 验证输入
    if (resetMethod === 'set') {
      if (!newPassword.trim()) {
        alert('请输入新密码');
        return;
      }
      if (newPassword.length < 6) {
        alert('密码长度不能少于6位');
        return;
      }
      if (newPassword !== confirmPassword) {
        alert('两次输入的密码不一致');
        return;
      }
    }

    if (!confirm(`确定要修改选中的 ${selectedUsers.size} 个用户的密码吗？`)) {
      return;
    }

    try {
      const selectedUserIds = Array.from(selectedUsers);
      
      if (resetMethod === 'set') {
        // 设置统一密码
        await UserService.batchSetPassword(selectedUserIds, newPassword);
        alert(`成功为 ${selectedUserIds.length} 个用户设置新密码`);
      } else {
        // 生成随机密码
        await UserService.batchResetPassword(selectedUserIds);
        alert(`成功为 ${selectedUserIds.length} 个用户重置密码，新密码已发送到邮箱`);
      }

      setShowBatchPasswordModal(false);
      setSelectedUsers(new Set());
      setBatchPasswordData({ newPassword: '', confirmPassword: '', resetMethod: 'set' });
      
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
      console.error('批量修改密码失败:', error);
      alert('批量修改密码失败');
    }
  };

  // 生成随机密码
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setBatchPasswordData(prev => ({ ...prev, newPassword: password, confirmPassword: password }));
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
      ['用户名', '角色', '学号/工号', '姓名', '邮箱', '密码', '状态'],
      ['teacher_zhang', 'teacher', 'T2024001', '张老师', 'zhang@example.com', 'pwd123456', 'active'],
      ['student_li', 'student', '2021001', '李同学', 'li@example.com', 'stud123', 'active'],
      ['admin_wang', 'super_admin', 'ADMIN001', '王管理员', 'wang@example.com', 'admin888', 'active'],
      ['', '', '', '', '', '', ''],
      ['说明：', '', '', '', '', '', ''],
      ['1. 角色字段支持：super_admin(超级管理员), teacher(教师), student(学生)', '', '', '', '', '', ''],
      ['2. 状态字段支持：active(启用), inactive(停用)', '', '', '', '', '', ''],
      ['3. 学号/工号必须是唯一的', '', '', '', '', '', ''],
      ['4. 邮箱格式必须正确', '', '', '', '', '', ''],
      ['5. 学号/工号不能为空，必须唯一', '', '', '', '', '', ''],
      ['6. 密码可以为空，为空时使用默认密码123456', '', '', '', '', '', ''],
      ['7. 建议设置6-20位密码，包含字母和数字', '', '', '', '', '', '']
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
      {wch: 15}, // 密码列
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
                if (!row['学号/工号']) {
                  console.log('跳过：学号/工号为空', row);
                  continue;
                }
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
                
                if (roleId && row['学号/工号'] && row['用户名'] && row['姓名'] && row['邮箱']) {
                  // 获取密码，如果为空则使用空字符串让UserService使用默认密码
                  const password = row['密码'] ? String(row['密码']).trim() : '';
                  
                  importData.push({
                    username: row['用户名'],
                    full_name: row['姓名'],
                    email: row['邮箱'],
                    user_number: row['学号/工号'] || '',
                    role_id: roleId,
                    status: row['状态'] === 'active' ? 'active' : 'inactive',
                    password: password // 使用文件中设置的密码，如果为空则使用默认密码
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
                if (!row['学号/工号']) {
                  console.log('跳过：学号/工号为空', row);
                  continue;
                }
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
                
                if (roleId && row['学号/工号'] && row['用户名'] && row['姓名'] && row['邮箱']) {
                  // 获取密码，如果为空则使用空字符串让UserService使用默认密码
                  const password = row['密码'] ? String(row['密码']).trim() : '';
                  
                  importData.push({
                    username: row['用户名'],
                    full_name: row['姓名'],
                    email: row['邮箱'],
                    user_number: row['学号/工号'] || '',
                    role_id: roleId,
                    status: row['状态'] === 'active' ? 'active' : 'inactive',
                    password: password // 使用文件中设置的密码，如果为空则使用默认密码
                  });
                } else {
                  console.log('跳过：角色匹配失败或必填字段缺失', row);
                }
              }
            }
          }
          
          console.log('最终导入数据:', importData);
          
          if (importData.length === 0) {
            alert('没有找到可导入的用户数据。请检查：\n1. 文件格式是否正确（支持.xlsx, .xls, .csv格式）\n2. 数据是否按照最新模板格式填写（包含密码列）\n3. 角色名称是否正确（teacher/教师, student/学生, super_admin/超级管理员）\n4. 必填字段是否完整（学号/工号、用户名、姓名、邮箱）\n5. 学号/工号必须唯一且不能为空\n6. 密码字段可以为空，为空时使用默认密码123456');
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
                onClick={handleBatchExport}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <i className="fas fa-download mr-2"></i>批量导出
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
                  placeholder="搜索学号/工号/用户名/邮箱" 
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
                  批量修改密码
                </button>
                <button 
                  onClick={() => batchToggleUserStatus('inactive')}
                  className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  批量停用
                </button>
                <button 
                  onClick={() => batchToggleUserStatus('active')}
                  className="px-3 py-2 text-sm border border-green-300 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                >
                  批量启用
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
                    <td 
                      className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary font-mono cursor-help" 
                      title={`原始时间: ${user.created_at}\n格式化时间: ${formatDateTime(user.created_at)}`}
                    >
                      {formatDateTime(user.created_at)}
                    </td>
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
                        onClick={() => toggleUserStatus(user.id, user.status)}
                        className={`${user.status === 'active' ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'} transition-colors`}
                      >
                        {user.status === 'active' ? <i className="fas fa-ban"></i> : <i className="fas fa-play"></i>}
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
                      用户名
                      {editingUser && <span className="text-text-secondary text-xs ml-2">(可修改)</span>}
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        id="form-username" 
                        value={formData.username}
                        onChange={(e) => setFormData(prev => ({...prev, username: e.target.value}))}
                        className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.formInputFocus}`}
                      />
                    </div>
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
                      {editingUser && <span className="text-text-secondary text-xs ml-2">(不可修改)</span>}
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        id="form-user-number" 
                        value={formData.user_number}
                        onChange={(e) => setFormData(prev => ({...prev, user_number: e.target.value}))}
                        disabled={editingUser !== null}
                        required
                        className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.formInputFocus} ${editingUser ? 'bg-gray-50 text-gray-500' : ''}`}
                      />
                      {editingUser && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <i className="fas fa-lock text-gray-400 text-sm"></i>
                        </div>
                      )}
                    </div>
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
                      {editingUser && <span className="text-text-secondary text-xs ml-2">(留空则不修改)</span>}
                    </label>
                    <input 
                      type="password" 
                      id="form-password" 
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                      placeholder={editingUser ? "留空则不修改当前密码" : "不填则使用默认密码123456"}
                      className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.formInputFocus}`}
                    />
                    {formData.password && formData.password.length > 0 && formData.password.length < 6 && (
                      <p className="text-xs text-red-500 mt-1">密码长度不能少于6位</p>
                    )}
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
                    disabled={saving}
                    className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {saving ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>保存中...</span>
                      </>
                    ) : (
                      <span>保存</span>
                    )}
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
                      <li>• 请下载最新Excel模板并按照格式填写用户信息</li>
                      <li>• 支持批量导入教师和学生用户</li>
                      <li>• 密码字段：可以为空，为空时使用默认密码123456</li>
                      <li>• 建议设置6-20位个性化密码，包含字母和数字</li>
                      <li>• 用户主要使用学号/工号登录，也可使用用户名登录</li>
                      <li>• 导入时会自动校验数据格式和加密密码</li>
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

      {/* 重置密码模态框 */}
      {showResetPasswordModal && resetPasswordUser && (
        <div className="fixed inset-0 z-50">
          <div className={styles.modalOverlay}></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`${styles.modalContent} bg-white rounded-xl shadow-xl w-full max-w-2xl`}>
              <div className="flex items-center justify-between p-6 border-b border-border-light">
                <h3 className="text-lg font-semibold text-text-primary">
                  重置用户密码 - {resetPasswordUser.full_name}
                </h3>
                <button 
                  onClick={() => {
                    setShowResetPasswordModal(false);
                    setResetPasswordUser(null);
                    setResetPasswordData({ newPassword: '', confirmPassword: '', resetMethod: 'set' });
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
                      <i className="fas fa-info-circle mr-2"></i>操作说明
                    </h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>• 用户名: {resetPasswordUser.username}</p>
                      <p>• 学号/工号: {resetPasswordUser.user_number}</p>
                      <p>• 可以手动设置密码或生成随机密码</p>
                      <p>• 修改后用户需要使用新密码登录</p>
                    </div>
                  </div>

                  {/* 重置方式选择 */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-text-primary">重置方式</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="resetMethod" 
                          value="set" 
                          checked={resetPasswordData.resetMethod === 'set'} 
                          onChange={(e) => setResetPasswordData(prev => ({ ...prev, resetMethod: 'set' }))} 
                          className="rounded border-border-light" 
                        />
                        <span className="text-sm text-text-primary">手动设置密码</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="resetMethod" 
                          value="random" 
                          checked={resetPasswordData.resetMethod === 'random'} 
                          onChange={(e) => {
                            // 生成随机密码
                            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                            let password = '';
                            for (let i = 0; i < 8; i++) {
                              password += chars.charAt(Math.floor(Math.random() * chars.length));
                            }
                            setResetPasswordData(prev => ({ 
                              ...prev, 
                              resetMethod: 'random',
                              newPassword: password,
                              confirmPassword: password
                            }));
                          }} 
                          className="rounded border-border-light" 
                        />
                        <span className="text-sm text-text-primary">生成随机密码</span>
                      </label>
                    </div>
                  </div>

                  {/* 手动设置密码 */}
                  {resetPasswordData.resetMethod === 'set' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="reset-new-password" className="block text-sm font-medium text-text-primary">
                          新密码 *
                        </label>
                        <input 
                          type="password" 
                          id="reset-new-password"
                          value={resetPasswordData.newPassword}
                          onChange={(e) => setResetPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          placeholder="请输入新密码"
                          className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.formInputFocus}`}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="reset-confirm-password" className="block text-sm font-medium text-text-primary">
                          确认密码 *
                        </label>
                        <input 
                          type="password" 
                          id="reset-confirm-password"
                          value={resetPasswordData.confirmPassword}
                          onChange={(e) => setResetPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="请再次输入新密码"
                          className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.formInputFocus}`}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <button 
                    type="button"
                    onClick={() => {
                      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                      let password = '';
                      for (let i = 0; i < 8; i++) {
                        password += chars.charAt(Math.floor(Math.random() * chars.length));
                      }
                      setResetPasswordData(prev => ({ ...prev, newPassword: password, confirmPassword: password }));
                    }}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    <i className="fas fa-dice mr-2"></i>生成随机密码
                  </button>
                      </div>
                    </div>
                  )}

                  {/* 随机密码说明和显示 */}
                  {resetPasswordData.resetMethod === 'random' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="text-sm text-yellow-800">
                          <p className="font-medium mb-2">
                            <i className="fas fa-exclamation-triangle mr-2"></i>随机密码说明
                          </p>
                          <p>• 系统将为用户生成8位随机密码</p>
                          <p>• 新密码包含字母和数字的组合</p>
                          <p>• 密码已显示在上方输入框中</p>
                          <p>• 在生产环境中，密码将通过邮件发送给用户</p>
                        </div>
                      </div>
                      
                      {/* 显示生成的随机密码 */}
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-sm text-text-primary font-medium">生成的随机密码:</p>
                        <p className="text-lg font-bold text-primary mt-1">{resetPasswordData.newPassword}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border-light">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowResetPasswordModal(false);
                      setResetPasswordUser(null);
                      setResetPasswordData({ newPassword: '', confirmPassword: '', resetMethod: 'set' });
                    }}
                    className="px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button 
                    type="button" 
                    onClick={executeResetPassword}
                    disabled={saving}
                    className={`px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {saving ? (
                      <span className="flex items-center">
                        <i className="fas fa-spinner fa-spin mr-2"></i>处理中...
                      </span>
                    ) : (
                      '确定重置'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 批量修改密码模态框 */}
      {showBatchPasswordModal && (
        <div className="fixed inset-0 z-50">
          <div className={styles.modalOverlay}></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`${styles.modalContent} bg-white rounded-xl shadow-xl w-full max-w-2xl`}>
              <div className="flex items-center justify-between p-6 border-b border-border-light">
                <h3 className="text-lg font-semibold text-text-primary">
                  批量修改密码
                </h3>
                <button 
                  onClick={() => {
                    setShowBatchPasswordModal(false);
                    setBatchPasswordData({ newPassword: '', confirmPassword: '', resetMethod: 'set' });
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
                      <i className="fas fa-info-circle mr-2"></i>操作说明
                    </h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>• 已选择 <span className="font-bold">{selectedUsers.size}</span> 个用户进行密码修改</p>
                      <p>• 可以设置统一密码或生成随机密码</p>
                      <p>• 修改后用户需要使用新密码登录</p>
                    </div>
                  </div>

                  {/* 重置方式选择 */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-text-primary">重置方式</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="resetMethod"
                          value="set"
                          checked={batchPasswordData.resetMethod === 'set'}
                          onChange={(e) => setBatchPasswordData(prev => ({ ...prev, resetMethod: 'set' }))}
                          className="rounded border-border-light"
                        />
                        <span className="text-sm text-text-primary">设置统一密码</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="resetMethod"
                          value="random"
                          checked={batchPasswordData.resetMethod === 'random'}
                          onChange={(e) => setBatchPasswordData(prev => ({ ...prev, resetMethod: 'random' }))}
                          className="rounded border-border-light"
                        />
                        <span className="text-sm text-text-primary">生成随机密码</span>
                      </label>
                    </div>
                  </div>

                  {/* 统一密码设置 */}
                  {batchPasswordData.resetMethod === 'set' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="batch-new-password" className="block text-sm font-medium text-text-primary">
                          新密码 *
                        </label>
                        <input 
                          type="password" 
                          id="batch-new-password"
                          value={batchPasswordData.newPassword}
                          onChange={(e) => setBatchPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          placeholder="请输入新密码"
                          className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.formInputFocus}`}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="batch-confirm-password" className="block text-sm font-medium text-text-primary">
                          确认密码 *
                        </label>
                        <input 
                          type="password" 
                          id="batch-confirm-password"
                          value={batchPasswordData.confirmPassword}
                          onChange={(e) => setBatchPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="请再次输入新密码"
                          className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.formInputFocus}`}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <button 
                          type="button"
                          onClick={generateRandomPassword}
                          className="w-full px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          <i className="fas fa-dice mr-2"></i>生成随机密码
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 随机密码说明 */}
                  {batchPasswordData.resetMethod === 'random' && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium mb-2">
                          <i className="fas fa-exclamation-triangle mr-2"></i>随机密码说明
                        </p>
                        <p>• 系统将为每个用户生成8位随机密码</p>
                        <p>• 新密码包含字母和数字的组合</p>
                        <p>• 在开发环境中，密码将在操作完成后显示</p>
                        <p>• 在生产环境中，密码将通过邮件发送给用户</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border-light">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowBatchPasswordModal(false);
                      setBatchPasswordData({ newPassword: '', confirmPassword: '', resetMethod: 'set' });
                    }}
                    className="px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button 
                    type="button" 
                    onClick={executeBatchPasswordChange}
                    className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors"
                  >
                    <i className="fas fa-key mr-2"></i>
                    {batchPasswordData.resetMethod === 'set' ? '确认设置' : '确认重置'}
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