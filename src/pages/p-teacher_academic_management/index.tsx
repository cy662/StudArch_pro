

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

interface AcademicRecord {
  id: string;
  studentId: string;
  name: string;
  avatar: string;
  className: string;
  course: string;
  semester: string;
  grade: number;
  credit: number;
  gpa: number;
}

interface GradeFormData {
  student: string;
  course: string;
  semester: string;
  grade: string;
  credit: string;
}

const TeacherAcademicManagement: React.FC = () => {
  const navigate = useNavigate();
  
  // 状态管理
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showBatchImportModal, setShowBatchImportModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [gradeFormData, setGradeFormData] = useState<GradeFormData>({
    student: '',
    course: '',
    semester: '',
    grade: '',
    credit: ''
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // 模拟数据
  const [academicRecords] = useState<AcademicRecord[]>([
    {
      id: 'grade1',
      studentId: '2021001',
      name: '李小明',
      avatar: 'https://s.coze.cn/image/KT7I-QzPN7k/',
      className: '计算机科学与技术1班',
      course: '高等数学',
      semester: '2023-2024学年第1学期',
      grade: 85,
      credit: 4.0,
      gpa: 3.5
    },
    {
      id: 'grade2',
      studentId: '2021002',
      name: '王小红',
      avatar: 'https://s.coze.cn/image/CaRzficwuJY/',
      className: '软件工程2班',
      course: '程序设计基础',
      semester: '2023-2024学年第2学期',
      grade: 92,
      credit: 3.0,
      gpa: 4.0
    },
    {
      id: 'grade3',
      studentId: '2021003',
      name: '张大力',
      avatar: 'https://s.coze.cn/image/0-h9UIxhH4s/',
      className: '计算机科学与技术1班',
      course: '数据库原理',
      semester: '2024-2025学年第1学期',
      grade: 78,
      credit: 3.5,
      gpa: 2.8
    },
    {
      id: 'grade4',
      studentId: '2021004',
      name: '刘美丽',
      avatar: 'https://s.coze.cn/image/YebwmAnjxcA/',
      className: '软件工程2班',
      course: '算法分析',
      semester: '2023-2024学年第2学期',
      grade: 88,
      credit: 4.0,
      gpa: 3.7
    },
    {
      id: 'grade5',
      studentId: '2021005',
      name: '陈志强',
      avatar: 'https://s.coze.cn/image/i6B1x9TCHmQ/',
      className: '计算机科学与技术3班',
      course: '大学物理',
      semester: '2023-2024学年第1学期',
      grade: 75,
      credit: 3.0,
      gpa: 2.5
    }
  ]);

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '学业信息管理 - 学档通';
    return () => { document.title = originalTitle; };
  }, []);

  // 事件处理函数
  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      navigate('/login');
    }
  };

  const handleAddGrade = () => {
    setShowGradeModal(true);
    setGradeFormData({
      student: '',
      course: '',
      semester: '',
      grade: '',
      credit: ''
    });
  };

  const handleBatchImport = () => {
    setShowBatchImportModal(true);
  };

  const handleCloseGradeModal = () => {
    setShowGradeModal(false);
  };

  const handleCloseBatchImportModal = () => {
    setShowBatchImportModal(false);
    setUploadedFile(null);
  };

  const handleSaveGrade = () => {
    // 表单验证
    if (!gradeFormData.student || !gradeFormData.course || !gradeFormData.semester || !gradeFormData.grade || !gradeFormData.credit) {
      alert('请填写所有必填字段');
      return;
    }
    
    alert('成绩录入成功！');
    setShowGradeModal(false);
    setGradeFormData({
      student: '',
      course: '',
      semester: '',
      grade: '',
      credit: ''
    });
  };

  const handleEditGrade = (gradeId: string) => {
    setShowGradeModal(true);
    console.log('编辑成绩ID:', gradeId);
  };

  const handleDeleteGrade = (gradeId: string) => {
    if (confirm('确定要删除这条成绩记录吗？')) {
      console.log('删除成绩ID:', gradeId);
    }
  };

  const handleDownloadTemplate = () => {
    console.log('下载Excel模板');
    alert('模板下载功能需要后端支持');
  };

  const handleFileUpload = (file: File) => {
    if (file.type.includes('excel') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      setUploadedFile(file);
    } else {
      alert('请选择Excel文件');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  const handleConfirmImport = () => {
    if (uploadedFile) {
      console.log('开始批量导入成绩');
      alert('批量导入功能需要后端支持');
      setShowBatchImportModal(false);
      setUploadedFile(null);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems(new Set(academicRecords.map(record => record.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (recordId: string, checked: boolean) => {
    const newSelectedItems = new Set(selectedItems);
    if (checked) {
      newSelectedItems.add(recordId);
    } else {
      newSelectedItems.delete(recordId);
    }
    setSelectedItems(newSelectedItems);
  };

  const handleSort = (field: string) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    console.log('排序字段:', field, '方向:', newDirection);
  };

  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setGradeFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
              <img src="https://s.coze.cn/image/gnVlHvRiPmc/" 
                   alt="教师头像" className="w-8 h-8 rounded-full" />
              <div className="text-sm">
                <div className="font-medium text-text-primary">张老师</div>
                <div className="text-text-secondary">辅导员</div>
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
          <Link to="/teacher-dashboard" className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}>
            <i className="fas fa-home text-lg"></i>
            <span className="font-medium">教师管理平台</span>
          </Link>
          
          <Link to="/teacher-student-list" className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}>
            <i className="fas fa-users text-lg"></i>
            <span className="font-medium">我的学生</span>
          </Link>
          
          <Link to="/teacher-academic-management" className={`${styles.navItem} ${styles.navItemActive} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors`}>
            <i className="fas fa-book text-lg"></i>
            <span className="font-medium">学业信息管理</span>
          </Link>
          
          <Link to="/teacher-graduation-management" className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}>
            <i className="fas fa-rocket text-lg"></i>
            <span className="font-medium">毕业去向管理</span>
          </Link>
          
          <Link to="/teacher-report" className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}>
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
              <h2 className="text-2xl font-bold text-text-primary mb-2">学业信息管理</h2>
              <nav className="text-sm text-text-secondary">
                <span>首页</span>
                <i className="fas fa-chevron-right mx-2"></i>
                <span>学业信息管理</span>
              </nav>
            </div>
            <div className="flex space-x-3">
              <button onClick={handleBatchImport} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                <i className="fas fa-upload mr-2"></i>
                批量导入成绩
              </button>
              <button onClick={handleAddGrade} className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors">
                <i className="fas fa-plus mr-2"></i>
                录入成绩
              </button>
            </div>
          </div>
        </div>

        {/* 工具栏区域 */}
        <div className="bg-white rounded-xl shadow-card p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* 筛选条件 */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label htmlFor="class-filter" className="text-sm font-medium text-text-primary">班级：</label>
                <select 
                  id="class-filter" 
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className={`px-3 py-2 border border-border-light rounded-lg ${styles.formInputFocus}`}
                >
                  <option value="">全部班级</option>
                  <option value="cs1">计算机科学与技术1班</option>
                  <option value="cs2">计算机科学与技术2班</option>
                  <option value="cs3">计算机科学与技术3班</option>
                  <option value="se1">软件工程1班</option>
                  <option value="se2">软件工程2班</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <label htmlFor="course-filter" className="text-sm font-medium text-text-primary">课程：</label>
                <select 
                  id="course-filter" 
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className={`px-3 py-2 border border-border-light rounded-lg ${styles.formInputFocus}`}
                >
                  <option value="">全部课程</option>
                  <option value="math">高等数学</option>
                  <option value="physics">大学物理</option>
                  <option value="programming">程序设计基础</option>
                  <option value="database">数据库原理</option>
                  <option value="algorithm">算法分析</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <label htmlFor="semester-filter" className="text-sm font-medium text-text-primary">学期：</label>
                <select 
                  id="semester-filter" 
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className={`px-3 py-2 border border-border-light rounded-lg ${styles.formInputFocus}`}
                >
                  <option value="">全部学期</option>
                  <option value="2023-1">2023-2024学年第1学期</option>
                  <option value="2023-2">2023-2024学年第2学期</option>
                  <option value="2024-1">2024-2025学年第1学期</option>
                </select>
              </div>
            </div>
            
            {/* 搜索框 */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="搜索学号或姓名..." 
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border border-border-light rounded-lg ${styles.formInputFocus}`}
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"></i>
              </div>
            </div>
          </div>
        </div>

        {/* 学业信息列表 */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          {/* 表格头部 */}
          <div className="px-6 py-4 border-b border-border-light">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-text-primary">学业信息列表</h4>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="select-all" 
                  checked={selectedItems.size === academicRecords.length && academicRecords.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-border-light"
                />
                <label htmlFor="select-all" className="text-sm text-text-secondary">全选</label>
              </div>
            </div>
          </div>
          
          {/* 表格内容 */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider w-10">
                    <input type="checkbox" className="rounded border-border-light" />
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary"
                    onClick={() => handleSort('student-id')}
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
                    onClick={() => handleSort('course')}
                  >
                    课程 <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary"
                    onClick={() => handleSort('semester')}
                  >
                    学期 <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary"
                    onClick={() => handleSort('grade')}
                  >
                    成绩 <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">学分</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">绩点</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border-light">
                {academicRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        checked={selectedItems.has(record.id)}
                        onChange={(e) => handleSelectItem(record.id, e.target.checked)}
                        className="rounded border-border-light"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{record.studentId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img 
                          className="h-8 w-8 rounded-full mr-3" 
                          src={record.avatar} 
                          alt="学生头像" 
                        />
                        <span className="text-sm text-text-primary">{record.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{record.className}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{record.course}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{record.semester}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{record.grade}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{record.credit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{record.gpa}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button 
                        onClick={() => handleEditGrade(record.id)}
                        className="text-secondary hover:text-accent transition-colors"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        onClick={() => handleDeleteGrade(record.id)}
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
          
          {/* 分页 */}
          <div className="px-6 py-4 border-t border-border-light flex items-center justify-between">
            <div className="text-sm text-text-secondary">
              显示 1-5 条，共 156 条记录
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
      </main>

      {/* 录入成绩弹窗 */}
      {showGradeModal && (
        <div className="fixed inset-0 z-50">
          <div className={styles.modalOverlay} onClick={handleCloseGradeModal}></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="px-6 py-4 border-b border-border-light">
                <h3 className="text-lg font-semibold text-text-primary">录入成绩</h3>
              </div>
              <div className="px-6 py-4">
                <form className="space-y-4">
                  <div>
                    <label htmlFor="student-select" className="block text-sm font-medium text-text-primary mb-2">学生：</label>
                    <select 
                      id="student-select" 
                      name="student"
                      value={gradeFormData.student}
                      onChange={handleFormInputChange}
                      className={`w-full px-3 py-2 border border-border-light rounded-lg ${styles.formInputFocus}`}
                      required
                    >
                      <option value="">请选择学生</option>
                      <option value="2021001">2021001 - 李小明</option>
                      <option value="2021002">2021002 - 王小红</option>
                      <option value="2021003">2021003 - 张大力</option>
                      <option value="2021004">2021004 - 刘美丽</option>
                      <option value="2021005">2021005 - 陈志强</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="course-select" className="block text-sm font-medium text-text-primary mb-2">课程：</label>
                    <select 
                      id="course-select" 
                      name="course"
                      value={gradeFormData.course}
                      onChange={handleFormInputChange}
                      className={`w-full px-3 py-2 border border-border-light rounded-lg ${styles.formInputFocus}`}
                      required
                    >
                      <option value="">请选择课程</option>
                      <option value="math">高等数学</option>
                      <option value="physics">大学物理</option>
                      <option value="programming">程序设计基础</option>
                      <option value="database">数据库原理</option>
                      <option value="algorithm">算法分析</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="semester-select" className="block text-sm font-medium text-text-primary mb-2">学期：</label>
                    <select 
                      id="semester-select" 
                      name="semester"
                      value={gradeFormData.semester}
                      onChange={handleFormInputChange}
                      className={`w-full px-3 py-2 border border-border-light rounded-lg ${styles.formInputFocus}`}
                      required
                    >
                      <option value="">请选择学期</option>
                      <option value="2023-1">2023-2024学年第1学期</option>
                      <option value="2023-2">2023-2024学年第2学期</option>
                      <option value="2024-1">2024-2025学年第1学期</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="grade-input" className="block text-sm font-medium text-text-primary mb-2">成绩：</label>
                    <input 
                      type="number" 
                      id="grade-input" 
                      name="grade"
                      value={gradeFormData.grade}
                      onChange={handleFormInputChange}
                      min="0" 
                      max="100" 
                      className={`w-full px-3 py-2 border border-border-light rounded-lg ${styles.formInputFocus}`}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="credit-input" className="block text-sm font-medium text-text-primary mb-2">学分：</label>
                    <input 
                      type="number" 
                      id="credit-input" 
                      name="credit"
                      value={gradeFormData.credit}
                      onChange={handleFormInputChange}
                      min="0" 
                      max="10" 
                      step="0.5" 
                      className={`w-full px-3 py-2 border border-border-light rounded-lg ${styles.formInputFocus}`}
                      required
                    />
                  </div>
                </form>
              </div>
              <div className="px-6 py-4 border-t border-border-light flex justify-end space-x-3">
                <button 
                  onClick={handleCloseGradeModal}
                  className="px-4 py-2 border border-border-light text-text-secondary rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={handleSaveGrade}
                  className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 批量导入弹窗 */}
      {showBatchImportModal && (
        <div className="fixed inset-0 z-50">
          <div className={styles.modalOverlay} onClick={handleCloseBatchImportModal}></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
              <div className="px-6 py-4 border-b border-border-light">
                <h3 className="text-lg font-semibold text-text-primary">批量导入成绩</h3>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <i className="fas fa-info-circle text-blue-500 mt-1"></i>
                      <div>
                        <h4 className="font-medium text-blue-800 mb-1">导入说明</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• 请下载Excel模板并按照格式填写</li>
                          <li>• 支持.xlsx和.xls格式</li>
                          <li>• 单次导入最多500条记录</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <button 
                      onClick={handleDownloadTemplate}
                      className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <i className="fas fa-download mr-2"></i>
                      下载模板
                    </button>
                  </div>
                  
                  <div 
                    className="border-2 border-dashed border-border-light rounded-lg p-8 text-center hover:border-secondary transition-colors cursor-pointer"
                    onClick={() => document.getElementById('file-input')?.click()}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <i className="fas fa-cloud-upload-alt text-4xl text-text-secondary mb-3"></i>
                    <p className="text-text-secondary mb-2">点击或拖拽文件到此处上传</p>
                    <p className="text-sm text-text-secondary">支持 Excel 文件，最大 10MB</p>
                    <input 
                      type="file" 
                      id="file-input" 
                      accept=".xlsx,.xls" 
                      className="hidden"
                      onChange={handleFileInputChange}
                    />
                  </div>
                  
                  {uploadedFile && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <i className="fas fa-file-excel text-green-500"></i>
                          <span className="text-sm text-text-primary">{uploadedFile.name}</span>
                        </div>
                        <button 
                          onClick={handleRemoveFile}
                          className="text-red-500 hover:text-red-700"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="px-6 py-4 border-t border-border-light flex justify-end space-x-3">
                <button 
                  onClick={handleCloseBatchImportModal}
                  className="px-4 py-2 border border-border-light text-text-secondary rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={handleConfirmImport}
                  disabled={!uploadedFile}
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

export default TeacherAcademicManagement;

