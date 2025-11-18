

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

interface Role {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  icon: string;
  gradient: string;
  isDeletable: boolean;
}

interface Permission {
  value: string;
  label: string;
  group: string;
}

const AdminRolePermission: React.FC = () => {
  const navigate = useNavigate();
  
  // 状态管理
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentRoleId, setCurrentRoleId] = useState<string | null>(null);
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);
  const [deleteRoleName, setDeleteRoleName] = useState('');
  const [currentRoleName, setCurrentRoleName] = useState('');
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // 角色数据
  const roles: Role[] = [
    {
      id: '1',
      name: '超级管理员',
      description: '系统最高权限，可管理所有功能模块',
      createdAt: '2024-01-01 09:00',
      icon: 'fas fa-user-shield',
      gradient: 'from-secondary to-accent',
      isDeletable: false
    },
    {
      id: '2',
      name: '辅导员',
      description: '负责学生管理、学业指导、毕业去向跟踪等工作',
      createdAt: '2024-01-01 09:30',
      icon: 'fas fa-chalkboard-teacher',
      gradient: 'from-green-400 to-green-600',
      isDeletable: true
    },
    {
      id: '3',
      name: '学生',
      description: '查看个人档案、修改个人信息、填报毕业去向等',
      createdAt: '2024-01-01 10:00',
      icon: 'fas fa-user-graduate',
      gradient: 'from-blue-400 to-blue-600',
      isDeletable: true
    },
    {
      id: '4',
      name: '教务员',
      description: '负责课程管理、成绩录入、学籍管理等教务工作',
      createdAt: '2024-01-02 14:00',
      icon: 'fas fa-user-cog',
      gradient: 'from-orange-400 to-orange-600',
      isDeletable: true
    },
    {
      id: '5',
      name: '就业指导老师',
      description: '专注于学生就业指导、毕业去向管理等工作',
      createdAt: '2024-01-03 16:30',
      icon: 'fas fa-user-tie',
      gradient: 'from-purple-400 to-purple-600',
      isDeletable: true
    }
  ];

  // 权限数据
  const permissions: Permission[] = [
    { value: 'user_manage', label: '用户管理', group: 'system' },
    { value: 'role_manage', label: '角色权限管理', group: 'system' },
    { value: 'system_settings', label: '系统设置', group: 'system' },

    { value: 'view_student_profile', label: '查看学生档案', group: 'student' },
    { value: 'edit_student_info', label: '编辑学生信息', group: 'student' },
    { value: 'batch_import_students', label: '批量导入学生', group: 'student' },
    { value: 'enter_grades', label: '录入成绩', group: 'academic' },
    { value: 'view_grades', label: '查看成绩', group: 'academic' },
    { value: 'academic_analysis', label: '学业统计分析', group: 'academic' },
    { value: 'view_graduation', label: '查看毕业去向', group: 'graduation' },
    { value: 'approve_graduation', label: '审核毕业去向', group: 'graduation' },
    { value: 'graduation_stats', label: '毕业去向统计', group: 'graduation' },
    { value: 'view_reports', label: '查看统计报表', group: 'report' },
    { value: 'export_reports', label: '导出报表', group: 'report' }
  ];

  const permissionGroups = [
    { id: 'system', label: '系统管理' },
    { id: 'student', label: '学生管理' },
    { id: 'academic', label: '学业管理' },
    { id: 'graduation', label: '毕业去向管理' },
    { id: 'report', label: '统计报表' }
  ];

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '角色权限管理 - 学档通';
    return () => { document.title = originalTitle; };
  }, []);

  // 搜索过滤
  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 加载角色权限配置
  const loadRolePermissions = (roleId: string) => {
    const rolePermissions: { [key: string]: string[] } = {
      '1': ['user_manage', 'role_manage', 'system_settings', 'log_audit', 
            'view_student_profile', 'edit_student_info', 'batch_import_students',
            'enter_grades', 'view_grades', 'academic_analysis',
            'view_graduation', 'approve_graduation', 'graduation_stats',
            'view_reports', 'export_reports'],
      '2': ['view_student_profile', 'edit_student_info', 
            'enter_grades', 'view_grades', 
            'view_graduation', 'approve_graduation', 'graduation_stats',
            'view_reports', 'export_reports'],
      '3': ['view_student_profile'],
      '4': ['view_student_profile', 'edit_student_info', 
            'enter_grades', 'view_grades', 'academic_analysis',
            'view_reports'],
      '5': ['view_student_profile', 
            'view_graduation', 'approve_graduation', 'graduation_stats',
            'view_reports', 'export_reports']
    };
    
    setSelectedPermissions(rolePermissions[roleId] || []);
  };

  // 检查权限组是否全选
  const isGroupAllSelected = (group: string) => {
    const groupPermissions = permissions.filter(p => p.group === group);
    return groupPermissions.length > 0 && 
           groupPermissions.every(p => selectedPermissions.includes(p.value));
  };

  // 检查权限组是否部分选中
  const isGroupIndeterminate = (group: string) => {
    const groupPermissions = permissions.filter(p => p.group === group);
    const selectedInGroup = groupPermissions.filter(p => selectedPermissions.includes(p.value));
    return selectedInGroup.length > 0 && selectedInGroup.length < groupPermissions.length;
  };

  // 处理权限组全选
  const handleGroupSelect = (group: string, checked: boolean) => {
    const groupPermissions = permissions.filter(p => p.group === group);
    if (checked) {
      setSelectedPermissions(prev => [...prev, ...groupPermissions.map(p => p.value)]);
    } else {
      setSelectedPermissions(prev => prev.filter(p => !groupPermissions.map(gp => gp.value).includes(p)));
    }
  };

  // 处理单个权限选择
  const handlePermissionSelect = (permission: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permission]);
    } else {
      setSelectedPermissions(prev => prev.filter(p => p !== permission));
    }
  };

  // 事件处理函数
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddRoleClick = () => {
    setShowAddRoleModal(true);
    setRoleName('');
    setRoleDescription('');
  };

  const handleCloseAddModal = () => {
    setShowAddRoleModal(false);
  };

  const handleAddRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      alert('请输入角色名称');
      return;
    }
    
    console.log('新增角色:', { roleName, roleDescription });
    alert('角色创建成功');
    setShowAddRoleModal(false);
    window.location.reload();
  };

  const handleEditPermissionClick = (role: Role) => {
    setCurrentRoleId(role.id);
    setCurrentRoleName(role.name);
    setShowPermissionModal(true);
    loadRolePermissions(role.id);
  };

  const handleClosePermissionModal = () => {
    setShowPermissionModal(false);
  };

  const handlePermissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('保存权限配置:', { roleId: currentRoleId, permissions: selectedPermissions });
    alert('权限配置保存成功');
    setShowPermissionModal(false);
  };

  const handleDeleteRoleClick = (role: Role) => {
    if (!role.isDeletable) return;
    setDeleteRoleId(role.id);
    setDeleteRoleName(role.name);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleConfirmDelete = () => {
    console.log('删除角色:', { roleId: deleteRoleId });
    alert('角色删除成功');
    setShowDeleteModal(false);
    window.location.reload();
  };

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      navigate('/login');
    }
  };

  const handleModalOverlayClick = (e: React.MouseEvent, closeModal: () => void) => {
    if (e.target === e.currentTarget) {
      closeModal();
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
            {/* 用户信息 */}
            <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors">
              <img src="https://s.coze.cn/image/-YVkyc5y_so/" 
                   alt="超级管理员头像" className="w-8 h-8 rounded-full" />
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
          <Link to="/admin-dashboard" className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}>
            <i className="fas fa-home text-lg"></i>
            <span className="font-medium">超级管理平台</span>
          </Link>
          
          <Link to="/admin-user-management" className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}>
            <i className="fas fa-users text-lg"></i>
            <span className="font-medium">用户管理</span>
          </Link>
          
          <Link to="/admin-role-permission" className={`${styles.navItem} ${styles.navItemActive} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors`}>
            <i className="fas fa-shield-alt text-lg"></i>
            <span className="font-medium">角色权限管理</span>
          </Link>
          
          <Link to="/admin-system-settings" className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}>
            <i className="fas fa-cog text-lg"></i>
            <span className="font-medium">系统设置</span>
          </Link>
          

        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="ml-64 mt-16 p-6 min-h-screen">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">角色权限管理</h2>
              <nav className="text-sm text-text-secondary">
                <span>首页</span>
                <i className="fas fa-chevron-right mx-2"></i>
                <span>角色权限管理</span>
              </nav>
            </div>
            <button onClick={handleAddRoleClick} className="bg-secondary hover:bg-accent text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
              <i className="fas fa-plus"></i>
              <span>新增角色</span>
            </button>
          </div>
        </div>

        {/* 工具栏区域 */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"></i>
              <input 
                type="text" 
                placeholder="搜索角色名称" 
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent w-64"
              />
            </div>
          </div>
        </div>

        {/* 角色列表 */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          {/* 表格头部 */}
          <div className="px-6 py-4 border-b border-border-light">
            <h4 className="font-medium text-text-primary">角色列表</h4>
          </div>
          
          {/* 角色表格 */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">角色名称</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">描述</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">创建时间</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border-light">
                {filteredRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 bg-gradient-to-br ${role.gradient} rounded-lg flex items-center justify-center mr-3`}>
                          <i className={`${role.icon} text-white text-sm`}></i>
                        </div>
                        <span className="font-medium text-text-primary">{role.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-primary">{role.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{role.createdAt}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button 
                        onClick={() => handleEditPermissionClick(role)}
                        className="text-secondary hover:text-accent transition-colors"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        onClick={() => handleDeleteRoleClick(role)}
                        disabled={!role.isDeletable}
                        className="text-text-secondary hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <i className="fas fa-trash"></i>
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
              显示 1-{filteredRoles.length} 条，共 {roles.length} 条记录
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm border border-border-light rounded-lg hover:bg-gray-50 transition-colors" disabled>
                上一页
              </button>
              <button className="px-3 py-1 text-sm bg-secondary text-white rounded-lg">1</button>
              <button className="px-3 py-1 text-sm border border-border-light rounded-lg hover:bg-gray-50 transition-colors" disabled>
                下一页
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 新增角色模态框 */}
      {showAddRoleModal && (
        <div className="fixed inset-0 z-50">
          <div className={styles.modalOverlay} onClick={(e) => handleModalOverlayClick(e, handleCloseAddModal)}></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`${styles.modalContent} bg-white rounded-xl shadow-xl w-full max-w-md`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">新增角色</h3>
                  <button onClick={handleCloseAddModal} className="text-text-secondary hover:text-text-primary transition-colors">
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <form onSubmit={handleAddRoleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="role-name" className="block text-sm font-medium text-text-primary mb-2">角色名称 *</label>
                    <input 
                      type="text" 
                      id="role-name" 
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="role-description" className="block text-sm font-medium text-text-primary mb-2">角色描述</label>
                    <textarea 
                      id="role-description" 
                      rows={3}
                      value={roleDescription}
                      onChange={(e) => setRoleDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent resize-none"
                    ></textarea>
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button 
                      type="button" 
                      onClick={handleCloseAddModal}
                      className="flex-1 px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      取消
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 px-4 py-2 bg-secondary hover:bg-accent text-white rounded-lg transition-colors"
                    >
                      保存
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 权限配置模态框 */}
      {showPermissionModal && (
        <div className="fixed inset-0 z-50">
          <div className={styles.modalOverlay} onClick={(e) => handleModalOverlayClick(e, handleClosePermissionModal)}></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`${styles.modalContent} bg-white rounded-xl shadow-xl w-full max-w-4xl`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">
                    权限配置 - <span>{currentRoleName}</span>
                  </h3>
                  <button onClick={handleClosePermissionModal} className="text-text-secondary hover:text-text-primary transition-colors">
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <form onSubmit={handlePermissionSubmit} className="space-y-6">
                  {/* 权限列表 */}
                  <div className="space-y-4">
                    {permissionGroups.map((group) => (
                      <div key={group.id} className="permission-group">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-3">
                          <h4 className="font-medium text-text-primary">{group.label}</h4>
                          <input 
                            type="checkbox" 
                            checked={isGroupAllSelected(group.id)}
                            ref={(input) => {
                              if (input) input.indeterminate = isGroupIndeterminate(group.id);
                            }}
                            onChange={(e) => handleGroupSelect(group.id, e.target.checked)}
                            className="group-checkbox"
                          />
                        </div>
                        <div className="pl-4 space-y-2">
                          {permissions
                            .filter(p => p.group === group.id)
                            .map((permission) => (
                              <label 
                                key={permission.value}
                                className={`${styles.permissionItem} flex items-center justify-between p-2 rounded cursor-pointer`}
                                onClick={(e) => {
                                  if (e.target instanceof HTMLInputElement) return;
                                  const checkbox = e.currentTarget.querySelector('input[type="checkbox"]') as HTMLInputElement;
                                  if (checkbox) {
                                    checkbox.checked = !checkbox.checked;
                                    handlePermissionSelect(permission.value, !checkbox.checked);
                                  }
                                }}
                              >
                                <span className="text-sm text-text-primary">{permission.label}</span>
                                <input 
                                  type="checkbox" 
                                  value={permission.value}
                                  checked={selectedPermissions.includes(permission.value)}
                                  onChange={(e) => handlePermissionSelect(permission.value, e.target.checked)}
                                  className={`${group.id}-permission`}
                                />
                              </label>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex space-x-3 pt-4 border-t border-border-light">
                    <button 
                      type="button" 
                      onClick={handleClosePermissionModal}
                      className="flex-1 px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      取消
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 px-4 py-2 bg-secondary hover:bg-accent text-white rounded-lg transition-colors"
                    >
                      保存权限
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认模态框 */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50">
          <div className={styles.modalOverlay} onClick={(e) => handleModalOverlayClick(e, handleCloseDeleteModal)}></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`${styles.modalContent} bg-white rounded-xl shadow-xl w-full max-w-sm`}>
              <div className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">确认删除</h3>
                  <p className="text-text-secondary mb-6">
                    确定要删除角色 "<span>{deleteRoleName}</span>" 吗？删除后将无法恢复。
                  </p>
                  <div className="flex space-x-3">
                    <button 
                      onClick={handleCloseDeleteModal}
                      className="flex-1 px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      取消
                    </button>
                    <button 
                      onClick={handleConfirmDelete}
                      className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRolePermission;

