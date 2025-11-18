

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

interface Document {
  id: string;
  name: string;
  type: string;
  typeName: string;
  date: string;
  size: string;
  icon: string;
}

const StudentDocumentView: React.FC = () => {
  const navigate = useNavigate();
  
  // 模拟文件数据
  const mockDocuments: Document[] = [
    {
      id: 'doc1',
      name: '2023-2024学年第一学期成绩单',
      type: 'transcript',
      typeName: '成绩单',
      date: '2024-01-10',
      size: '2.3 MB',
      icon: 'fas fa-file-alt'
    },
    {
      id: 'doc2',
      name: '在校证明',
      type: 'certificate',
      typeName: '在校证明',
      date: '2024-01-08',
      size: '1.8 MB',
      icon: 'fas fa-certificate'
    },
    {
      id: 'doc3',
      name: '优秀学生奖学金证书',
      type: 'award',
      typeName: '获奖证明',
      date: '2024-01-05',
      size: '3.1 MB',
      icon: 'fas fa-trophy'
    },
    {
      id: 'doc4',
      name: '2022-2023学年第二学期成绩单',
      type: 'transcript',
      typeName: '成绩单',
      date: '2023-07-15',
      size: '2.1 MB',
      icon: 'fas fa-file-alt'
    },
    {
      id: 'doc5',
      name: '英语四级证书',
      type: 'other',
      typeName: '其他',
      date: '2023-06-20',
      size: '2.7 MB',
      icon: 'fas fa-certificate'
    },
    {
      id: 'doc6',
      name: '计算机二级证书',
      type: 'other',
      typeName: '其他',
      date: '2023-05-18',
      size: '2.4 MB',
      icon: 'fas fa-certificate'
    },
    {
      id: 'doc7',
      name: '2022-2023学年第一学期成绩单',
      type: 'transcript',
      typeName: '成绩单',
      date: '2023-01-12',
      size: '2.2 MB',
      icon: 'fas fa-file-alt'
    },
    {
      id: 'doc8',
      name: '社会实践证明',
      type: 'certificate',
      typeName: '在校证明',
      date: '2022-12-25',
      size: '1.9 MB',
      icon: 'fas fa-certificate'
    },
    {
      id: 'doc9',
      name: '入党积极分子培训证书',
      type: 'award',
      typeName: '获奖证明',
      date: '2022-11-30',
      size: '2.5 MB',
      icon: 'fas fa-trophy'
    },
    {
      id: 'doc10',
      name: '2021-2022学年第二学期成绩单',
      type: 'transcript',
      typeName: '成绩单',
      date: '2022-07-18',
      size: '2.0 MB',
      icon: 'fas fa-file-alt'
    },
    {
      id: 'doc11',
      name: '军训优秀学员证书',
      type: 'award',
      typeName: '获奖证明',
      date: '2021-09-30',
      size: '2.8 MB',
      icon: 'fas fa-trophy'
    },
    {
      id: 'doc12',
      name: '入学登记表',
      type: 'other',
      typeName: '其他',
      date: '2021-09-01',
      size: '3.2 MB',
      icon: 'fas fa-file-alt'
    }
  ];

  const [currentDocuments, setCurrentDocuments] = useState<Document[]>([...mockDocuments]);
  const [currentPage, setCurrentPage] = useState(1);
  const [fileTypeFilter, setFileTypeFilter] = useState('');
  const [timeRangeFilter, setTimeRangeFilter] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const pageSize = 10;

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '信息查看与下载 - 学档通';
    return () => { document.title = originalTitle; };
  }, []);

  // 应用筛选和排序
  const applyFilters = () => {
    setCurrentPage(1);
    
    let filteredDocuments = mockDocuments.filter(doc => {
      // 文件类型筛选
      if (fileTypeFilter && doc.type !== fileTypeFilter) {
        return false;
      }

      // 时间范围筛选
      if (timeRangeFilter) {
        const docDate = new Date(doc.date);
        const now = new Date();
        let startDate: Date | null = null;

        switch (timeRangeFilter) {
          case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case 'quarter':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          case 'year':
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
        }

        if (startDate && docDate < startDate) {
          return false;
        }
      }

      return true;
    });

    // 应用排序
    if (sortField) {
      filteredDocuments.sort((a, b) => {
        let aValue = a[sortField as keyof Document];
        let bValue = b[sortField as keyof Document];

        if (sortField === 'date') {
          aValue = new Date(a.date).getTime() as any;
          bValue = new Date(b.date).getTime() as any;
        }

        if (sortDirection === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    setCurrentDocuments(filteredDocuments);
  };

  // 当筛选条件变化时应用筛选
  useEffect(() => {
    applyFilters();
  }, [fileTypeFilter, timeRangeFilter, sortField, sortDirection]);

  // 处理排序
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // 处理分页
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 获取当前页的文件
  const getCurrentPageDocuments = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return currentDocuments.slice(startIndex, endIndex);
  };

  // 获取排序图标
  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return 'fas fa-sort ml-1';
    }
    return `fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'} ml-1`;
  };

  // 获取文件类型颜色
  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      transcript: 'bg-blue-100 text-blue-800',
      certificate: 'bg-green-100 text-green-800',
      award: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
  };

  // 显示文件预览模态框
  const showDocumentPreview = (docId: string) => {
    const doc = mockDocuments.find(d => d.id === docId);
    if (doc) {
      setSelectedDocument(doc);
      setShowDocumentModal(true);
    }
  };

  // 关闭模态框
  const closeModal = () => {
    setShowDocumentModal(false);
    setSelectedDocument(null);
  };

  // 下载文件
  const downloadDocument = (docId: string) => {
    const doc = mockDocuments.find(d => d.id === docId);
    if (!doc) return;

    // 模拟文件下载
    console.log(`下载文件: ${doc.name}`);
    
    // 显示下载提示
    const link = document.createElement('a');
    link.href = '#';
    link.download = doc.name + '.pdf';
    link.click();

    // 显示成功提示
    alert(`文件 "${doc.name}" 下载成功！`);
  };

  // 退出登录
  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      navigate('/login');
    }
  };

  const totalPages = Math.ceil(currentDocuments.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, currentDocuments.length);

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
                src="https://s.coze.cn/image/qnzJjWCibKY/" 
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
            className={`${styles.navItem} ${styles.navItemActive} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors`}
          >
            <i className="fas fa-file-alt text-lg"></i>
            <span className="font-medium">信息查看与下载</span>
          </Link>
          
          <Link 
            to="/student-academic-tasks" 
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-book text-lg"></i>
            <span className="font-medium">教学任务与安排</span>
          </Link>
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="ml-64 mt-16 p-6 min-h-screen">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">信息查看与下载</h2>
              <nav className="text-sm text-text-secondary">
                <span>首页</span>
                <i className="fas fa-chevron-right mx-2"></i>
                <span>信息查看与下载</span>
              </nav>
            </div>
          </div>
        </div>

        {/* 工具栏区域 */}
        <section className="mb-6">
          <div className="bg-white rounded-xl shadow-card p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                {/* 文件类型筛选 */}
                <div className="flex items-center space-x-2">
                  <label htmlFor="file-type-filter" className="text-sm font-medium text-text-primary">文件类型：</label>
                  <select 
                    id="file-type-filter"
                    value={fileTypeFilter}
                    onChange={(e) => setFileTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                  >
                    <option value="">全部类型</option>
                    <option value="transcript">成绩单</option>
                    <option value="certificate">在校证明</option>
                    <option value="graduation">毕业证明</option>
                    <option value="award">获奖证明</option>
                    <option value="other">其他</option>
                  </select>
                </div>
                
                {/* 时间范围筛选 */}
                <div className="flex items-center space-x-2">
                  <label htmlFor="time-range-filter" className="text-sm font-medium text-text-primary">时间范围：</label>
                  <select 
                    id="time-range-filter"
                    value={timeRangeFilter}
                    onChange={(e) => setTimeRangeFilter(e.target.value)}
                    className="px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                  >
                    <option value="">全部时间</option>
                    <option value="today">今天</option>
                    <option value="week">最近一周</option>
                    <option value="month">最近一个月</option>
                    <option value="quarter">最近三个月</option>
                    <option value="year">最近一年</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={applyFilters}
                  className="px-4 py-2 text-sm border border-border-light rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <i className="fas fa-sync-alt mr-2"></i>刷新
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 内容展示区域 */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            {/* 表格头部 */}
            <div className="px-6 py-4 border-b border-border-light">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-text-primary">我的证明文件</h4>
                <div className="text-sm text-text-secondary">
                  共 <span>{currentDocuments.length}</span> 个文件
                </div>
              </div>
            </div>
            
            {/* 文件列表 */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-secondary"
                      onClick={() => handleSort('name')}
                    >
                      文件名称 <i className={getSortIcon('name')}></i>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-secondary"
                      onClick={() => handleSort('type')}
                    >
                      类型 <i className={getSortIcon('type')}></i>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-secondary"
                      onClick={() => handleSort('date')}
                    >
                      生成日期 <i className={getSortIcon('date')}></i>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-border-light">
                  {getCurrentPageDocuments().map(doc => (
                    <tr key={doc.id} className={`${styles.tableRow} transition-colors`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                        <div className="flex items-center">
                          <i className={`${doc.icon} text-secondary mr-3`}></i>
                          {doc.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium ${getTypeColor(doc.type)} rounded-full`}>
                          {doc.typeName}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {formatDate(doc.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button 
                          onClick={() => showDocumentPreview(doc.id)}
                          className="text-secondary hover:text-accent transition-colors"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          onClick={() => downloadDocument(doc.id)}
                          className="text-text-secondary hover:text-secondary transition-colors"
                        >
                          <i className="fas fa-download"></i>
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
                显示 <span>{startIndex}</span>-<span>{endIndex}</span> 条，共 <span>{currentDocuments.length}</span> 条记录
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-3 py-1 text-sm border border-border-light rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      currentPage === index + 1 
                        ? 'bg-secondary text-white' 
                        : 'border border-border-light hover:bg-gray-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1 text-sm border border-border-light rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 文件预览模态框 */}
      {showDocumentModal && selectedDocument && (
        <div className="fixed inset-0 z-50">
          <div className={styles.modalBackdrop} onClick={closeModal}></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden ${styles.modalEnter}`}>
              {/* 模态框头部 */}
              <div className="px-6 py-4 border-b border-border-light flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary">文件预览 - {selectedDocument.name}</h3>
                <button 
                  onClick={closeModal}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              
              {/* 模态框内容 */}
              <div className="px-6 py-4">
                <div className="space-y-4">
                  {/* 文件信息 */}
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
                      <i className={`${selectedDocument.icon} text-white text-xl`}></i>
                    </div>
                    <div>
                      <h4 className="font-medium text-text-primary">{selectedDocument.name}</h4>
                      <p className="text-sm text-text-secondary">{selectedDocument.typeName} · {selectedDocument.size}</p>
                      <p className="text-sm text-text-secondary">生成时间：{formatDate(selectedDocument.date)}</p>
                    </div>
                  </div>
                  
                  {/* 文件预览区域 */}
                  <div className="border border-border-light rounded-lg overflow-hidden">
                    <div className="p-8 text-center bg-gray-50">
                      <i className="fas fa-file-pdf text-6xl text-red-500 mb-4"></i>
                      <p className="text-text-secondary mb-4">文件预览功能</p>
                      <p className="text-sm text-text-secondary">在实际应用中，这里将显示PDF文件的预览内容</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 模态框底部 */}
              <div className="px-6 py-4 border-t border-border-light flex items-center justify-end space-x-3">
                <button 
                  onClick={() => downloadDocument(selectedDocument.id)}
                  className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors"
                >
                  <i className="fas fa-download mr-2"></i>下载文件
                </button>
                <button 
                  onClick={closeModal}
                  className="px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50 transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDocumentView;

