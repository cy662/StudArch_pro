

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { useAuth } from '../../hooks/useAuth';
import useStudentProfile from '../../hooks/useStudentProfile';
import DocumentService, { Document } from '../../services/documentService';

const StudentDocumentView: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading } = useAuth();
  const { profile: studentProfile } = useStudentProfile(currentUser?.id || '');
  
  // 数据和状态管理
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentDocuments, setCurrentDocuments] = useState<Document[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [fileTypeFilter, setFileTypeFilter] = useState('');
  const [timeRangeFilter, setTimeRangeFilter] = useState('');
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  
  // 文件上传相关状态
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);


  const pageSize = 10;

  // 加载文档数据
  const loadDocuments = async () => {
    if (!currentUser?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        document_type: fileTypeFilter || undefined,
        keyword: '',
        date_from: getDateRangeFilter(timeRangeFilter)?.from,
        date_to: getDateRangeFilter(timeRangeFilter)?.to,
        page: currentPage,
        limit: pageSize
      };

      const response = await DocumentService.getUserDocuments(currentUser.id, params);
      setDocuments(response.documents);
      setTotal(response.total);
      setCurrentDocuments(response.documents);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载文档失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取日期范围筛选
  const getDateRangeFilter = (timeRange: string) => {
    if (!timeRange) return null;
    
    const now = new Date();
    let startDate: Date | null = null;
    
    switch (timeRange) {
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
    
    if (startDate) {
      return {
        from: startDate.toISOString().split('T')[0],
        to: now.toISOString().split('T')[0]
      };
    }
    
    return null;
  };

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '信息查看与下载 - 学档通';
    return () => { document.title = originalTitle; };
  }, []);

  // 初始加载数据
  useEffect(() => {
    loadDocuments();
  }, [currentUser?.id]);

  // 当筛选条件变化时重新加载数据
  useEffect(() => {
    if (currentUser?.id) {
      setCurrentPage(1);
      loadDocuments();
    }
  }, [fileTypeFilter, timeRangeFilter, currentUser?.id]);

  // 当分页变化时重新加载数据
  useEffect(() => {
    if (currentUser?.id) {
      loadDocuments();
    }
  }, [currentPage, currentUser?.id]);

  // 应用筛选
  const applyFilters = () => {
    setCurrentPage(1);
    loadDocuments();
  };

  // 处理分页
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
  const showDocumentPreview = async (docId: string) => {
    if (!currentUser?.id) return;
    
    try {
      const doc = documents.find(d => d.id === docId);
      if (doc) {
        setSelectedDocument(doc);
        setShowDocumentModal(true);
      }
    } catch (error) {
      console.error('获取文档详情失败:', error);
      alert('获取文档详情失败');
    }
  };

  // 关闭模态框
  const closeModal = () => {
    setShowDocumentModal(false);
    setSelectedDocument(null);
  };

  // 下载文件
  const downloadDocument = async (docId: string) => {
    if (!currentUser?.id) return;
    
    try {
      const result = await DocumentService.downloadDocument(docId, currentUser.id);
      
      // 创建临时链接下载文件
      const link = document.createElement('a');
      link.href = result.url;
      link.download = result.fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`下载文件: ${result.fileName}`);
    } catch (error) {
      console.error('下载失败:', error);
      alert(error instanceof Error ? error.message : '下载失败');
    }
  };

  // 文件上传相关函数
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadFiles(prevFiles => [...prevFiles, ...files]);
  };

  const removeUploadFile = (index: number) => {
    setUploadFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const uploadFilesToServer = async () => {
    if (uploadFiles.length === 0 || !currentUser?.id) return;
    
    setIsUploading(true);
    let successCount = 0;
    let failedCount = 0;
    
    try {
      for (let i = 0; i < uploadFiles.length; i++) {
        const file = uploadFiles[i];
        const fileId = `upload_${Date.now()}_${i}`;
        
        // 设置初始进度
        setUploadProgress(prev => ({ ...prev, [fileId]: 10 }));
        
        // 使用DocumentService上传文件
        const documentType = DocumentService.getDocumentTypeFromFile(file);
        const title = file.name.replace(/\.[^/.]+$/, "");
        
        setUploadProgress(prev => ({ ...prev, [fileId]: 50 }));
        
        const result = await DocumentService.uploadDocument(
          currentUser.id,
          file,
          title,
          '',
          documentType,
          []
        );
        
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
        
        if (result.success) {
          successCount++;
        } else {
          failedCount++;
          console.error(`文件 ${file.name} 上传失败:`, result.error);
        }
      }
      
      // 重新加载文档列表
      await loadDocuments();
      
      // 重置上传状态
      setUploadFiles([]);
      setUploadProgress({});
      setShowUploadModal(false);
      
      // 显示结果提示
      if (failedCount === 0) {
        alert(`成功上传 ${successCount} 个文件！`);
      } else {
        alert(`上传完成：成功 ${successCount} 个，失败 ${failedCount} 个`);
      }
      
    } catch (error) {
      console.error('文件上传失败:', error);
      alert('文件上传失败，请稍后重试！');
    } finally {
      setIsUploading(false);
    }
  };

  // 批量导出原始文件
  const handleBatchExport = async () => {
    if (!currentUser?.id) return;
    
    if (documents.length === 0) {
      alert('没有可导出的文档！');
      return;
    }

    // 确认导出
    const confirmed = window.confirm(`确定要导出所有 ${documents.length} 个原始文件吗？
文件将保持原始格式和内容，尝试打包为ZIP或逐个下载。`);
    if (!confirmed) return;

    setIsExporting(true);
    
    try {
      // 先尝试 ZIP 打包下载
      const zipResult = await DocumentService.createZipExport(currentUser.id);
      
      if (zipResult.success && zipResult.zipBlob) {
        // ZIP 下载成功
        const url = URL.createObjectURL(zipResult.zipBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `文档导出_${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alert(`成功导出 ${documents.length} 个文件为ZIP包！`);
      } else {
        // ZIP 失败，使用单独下载
        console.log('ZIP下载失败，使用单独下载模式');
        const result = await DocumentService.batchExportOriginalFiles(currentUser.id);
        
        if (result.success) {
          let message = `成功导出 ${result.downloadedCount} 个文件！`;
          if (result.error) {
            message += `
${result.error}`;
          }
          alert(message);
        } else {
          alert(`导出失败：${result.error}`);
        }
      }
    } catch (error) {
      console.error('批量导出失败:', error);
      alert('导出失败，请稍后重试！');
    } finally {
      setIsExporting(false);
    }
  };

  const getFileType = (file: File): string => {
    return DocumentService.getDocumentTypeFromFile(file);
  };

  const getFileTypeName = (file: File): string => {
    const type = DocumentService.getDocumentTypeFromFile(file);
    return DocumentService.getDocumentTypeName(type);
  };

  const getFileIcon = (file: File): string => {
    const documentType = DocumentService.getDocumentTypeFromFile(file);
    const fileType = file.type.split('/')[1] || 'unknown';
    return DocumentService.getFileIcon(fileType, documentType);
  };

  const formatFileSize = (bytes: number): string => {
    return DocumentService.formatFileSize(bytes);
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
                src={studentProfile?.profile_photo || currentUser?.avatar || "https://s.coze.cn/image/qnzJjWCibKY/"} 
                alt="学生头像" 
                className="w-8 h-8 rounded-full object-cover" 
              />
              <div className="text-sm">
                <div className="font-medium text-text-primary">
                  {authLoading ? '加载中...' : (currentUser?.full_name || currentUser?.username || '未知用户')}
                </div>
                <div className="text-text-secondary">
                  {authLoading ? '加载中...' : (currentUser?.class_name || '未知班级')}
                </div>
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
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 bg-secondary text-white text-sm rounded-lg hover:bg-accent transition-colors"
                >
                  <i className="fas fa-upload mr-2"></i>上传文件
                </button>
                <button 
                  onClick={handleBatchExport}
                  disabled={isExporting || documents.length === 0}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className={`fas fa-download mr-2 ${isExporting ? 'fa-spin' : ''}`}></i>
                  {isExporting ? '导出中...' : '批量导出'}
                </button>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      文件名称
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      类型
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      上传日期
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-border-light">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-text-secondary">
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        加载中...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-red-600">
                        加载失败: {error}
                      </td>
                    </tr>
                  ) : currentDocuments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-text-secondary">
                        暂无文档
                      </td>
                    </tr>
                  ) : (
                    currentDocuments.map(doc => (
                      <tr key={doc.id} className={`${styles.tableRow} transition-colors`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                          <div className="flex items-center">
                            <i className={`${DocumentService.getFileIcon(doc.file_type, doc.document_type)} text-secondary mr-3`}></i>
                            {doc.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium ${getTypeColor(doc.document_type)} rounded-full`}>
                            {DocumentService.getDocumentTypeName(doc.document_type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {formatDate(doc.created_at)}
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* 分页 */}
            <div className="px-6 py-4 border-t border-border-light flex items-center justify-between">
              <div className="text-sm text-text-secondary">
                显示 <span>{startIndex}</span>-<span>{endIndex}</span> 条，共 <span>{total}</span> 条记录
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

      {/* 文件上传模态框 */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50">
          <div className={styles.modalBackdrop} onClick={() => !isUploading && setShowUploadModal(false)}></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden ${styles.modalEnter}`}>
              {/* 模态框头部 */}
              <div className="px-6 py-4 border-b border-border-light flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary">上传文件</h3>
                <button 
                  onClick={() => !isUploading && setShowUploadModal(false)}
                  className="text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
                  disabled={isUploading}
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              
              {/* 模态框内容 */}
              <div className="px-6 py-4">
                {/* 文件选择区域 */}
                <div className="mb-6">
                  <div className="border-2 border-dashed border-border-light rounded-lg p-8 text-center hover:border-secondary transition-colors">
                    <input 
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload-input"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                      disabled={isUploading}
                    />
                    <label 
                      htmlFor="file-upload-input"
                      className="cursor-pointer"
                    >
                      <i className="fas fa-cloud-upload-alt text-4xl text-secondary mb-4"></i>
                      <p className="text-text-primary font-medium mb-2">点击选择文件或拖拽文件到此处</p>
                      <p className="text-sm text-text-secondary">支持 PDF、DOC、DOCX、JPG、PNG、GIF 格式</p>
                      <p className="text-sm text-text-secondary">单个文件大小不超过 10MB</p>
                    </label>
                  </div>
                </div>

                {/* 已选择的文件列表 */}
                {uploadFiles.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-text-primary mb-3">已选择的文件 ({uploadFiles.length})</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {uploadFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3 flex-1">
                            <i className={`fas ${getFileIcon(file)} text-secondary`}></i>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-text-primary truncate">{file.name}</p>
                              <p className="text-xs text-text-secondary">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          {!isUploading && (
                            <button 
                              onClick={() => removeUploadFile(index)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          )}
                          {isUploading && (
                            <div className="w-16">
                              <div className="text-xs text-text-secondary mb-1">
                                {Object.entries(uploadProgress).find(([key]) => key.includes(`_${index}`))?.[1] || 0}%
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1">
                                <div 
                                  className="bg-secondary h-1 rounded-full transition-all duration-300"
                                  style={{ width: `${Object.entries(uploadProgress).find(([key]) => key.includes(`_${index}`))?.[1] || 0}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 上传提示 */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <i className="fas fa-info-circle text-blue-600 mt-1"></i>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">上传说明：</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>请上传有效的证明材料，如证书、成绩单等</li>
                        <li>文件格式支持 PDF、DOC、DOCX、JPG、PNG、GIF</li>
                        <li>单个文件大小不超过 10MB</li>
                        <li>上传的文件将保存在您的个人文档库中</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 模态框底部 */}
              <div className="px-6 py-4 border-t border-border-light flex items-center justify-end space-x-3">
                <button 
                  onClick={() => !isUploading && setShowUploadModal(false)}
                  className="px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  disabled={isUploading}
                >
                  取消
                </button>
                <button 
                  onClick={uploadFilesToServer}
                  disabled={uploadFiles.length === 0 || isUploading}
                  className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isUploading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      上传中...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-upload mr-2"></i>
                      开始上传
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 文件预览模态框 */}
      {showDocumentModal && selectedDocument && (
        <div className="fixed inset-0 z-50">
          <div className={styles.modalBackdrop} onClick={closeModal}></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden ${styles.modalEnter}`}>
              {/* 模态框头部 */}
              <div className="px-6 py-4 border-b border-border-light flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary">文件预览 - {selectedDocument.title}</h3>
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
                      <i className={`${DocumentService.getFileIcon(selectedDocument.file_type, selectedDocument.document_type)} text-white text-xl`}></i>
                    </div>
                    <div>
                      <h4 className="font-medium text-text-primary">{selectedDocument.title}</h4>
                      <p className="text-sm text-text-secondary">{DocumentService.getDocumentTypeName(selectedDocument.document_type)} · {formatFileSize(selectedDocument.file_size)}</p>
                      <p className="text-sm text-text-secondary">上传时间：{formatDate(selectedDocument.created_at)}</p>
                      <p className="text-sm text-text-secondary">下载次数：{selectedDocument.download_count}</p>
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

