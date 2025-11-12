

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

interface GraduationRecord {
  id: string;
  studentId: string;
  name: string;
  className: string;
  type: 'employment' | 'furtherstudy' | 'entrepreneurship' | 'abroad' | 'unemployed' | 'other';
  typeText: string;
  company?: string;
  school?: string;
  position?: string;
  salary?: string;
  location?: string;
  major?: string;
  degree?: string;
  status: 'pending' | 'approved' | 'rejected';
  statusText: string;
  proofFiles: string[];
  submitTime: string;
  approvedTime?: string;
  rejectedTime?: string;
  rejectReason?: string;
}

const TeacherGraduationManagement: React.FC = () => {
  const navigate = useNavigate();
  
  // 状态管理
  const [searchKeyword, setSearchKeyword] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isSelectAll, setIsSelectAll] = useState(false);
  
  // 弹窗状态
  const [showBatchImportModal, setShowBatchImportModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  // 当前操作的数据ID
  const [currentDetailId, setCurrentDetailId] = useState<string | null>(null);
  const [currentEditId, setCurrentEditId] = useState<string | null>(null);
  const [currentReviewId, setCurrentReviewId] = useState<string | null>(null);
  
  // 审核意见
  const [reviewComment, setReviewComment] = useState('');
  
  // 文件上传状态
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 模拟数据
  const [graduationData, setGraduationData] = useState<Record<string, GraduationRecord>>({
    'grad001': {
      id: 'grad001',
      studentId: '2021001',
      name: '李小明',
      className: '计算机科学与技术1班',
      type: 'employment',
      typeText: '就业',
      company: '阿里巴巴（中国）有限公司',
      position: '前端开发工程师',
      salary: '15000',
      location: '杭州',
      status: 'pending',
      statusText: '待审核',
      proofFiles: ['offer_letter.pdf', 'employment_contract.pdf'],
      submitTime: '2024-01-14 10:30:00'
    },
    'grad002': {
      id: 'grad002',
      studentId: '2021002',
      name: '王小红',
      className: '软件工程2班',
      type: 'furtherstudy',
      typeText: '升学',
      school: '清华大学计算机科学与技术系',
      major: '计算机应用技术',
      degree: '硕士研究生',
      status: 'approved',
      statusText: '已通过',
      proofFiles: ['admission_letter.pdf', 'transcript.pdf'],
      submitTime: '2024-01-13 15:20:00',
      approvedTime: '2024-01-14 09:15:00'
    },
    'grad003': {
      id: 'grad003',
      studentId: '2021003',
      name: '张大力',
      className: '计算机科学与技术1班',
      type: 'employment',
      typeText: '就业',
      company: '腾讯科技（深圳）有限公司',
      position: '产品经理',
      salary: '18000',
      location: '深圳',
      status: 'rejected',
      statusText: '已驳回',
      rejectReason: '证明材料不完整，缺少劳动合同',
      proofFiles: ['offer_letter.pdf'],
      submitTime: '2024-01-12 16:45:00',
      rejectedTime: '2024-01-13 11:30:00'
    },
    'grad004': {
      id: 'grad004',
      studentId: '2021004',
      name: '刘美丽',
      className: '软件工程2班',
      type: 'abroad',
      typeText: '出国',
      school: '美国斯坦福大学',
      major: '人工智能',
      degree: '博士研究生',
      status: 'pending',
      statusText: '待审核',
      proofFiles: ['admission_letter.pdf', 'visa.pdf'],
      submitTime: '2024-01-14 14:20:00'
    },
    'grad005': {
      id: 'grad005',
      studentId: '2021005',
      name: '陈志强',
      className: '计算机科学与技术3班',
      type: 'entrepreneurship',
      typeText: '创业',
      company: '北京创新科技有限公司',
      position: '创始人兼CEO',
      status: 'approved',
      statusText: '已通过',
      proofFiles: ['business_license.pdf', 'business_plan.pdf'],
      submitTime: '2024-01-11 09:30:00',
      approvedTime: '2024-01-12 14:45:00'
    }
  });

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '毕业去向管理 - 学档通';
    return () => { document.title = originalTitle; };
  }, []);

  // 全选功能
  useEffect(() => {
    if (isSelectAll) {
      const allIds = Object.keys(graduationData);
      setSelectedItems(new Set(allIds));
    } else {
      setSelectedItems(new Set());
    }
  }, [isSelectAll, graduationData]);

  // 退出登录
  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      navigate('/login');
    }
  };

  // 搜索功能
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  // 筛选功能
  const handleClassFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setClassFilter(e.target.value);
  };

  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTypeFilter(e.target.value);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  // 重置筛选
  const handleFilterReset = () => {
    setSearchKeyword('');
    setClassFilter('');
    setTypeFilter('');
    setStatusFilter('');
  };

  // 单项选择
  const handleItemSelect = (id: string) => {
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(id)) {
      newSelectedItems.delete(id);
    } else {
      newSelectedItems.add(id);
    }
    setSelectedItems(newSelectedItems);
    setIsSelectAll(newSelectedItems.size === Object.keys(graduationData).length && newSelectedItems.size > 0);
  };

  // 批量导入相关
  const handleBatchImport = () => {
    setShowBatchImportModal(true);
  };

  const handleDownloadTemplate = () => {
    console.log('下载毕业去向导入模板');
  };

  const handleFileSelect = () => {
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    fileInput?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (!selectedFile) {
      alert('请先选择要导入的文件');
      return;
    }
    console.log('开始批量导入毕业去向数据');
    setShowBatchImportModal(false);
    setSelectedFile(null);
  };

  // 查看详情
  const handleViewDetail = (id: string) => {
    setCurrentDetailId(id);
    setShowDetailModal(true);
  };

  // 编辑
  const handleEdit = (id: string) => {
    setCurrentEditId(id);
    setShowEditModal(true);
  };

  // 审核
  const handleReview = (id: string) => {
    setCurrentReviewId(id);
    setShowReviewModal(true);
  };

  // 审核通过
  const handleApprove = () => {
    if (currentReviewId) {
      updateGraduationStatus(currentReviewId, 'approved');
      setShowReviewModal(false);
      setCurrentReviewId(null);
      setReviewComment('');
    }
  };

  // 审核驳回
  const handleReject = () => {
    if (currentReviewId) {
      updateGraduationStatus(currentReviewId, 'rejected', reviewComment);
      setShowReviewModal(false);
      setCurrentReviewId(null);
      setReviewComment('');
    }
  };

  // 更新毕业去向状态
  const updateGraduationStatus = (id: string, status: 'approved' | 'rejected', reason?: string) => {
    setGraduationData(prevData => {
      const updatedData = { ...prevData };
      if (updatedData[id]) {
        updatedData[id].status = status;
        updatedData[id].statusText = status === 'approved' ? '已通过' : '已驳回';
        
        if (status === 'approved') {
          updatedData[id].approvedTime = new Date().toLocaleString('zh-CN');
        } else if (status === 'rejected') {
          updatedData[id].rejectedTime = new Date().toLocaleString('zh-CN');
          updatedData[id].rejectReason = reason;
        }
      }
      return updatedData;
    });
  };

  // 编辑表单提交
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('保存毕业去向编辑');
    setShowEditModal(false);
    setCurrentEditId(null);
  };

  // 渲染详情内容
  const renderDetailContent = () => {
    const data = currentDetailId ? graduationData[currentDetailId] : null;
    if (!data) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-text-primary mb-3">基本信息</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-secondary">学号：</span>
                <span className="text-text-primary">{data.studentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">姓名：</span>
                <span className="text-text-primary">{data.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">班级：</span>
                <span className="text-text-primary">{data.className}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">去向类型：</span>
                <span className={`px-2 py-1 text-xs font-medium ${styles[`type${data.type.charAt(0).toUpperCase() + data.type.slice(1)}`]} rounded-full`}>
                  {data.typeText}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">审核状态：</span>
                <span className={`px-2 py-1 text-xs font-medium ${styles[`status${data.status.charAt(0).toUpperCase() + data.status.slice(1)}`]} rounded-full`}>
                  {data.statusText}
                </span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-text-primary mb-3">详细信息</h4>
            <div className="space-y-2">
              {data.type === 'employment' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">单位名称：</span>
                    <span className="text-text-primary">{data.company}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">职位：</span>
                    <span className="text-text-primary">{data.position}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">薪资：</span>
                    <span className="text-text-primary">{data.salary}元/月</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">工作地点：</span>
                    <span className="text-text-primary">{data.location}</span>
                  </div>
                </>
              )}
              {(data.type === 'furtherstudy' || data.type === 'abroad') && (
                <>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">学校名称：</span>
                    <span className="text-text-primary">{data.school}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">专业：</span>
                    <span className="text-text-primary">{data.major}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">学历层次：</span>
                    <span className="text-text-primary">{data.degree}</span>
                  </div>
                </>
              )}
              {data.type === 'entrepreneurship' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">公司名称：</span>
                    <span className="text-text-primary">{data.company}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">职位：</span>
                    <span className="text-text-primary">{data.position}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-text-secondary">提交时间：</span>
                <span className="text-text-primary">{data.submitTime}</span>
              </div>
              {data.status === 'approved' && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">审核通过时间：</span>
                  <span className="text-text-primary">{data.approvedTime}</span>
                </div>
              )}
              {data.status === 'rejected' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">驳回时间：</span>
                    <span className="text-text-primary">{data.rejectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">驳回原因：</span>
                    <span className="text-red-600">{data.rejectReason}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="border-t pt-4">
          <h4 className="font-medium text-text-primary mb-3">证明材料</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {data.proofFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-text-primary">{file}</span>
                <button className="text-secondary hover:text-accent transition-colors">
                  <i className="fas fa-download"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 渲染编辑表单
  const renderEditForm = () => {
    const data = currentEditId ? graduationData[currentEditId] : null;
    if (!data) return null;

    const [editType, setEditType] = useState(data.type);

    const renderEditDetails = () => {
      switch(editType) {
        case 'employment':
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">单位名称 *</label>
                <input type="text" defaultValue={data.company || ''} required className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">职位</label>
                <input type="text" defaultValue={data.position || ''} className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">薪资</label>
                <input type="text" defaultValue={data.salary || ''} placeholder="请输入数字" className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">工作地点</label>
                <input type="text" defaultValue={data.location || ''} className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary" />
              </div>
            </div>
          );
        case 'furtherstudy':
        case 'abroad':
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">学校名称 *</label>
                <input type="text" defaultValue={data.school || ''} required className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">专业</label>
                <input type="text" defaultValue={data.major || ''} className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">学历层次</label>
                <select defaultValue={data.degree || '本科'} className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary">
                  <option value="本科">本科</option>
                  <option value="硕士研究生">硕士研究生</option>
                  <option value="博士研究生">博士研究生</option>
                </select>
              </div>
            </div>
          );
        case 'entrepreneurship':
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">公司名称 *</label>
                <input type="text" defaultValue={data.company || ''} required className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">职位</label>
                <input type="text" defaultValue={data.position || ''} className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary" />
              </div>
            </div>
          );
        default:
          return (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-text-secondary text-sm">请选择去向类型后填写详细信息</p>
            </div>
          );
      }
    };

    return (
      <form onSubmit={handleEditSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">学号</label>
            <input type="text" value={data.studentId} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">姓名</label>
            <input type="text" value={data.name} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">班级</label>
            <input type="text" value={data.className} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">去向类型</label>
            <select value={editType} onChange={(e) => setEditType(e.target.value as any)} className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary">
              <option value="employment">就业</option>
              <option value="furtherstudy">升学</option>
              <option value="entrepreneurship">创业</option>
              <option value="abroad">出国</option>
              <option value="unemployed">待业</option>
              <option value="other">其他</option>
            </select>
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
          {renderEditDetails()}
        </div>
      </form>
    );
  };

  // 渲染审核内容
  const renderReviewContent = () => {
    const data = currentReviewId ? graduationData[currentReviewId] : null;
    if (!data) return null;

    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-text-secondary">学号：</span>
          <span className="text-text-primary">{data.studentId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">姓名：</span>
          <span className="text-text-primary">{data.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">班级：</span>
          <span className="text-text-primary">{data.className}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">去向类型：</span>
          <span className={`px-2 py-1 text-xs font-medium ${styles[`type${data.type.charAt(0).toUpperCase() + data.type.slice(1)}`]} rounded-full`}>
            {data.typeText}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">单位/学校：</span>
          <span className="text-text-primary">{data.company || data.school}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">提交时间：</span>
          <span className="text-text-primary">{data.submitTime}</span>
        </div>
        <div className="border-t pt-4">
          <h5 className="font-medium text-text-primary mb-2">证明材料</h5>
          <div className="space-y-1">
            {data.proofFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-text-primary">{file}</span>
                <button className="text-secondary hover:text-accent transition-colors text-sm">
                  <i className="fas fa-download mr-1"></i>下载
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 过滤数据
  const filteredData = Object.values(graduationData).filter(record => {
    const matchesSearch = record.studentId.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                         record.name.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchesClass = !classFilter || record.className.includes(classFilter);
    const matchesType = !typeFilter || record.type === typeFilter;
    const matchesStatus = !statusFilter || record.status === statusFilter;
    
    return matchesSearch && matchesClass && matchesType && matchesStatus;
  });

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
              <img src="https://s.coze.cn/image/PjVTZ0NugCc/" 
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
          
          <Link to="/teacher-academic-management" className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}>
            <i className="fas fa-book text-lg"></i>
            <span className="font-medium">学业信息管理</span>
          </Link>
          
          <Link to="/teacher-graduation-management" className={`${styles.navItem} ${styles.navItemActive} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors`}>
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
              <h2 className="text-2xl font-bold text-text-primary mb-2">毕业去向管理</h2>
              <nav className="text-sm text-text-secondary">
                <span>首页</span>
                <i className="fas fa-chevron-right mx-2"></i>
                <span>毕业去向管理</span>
              </nav>
            </div>
            <div className="flex space-x-3">
              <button onClick={handleBatchImport} className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors">
                <i className="fas fa-upload mr-2"></i>批量导入去向
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
                  value={searchKeyword}
                  onChange={handleSearchChange}
                  placeholder="按学号、姓名搜索" 
                  className="w-64 pl-10 pr-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"></i>
              </div>
            </div>
            
            {/* 筛选条件 */}
            <div className="flex items-center space-x-4">
              <select value={classFilter} onChange={handleClassFilterChange} className="px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary">
                <option value="">全部班级</option>
                <option value="计算机科学与技术1班">计算机科学与技术1班</option>
                <option value="计算机科学与技术2班">计算机科学与技术2班</option>
                <option value="计算机科学与技术3班">计算机科学与技术3班</option>
                <option value="软件工程1班">软件工程1班</option>
                <option value="软件工程2班">软件工程2班</option>
              </select>
              
              <select value={typeFilter} onChange={handleTypeFilterChange} className="px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary">
                <option value="">全部类型</option>
                <option value="employment">就业</option>
                <option value="furtherstudy">升学</option>
                <option value="entrepreneurship">创业</option>
                <option value="abroad">出国</option>
                <option value="unemployed">待业</option>
                <option value="other">其他</option>
              </select>
              
              <select value={statusFilter} onChange={handleStatusFilterChange} className="px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary">
                <option value="">全部状态</option>
                <option value="pending">待审核</option>
                <option value="approved">已通过</option>
                <option value="rejected">已驳回</option>
              </select>
              
              <button onClick={handleFilterReset} className="px-4 py-2 text-text-secondary border border-border-light rounded-lg hover:bg-gray-50 transition-colors">
                重置
              </button>
            </div>
          </div>
        </div>

        {/* 内容展示区域 */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          {/* 表格头部 */}
          <div className="px-6 py-4 border-b border-border-light">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-text-primary">毕业去向列表</h4>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={isSelectAll}
                  onChange={(e) => setIsSelectAll(e.target.checked)}
                  className="rounded border-border-light"
                />
                <label className="text-sm text-text-secondary">全选</label>
              </div>
            </div>
          </div>
          
          {/* 去向列表 */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider w-10">
                    <input type="checkbox" className="rounded border-border-light" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-secondary">
                    学号 <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-secondary">
                    姓名 <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-secondary">
                    班级 <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-secondary">
                    去向类型 <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    单位/学校
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-secondary">
                    审核状态 <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border-light">
                {filteredData.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        checked={selectedItems.has(record.id)}
                        onChange={() => handleItemSelect(record.id)}
                        className="rounded border-border-light"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{record.studentId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img 
                          className="h-8 w-8 rounded-full mr-3" 
                          src={`https://s.coze.cn/image/${record.id === 'grad001' ? 'dEU_pR4LeL0/' : 
                                            record.id === 'grad002' ? 'UJJnT1_cLCM/' :
                                            record.id === 'grad003' ? 'h1telHGafwM/' :
                                            record.id === 'grad004' ? 'PWq4u0K2VtU/' : '4-gBXRuBVyc/'}`}
                          alt="学生头像"
                        />
                        <span className="font-medium text-text-primary">{record.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{record.className}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium ${styles[`type${record.type.charAt(0).toUpperCase() + record.type.slice(1)}`]} rounded-full`}>
                        {record.typeText}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                      {record.company || record.school}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium ${styles[`status${record.status.charAt(0).toUpperCase() + record.status.slice(1)}`]} rounded-full`}>
                        {record.statusText}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button 
                        onClick={() => handleViewDetail(record.id)}
                        className="text-secondary hover:text-accent transition-colors"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button 
                        onClick={() => handleEdit(record.id)}
                        className="text-text-secondary hover:text-secondary transition-colors"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      {record.status === 'pending' || record.status === 'rejected' ? (
                        <button 
                          onClick={() => handleReview(record.id)}
                          className="text-orange-500 hover:text-orange-700 transition-colors"
                        >
                          <i className={`fas ${record.status === 'rejected' ? 'fa-redo' : 'fa-check-circle'}`}></i>
                        </button>
                      ) : (
                        <button className="text-gray-400 cursor-not-allowed" disabled>
                          <i className="fas fa-check-circle"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* 分页 */}
          <div className="px-6 py-4 border-t border-border-light flex items-center justify-between">
            <div className="text-sm text-text-secondary">
              显示 1-{filteredData.length} 条，共 89 条记录
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

      {/* 批量导入弹窗 */}
      {showBatchImportModal && (
        <div className="fixed inset-0 z-50">
          <div className={styles.modalOverlay} onClick={() => setShowBatchImportModal(false)}></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`${styles.modalContent} bg-white rounded-xl shadow-xl w-full max-w-md`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">批量导入毕业去向</h3>
                  <button onClick={() => setShowBatchImportModal(false)} className="text-text-secondary hover:text-text-primary">
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">下载模板</label>
                    <button onClick={handleDownloadTemplate} className="w-full px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50 transition-colors">
                      <i className="fas fa-download mr-2"></i>下载Excel模板
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">上传文件</label>
                    <div className="border-2 border-dashed border-border-light rounded-lg p-6 text-center">
                      <i className="fas fa-cloud-upload-alt text-3xl text-text-secondary mb-2"></i>
                      <p className="text-sm text-text-secondary mb-2">拖拽文件到此处或点击选择文件</p>
                      <input 
                        type="file" 
                        id="file-upload"
                        accept=".xlsx,.xls" 
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <button onClick={handleFileSelect} className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors">
                        选择文件
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button onClick={() => setShowBatchImportModal(false)} className="flex-1 px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50 transition-colors">
                    取消
                  </button>
                  <button onClick={handleConfirmImport} className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors">
                    导入
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 查看详情弹窗 */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50">
          <div className={styles.modalOverlay} onClick={() => setShowDetailModal(false)}></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`${styles.modalContent} bg-white rounded-xl shadow-xl w-full max-w-2xl`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">毕业去向详情</h3>
                  <button onClick={() => setShowDetailModal(false)} className="text-text-secondary hover:text-text-primary">
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                {renderDetailContent()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 编辑弹窗 */}
      {showEditModal && (
        <div className="fixed inset-0 z-50">
          <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`${styles.modalContent} bg-white rounded-xl shadow-xl w-full max-w-2xl`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">编辑毕业去向</h3>
                  <button onClick={() => setShowEditModal(false)} className="text-text-secondary hover:text-text-primary">
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                {renderEditForm()}
                <div className="flex space-x-3 mt-6">
                  <button onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50 transition-colors">
                    取消
                  </button>
                  <button type="submit" form="edit-form" onClick={handleEditSubmit} className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors">
                    保存
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 审核弹窗 */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50">
          <div className={styles.modalOverlay} onClick={() => setShowReviewModal(false)}></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`${styles.modalContent} bg-white rounded-xl shadow-xl w-full max-w-lg`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">审核毕业去向</h3>
                  <button onClick={() => setShowReviewModal(false)} className="text-text-secondary hover:text-text-primary">
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                {renderReviewContent()}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">审核意见</label>
                    <textarea 
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                      placeholder="请输入审核意见（可选）"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button onClick={handleReject} className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                      驳回
                    </button>
                    <button onClick={handleApprove} className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                      通过
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

export default TeacherGraduationManagement;

