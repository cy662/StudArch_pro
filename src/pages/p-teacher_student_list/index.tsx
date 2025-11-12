

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

interface Student {
  id: number;
  student_number: string;
  name: string;
  class: string;
  status: 'enrolled' | 'suspended' | 'withdrawn' | 'graduated' | 'completed';
  phone: string;
  avatar: string;
}

interface StatusMap {
  text: string;
  class: string;
}

const TeacherStudentList: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 模拟学生数据
  const [studentsData, setStudentsData] = useState<Student[]>([
    {
      id: 1,
      student_number: '2021001',
      name: '李小明',
      class: '计算机科学与技术1班',
      status: 'enrolled',
      phone: '138****1234',
      avatar: 'https://s.coze.cn/image/n6Nq_jtc1k8/'
    },
    {
      id: 2,
      student_number: '2021002',
      name: '王小红',
      class: '软件工程2班',
      status: 'graduated',
      phone: '139****5678',
      avatar: 'https://s.coze.cn/image/wkvgED4VfKE/'
    },
    {
      id: 3,
      student_number: '2021003',
      name: '张大力',
      class: '计算机科学与技术1班',
      status: 'enrolled',
      phone: '136****9012',
      avatar: 'https://s.coze.cn/image/AQLLR7kknmo/'
    },
    {
      id: 4,
      student_number: '2021004',
      name: '刘美丽',
      class: '软件工程2班',
      status: 'suspended',
      phone: '137****3456',
      avatar: 'https://s.coze.cn/image/sXKywMzIbas/'
    },
    {
      id: 5,
      student_number: '2021005',
      name: '陈志强',
      class: '计算机科学与技术3班',
      status: 'enrolled',
      phone: '135****7890',
      avatar: 'https://s.coze.cn/image/1k-TSTYpWzQ/'
    },
    {
      id: 6,
      student_number: '2021006',
      name: '赵文静',
      class: '计算机科学与技术2班',
      status: 'enrolled',
      phone: '138****2345',
      avatar: 'https://s.coze.cn/image/zXUcVqarVLY/'
    },
    {
      id: 7,
      student_number: '2021007',
      name: '孙建华',
      class: '软件工程1班',
      status: 'withdrawn',
      phone: '139****6789',
      avatar: 'https://s.coze.cn/image/Zb-ENkqz49c/'
    },
    {
      id: 8,
      student_number: '2021008',
      name: '周雅婷',
      class: '计算机科学与技术3班',
      status: 'completed',
      phone: '136****0123',
      avatar: 'https://s.coze.cn/image/GRUl60n8Tjc/'
    },
    {
      id: 9,
      student_number: '2021009',
      name: '吴志华',
      class: '计算机科学与技术2班',
      status: 'enrolled',
      phone: '137****4567',
      avatar: 'https://s.coze.cn/image/NZvVbnuLkqk/'
    },
    {
      id: 10,
      student_number: '2021010',
      name: '郑晓雯',
      class: '软件工程1班',
      status: 'enrolled',
      phone: '135****8901',
      avatar: 'https://s.coze.cn/image/Np8Sa9LcKRU/'
    }
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [filteredData, setFilteredData] = useState<Student[]>(studentsData);
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);

  // 状态映射
  const statusMap: Record<string, StatusMap> = {
    'enrolled': { text: '在读', class: 'bg-green-100 text-green-800' },
    'suspended': { text: '休学', class: 'bg-orange-100 text-orange-800' },
    'withdrawn': { text: '退学', class: 'bg-red-100 text-red-800' },
    'graduated': { text: '毕业', class: 'bg-blue-100 text-blue-800' },
    'completed': { text: '结业', class: 'bg-purple-100 text-purple-800' }
  };

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '我的学生 - 学档通';
    return () => { document.title = originalTitle; };
  }, []);

  // 筛选数据
  useEffect(() => {
    const filtered = studentsData.filter(student => {
      const matchesSearch = !searchTerm || 
        student.student_number.includes(searchTerm) ||
        student.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesClass = !classFilter || student.class === getClassName(classFilter);
      const matchesStatus = !statusFilter || student.status === statusFilter;

      return matchesSearch && matchesClass && matchesStatus;
    });

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchTerm, classFilter, statusFilter, studentsData]);

  const getClassName = (value: string): string => {
    const classMap: Record<string, string> = {
      'cs1': '计算机科学与技术1班',
      'cs2': '计算机科学与技术2班',
      'cs3': '计算机科学与技术3班',
      'se1': '软件工程1班',
      'se2': '软件工程2班'
    };
    return classMap[value] || '';
  };

  const getClassValue = (className: string): string => {
    const classMap: Record<string, string> = {
      '计算机科学与技术1班': 'cs1',
      '计算机科学与技术2班': 'cs2',
      '计算机科学与技术3班': 'cs3',
      '软件工程1班': 'se1',
      '软件工程2班': 'se2'
    };
    return classMap[className] || '';
  };

  const handleSelectAll = (checked: boolean) => {
    const currentPageData = getCurrentPageData();
    if (checked) {
      const newSelected = new Set(selectedStudents);
      currentPageData.forEach(student => newSelected.add(student.id));
      setSelectedStudents(newSelected);
    } else {
      const newSelected = new Set(selectedStudents);
      currentPageData.forEach(student => newSelected.delete(student.id));
      setSelectedStudents(newSelected);
    }
  };

  const handleStudentSelect = (studentId: number, checked: boolean) => {
    const newSelected = new Set(selectedStudents);
    if (checked) {
      newSelected.add(studentId);
    } else {
      newSelected.delete(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const getCurrentPageData = (): Student[] => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  };

  const getTotalPages = (): number => {
    return Math.ceil(filteredData.length / pageSize);
  };

  const isAllSelected = (): boolean => {
    const currentPageData = getCurrentPageData();
    return currentPageData.length > 0 && currentPageData.every(student => selectedStudents.has(student.id));
  };

  const isIndeterminate = (): boolean => {
    const currentPageData = getCurrentPageData();
    const selectedCount = currentPageData.filter(student => selectedStudents.has(student.id)).length;
    return selectedCount > 0 && selectedCount < currentPageData.length;
  };

  const handleSort = (field: keyof Student) => {
    const sorted = [...filteredData].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return -1;
      if (aValue > bValue) return 1;
      return 0;
    });
    
    setFilteredData(sorted);
  };

  const handlePageChange = (page: number) => {
    const totalPages = getTotalPages();
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setIsStudentModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = (formData: Partial<Student>) => {
    if (editingStudent) {
      // 编辑学生
      setStudentsData(prev => prev.map(student => 
        student.id === editingStudent.id ? { ...student, ...formData } : student
      ));
    } else {
      // 新增学生
      const newStudent: Student = {
        id: Math.max(...studentsData.map(s => s.id)) + 1,
        ...formData,
        avatar: 'https://s.coze.cn/image/zycTkZ9PWs0/'
      } as Student;
      setStudentsData(prev => [...prev, newStudent]);
    }

    setIsStudentModalOpen(false);
    setEditingStudent(null);
  };

  const handleBatchDelete = () => {
    if (selectedStudents.size > 0 && confirm('确定要删除选中的学生吗？')) {
      setStudentsData(prev => prev.filter(student => !selectedStudents.has(student.id)));
      setSelectedStudents(new Set());
    }
  };

  const handleBatchResetPassword = () => {
    if (selectedStudents.size > 0) {
      // 实际应用中这里会处理密码重置逻辑
      alert('批量重置密码功能');
    }
  };

  const handleImportFile = (file: File) => {
    setImportFile(file);
  };

  const handleConfirmImport = () => {
    if (importFile) {
      console.log('开始导入文件:', importFile.name);
      // 实际应用中这里会处理文件上传和数据导入
      alert('文件导入功能');
      setIsImportModalOpen(false);
      setImportFile(null);
    }
  };

  const handleDownloadTemplate = () => {
    console.log('下载Excel模板');
    // 实际应用中这里会触发文件下载
    alert('模板下载功能');
  };

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      navigate('/login');
    }
  };

  const renderPaginationNumbers = () => {
    const totalPages = getTotalPages();
    const pages = [];
    
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(
          <button
            key={i}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              i === currentPage 
                ? 'bg-secondary text-white' 
                : 'border border-border-light hover:bg-gray-50'
            }`}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </button>
        );
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push(
          <span key={`ellipsis-${i}`} className="px-2 text-text-secondary">
            ...
          </span>
        );
      }
    }
    
    return pages;
  };

  const currentPageData = getCurrentPageData();
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, filteredData.length);

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
                src="https://s.coze.cn/image/hatzc53pi4k/" 
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
            to="/teacher-dashboard" 
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-home text-lg"></i>
            <span className="font-medium">教师管理平台</span>
          </Link>
          
          <Link 
            to="/teacher-student-list" 
            className={`${styles.navItem} ${styles.navItemActive} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors`}
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
              <h2 className="text-2xl font-bold text-text-primary mb-2">我的学生</h2>
              <nav className="text-sm text-text-secondary">
                <span>首页</span>
                <i className="fas fa-chevron-right mx-2"></i>
                <span>我的学生</span>
              </nav>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => setIsImportModalOpen(true)}
                className="px-4 py-2 bg-white border border-border-light rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <i className="fas fa-upload text-secondary"></i>
                <span className="text-text-primary">批量导入</span>
              </button>
              <button 
                onClick={handleAddStudent}
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors flex items-center space-x-2"
              >
                <i className="fas fa-plus"></i>
                <span>新增学生</span>
              </button>
            </div>
          </div>
        </div>

        {/* 工具栏区域 */}
        <div className="bg-white rounded-xl shadow-card p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* 搜索框 */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"></i>
                <input 
                  type="text" 
                  placeholder="搜索学号或姓名" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 pr-4 py-2 border border-border-light rounded-lg w-64 ${styles.searchInput}`}
                />
              </div>
              
              {/* 筛选条件 */}
              <select 
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className={`px-4 py-2 border border-border-light rounded-lg ${styles.filterSelect}`}
              >
                <option value="">全部班级</option>
                <option value="cs1">计算机科学与技术1班</option>
                <option value="cs2">计算机科学与技术2班</option>
                <option value="cs3">计算机科学与技术3班</option>
                <option value="se1">软件工程1班</option>
                <option value="se2">软件工程2班</option>
              </select>
              
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`px-4 py-2 border border-border-light rounded-lg ${styles.filterSelect}`}
              >
                <option value="">全部状态</option>
                <option value="enrolled">在读</option>
                <option value="suspended">休学</option>
                <option value="withdrawn">退学</option>
                <option value="graduated">毕业</option>
                <option value="completed">结业</option>
              </select>
            </div>
            
            {/* 批量操作 */}
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleBatchDelete}
                disabled={selectedStudents.size === 0}
                className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <i className="fas fa-trash"></i>
                <span>批量删除</span>
              </button>
              <button 
                onClick={handleBatchResetPassword}
                disabled={selectedStudents.size === 0}
                className="px-4 py-2 text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <i className="fas fa-key"></i>
                <span>批量重置密码</span>
              </button>
            </div>
          </div>
        </div>

        {/* 学生列表 */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    <input 
                      type="checkbox" 
                      checked={isAllSelected()}
                      ref={(input) => {
                        if (input) input.indeterminate = isIndeterminate();
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-border-light"
                    />
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary"
                    onClick={() => handleSort('student_number')}
                  >
                    学号 <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary"
                    onClick={() => handleSort('name')}
                  >
                    姓名 <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary"
                    onClick={() => handleSort('class')}
                  >
                    班级 <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary"
                    onClick={() => handleSort('status')}
                  >
                    学籍状态 <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">联系方式</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border-light">
                {currentPageData.map(student => (
                  <tr key={student.id} className={styles.tableRow}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        checked={selectedStudents.has(student.id)}
                        onChange={(e) => handleStudentSelect(student.id, e.target.checked)}
                        className="rounded border-border-light"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{student.student_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img 
                          className="h-8 w-8 rounded-full mr-3" 
                          src={student.avatar} 
                          alt={`${student.name}头像`}
                        />
                        <Link 
                          to={`/teacher-student-detail?studentId=${student.id}`}
                          className="text-secondary hover:text-accent font-medium"
                        >
                          {student.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{student.class}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium ${statusMap[student.status].class} rounded-full`}>
                        {statusMap[student.status].text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{student.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <Link 
                        to={`/teacher-student-detail?studentId=${student.id}`}
                        className="text-secondary hover:text-accent transition-colors" 
                        title="查看档案"
                      >
                        <i className="fas fa-eye"></i>
                      </Link>
                      <button 
                        onClick={() => handleEditStudent(student)}
                        className="text-text-secondary hover:text-secondary transition-colors" 
                        title="编辑信息"
                      >
                        <i className="fas fa-edit"></i>
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
              显示 <span>{filteredData.length > 0 ? startIndex : 0}</span>-<span>{endIndex}</span> 条，共 <span>{filteredData.length}</span> 条记录
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-border-light rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <div className="flex space-x-1">
                {renderPaginationNumbers()}
              </div>
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === getTotalPages()}
                className="px-3 py-1 text-sm border border-border-light rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 新增/编辑学生模态弹窗 */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-border-light">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-text-primary">
                    {editingStudent ? '编辑学生' : '新增学生'}
                  </h3>
                  <button 
                    onClick={() => {
                      setIsStudentModalOpen(false);
                      setEditingStudent(null);
                    }}
                    className="text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>
              <StudentForm 
                student={editingStudent}
                onSave={handleSaveStudent}
                onCancel={() => {
                  setIsStudentModalOpen(false);
                  setEditingStudent(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 批量导入模态弹窗 */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-border-light">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-text-primary">批量导入学生</h3>
                  <button 
                    onClick={() => {
                      setIsImportModalOpen(false);
                      setImportFile(null);
                    }}
                    className="text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="text-center p-6 border-2 border-dashed border-border-light rounded-lg">
                    <i className="fas fa-file-excel text-4xl text-green-500 mb-3"></i>
                    <p className="text-text-primary font-medium mb-2">上传Excel文件</p>
                    <p className="text-sm text-text-secondary">支持 .xlsx 格式，单次最多导入1000条</p>
                    <input 
                      type="file" 
                      accept=".xlsx,.xls" 
                      className="hidden"
                      ref={fileInputRef}
                      onChange={(e) => e.target.files && e.target.files[0] && handleImportFile(e.target.files[0])}
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-3 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors"
                    >
                      选择文件
                    </button>
                  </div>
                  {importFile && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-text-primary">{importFile.name}</span>
                        <button 
                          onClick={() => setImportFile(null)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  )}
                  <div>
                    <button 
                      onClick={handleDownloadTemplate}
                      className="w-full px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                    >
                      <i className="fas fa-download text-secondary"></i>
                      <span className="text-text-primary">下载模板</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-border-light flex justify-end space-x-3">
                <button 
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setImportFile(null);
                  }}
                  className="px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={handleConfirmImport}
                  disabled={!importFile}
                  className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
                >
                  开始导入
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 学生表单组件
interface StudentFormProps {
  student: Student | null;
  onSave: (data: Partial<Student>) => void;
  onCancel: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ student, onSave, onCancel }) => {
  const getClassName = (value: string): string => {
    const classMap: Record<string, string> = {
      'cs1': '计算机科学与技术1班',
      'cs2': '计算机科学与技术2班',
      'cs3': '计算机科学与技术3班',
      'se1': '软件工程1班',
      'se2': '软件工程2班'
    };
    return classMap[value] || '';
  };

  const getClassValue = (className: string): string => {
    const classMap: Record<string, string> = {
      '计算机科学与技术1班': 'cs1',
      '计算机科学与技术2班': 'cs2',
      '计算机科学与技术3班': 'cs3',
      '软件工程1班': 'se1',
      '软件工程2班': 'se2'
    };
    return classMap[className] || '';
  };

  const [formData, setFormData] = useState({
    student_number: student?.student_number || '',
    name: student?.name || '',
    class: getClassValue(student?.class || ''),
    status: student?.status || 'enrolled',
    phone: student?.phone || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      student_number: formData.student_number,
      name: formData.name,
      class: getClassName(formData.class),
      status: formData.status,
      phone: formData.phone
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="student-number" className="block text-sm font-medium text-text-primary mb-2">学号 *</label>
          <input 
            type="text" 
            id="student-number" 
            value={formData.student_number}
            onChange={(e) => setFormData(prev => ({ ...prev, student_number: e.target.value }))}
            required
            className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:border-secondary"
          />
        </div>
        <div>
          <label htmlFor="student-name" className="block text-sm font-medium text-text-primary mb-2">姓名 *</label>
          <input 
            type="text" 
            id="student-name" 
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:border-secondary"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="student-class" className="block text-sm font-medium text-text-primary mb-2">班级 *</label>
          <select 
            id="student-class" 
            value={formData.class}
            onChange={(e) => setFormData(prev => ({ ...prev, class: e.target.value }))}
            required
            className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:border-secondary"
          >
            <option value="">请选择班级</option>
            <option value="cs1">计算机科学与技术1班</option>
            <option value="cs2">计算机科学与技术2班</option>
            <option value="cs3">计算机科学与技术3班</option>
            <option value="se1">软件工程1班</option>
            <option value="se2">软件工程2班</option>
          </select>
        </div>
        <div>
          <label htmlFor="student-status" className="block text-sm font-medium text-text-primary mb-2">学籍状态 *</label>
          <select 
            id="student-status" 
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Student['status'] }))}
            required
            className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:border-secondary"
          >
            <option value="enrolled">在读</option>
            <option value="suspended">休学</option>
            <option value="withdrawn">退学</option>
            <option value="graduated">毕业</option>
            <option value="completed">结业</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="student-phone" className="block text-sm font-medium text-text-primary mb-2">联系方式</label>
        <input 
          type="tel" 
          id="student-phone" 
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:border-secondary"
        />
      </div>
      <div className="p-6 border-t border-border-light flex justify-end space-x-3">
        <button 
          type="button"
          onClick={onCancel}
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
  );
};

export default TeacherStudentList;

