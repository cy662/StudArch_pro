import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationDestinationService } from '../../services/graduationDestinationService';
import { GraduationDestination } from '../../types/graduationDestination';
import { useAuth } from '../../hooks/useAuth';
import styles from './styles.module.css';



const TeacherGraduationManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // 获取当前登录用户信息
  
  // 状态管理
  const [searchKeyword, setSearchKeyword] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isSelectAll, setIsSelectAll] = useState(false);
  
  // 弹窗状态
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  // 当前操作的数据ID
  const [currentDetailId, setCurrentDetailId] = useState<string | null>(null);
  const [currentEditId, setCurrentEditId] = useState<string | null>(null);
  const [currentReviewId, setCurrentReviewId] = useState<string | null>(null);
  
  // 审核意见
  const [reviewComment, setReviewComment] = useState('');
  
  

  // 毕业去向数据
  const [graduationData, setGraduationData] = useState<GraduationDestination[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // 加载数据
  const loadGraduationData = async () => {
    setLoading(true);
    try {
      // 获取当前教师的ID
      const currentTeacherId = user?.id;
      
      // 如果没有获取到教师ID，不执行查询
      if (!currentTeacherId) {
        console.warn('未获取到当前教师ID，用户信息:', user);
        setGraduationData([]);
        setTotal(0);
        return;
      }
      
      console.log('=== 教师毕业去向数据加载 ===');
      console.log('当前教师ID:', currentTeacherId);
      console.log('教师用户信息:', {
        id: user?.id,
        username: user?.username,
        user_number: user?.user_number,
        full_name: user?.full_name
      });
      console.log('查询参数:', { typeFilter, statusFilter, searchKeyword });
      
      const result = await GraduationDestinationService.getGraduationDestinations({
        destination_type: typeFilter,
        status: statusFilter,
        student_name: searchKeyword,
        page: 1,
        limit: 100,
        teacher_id: currentTeacherId  // 传递教师ID进行数据隔离
      });
      
      console.log('API调用结果:', {
        成功: true,
        返回记录数: result.destinations.length,
        总记录数: result.total,
        数据列表: result.destinations.map(item => ({
          学生学号: item.student?.student_number,
          学生姓名: item.student?.full_name,
          去向类型: item.destination_type,
          状态: item.status
        }))
      });
      
      // 特别检查学生2022666
      const student2022666 = result.destinations.find(item => item.student?.student_number === '2022666');
      if (student2022666) {
        console.log('✅ 找到学生2022666的毕业去向记录:', student2022666);
      } else {
        console.log('❌ 未找到学生2022666的毕业去向记录');
      }
      
      setGraduationData(result.destinations);
      setTotal(result.total);
    } catch (error) {
      console.error('加载毕业去向数据失败:', error);
      setGraduationData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  

  // 设置页面标题和初始加载
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '毕业去向管理 - 学档通';
    loadGraduationData();
    return () => { document.title = originalTitle; };
  }, [user]); // 添加user依赖

  // 筛选条件变化时重新加载数据
  useEffect(() => {
    loadGraduationData();
  }, [searchKeyword, classFilter, typeFilter, statusFilter, user]); // 添加user依赖

  // 全选功能
  useEffect(() => {
    if (isSelectAll) {
      const allIds = graduationData.map(item => item.id);
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
    setIsSelectAll(newSelectedItems.size === graduationData.length && newSelectedItems.size > 0);
  };

  

  // 下载证明材料文件
  const handleDownloadProofFile = (fileName: string) => {
    // 这里应该实现实际的文件下载逻辑
    // 由于目前没有真实的文件存储系统，我们只是模拟下载
    alert(`模拟下载文件: ${fileName}
在实际应用中，这里会下载真实的证明材料文件。`);
    
    // 创建一个模拟的下载链接
    const link = document.createElement('a');
    link.href = '#';
    link.download = fileName;
    link.click();
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
  const updateGraduationStatus = async (id: string, status: 'approved' | 'rejected', reason?: string) => {
    try {
      await GraduationDestinationService.reviewGraduationDestination(id, status, reason);
      loadGraduationData();
    } catch (error) {
      console.error('更新毕业去向状态失败:', error);
      alert('更新状态失败，请重试');
    }
  };

  // 编辑表单提交
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('保存毕业去向编辑');
    setShowEditModal(false);
    setCurrentEditId(null);
  };

  // 获取去向类型文本
  const getDestinationTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      'employment': '就业',
      'furtherstudy': '升学',
      'abroad': '出国',
      'entrepreneurship': '创业',
      'unemployed': '待业',
      'other': '其他'
    };
    return typeMap[type] || type;
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': '待审核',
      'approved': '已通过',
      'rejected': '已驳回'
    };
    return statusMap[status] || status;
  };

  // 渲染详情内容
  const renderDetailContent = () => {
    const data = graduationData.find(item => item.id === currentDetailId);
    if (!data) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-text-primary mb-3">基本信息</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-secondary">学号：</span>
                <span className="text-text-primary">{data.student?.student_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">姓名：</span>
                <span className="text-text-primary">{data.student?.student_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">班级：</span>
                <span className="text-text-primary">{data.student?.class_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">去向类型：</span>
                <span className={`px-2 py-1 text-xs font-medium ${styles[`type${data.destination_type.charAt(0).toUpperCase() + data.destination_type.slice(1)}`]} rounded-full`}>
                  {getDestinationTypeText(data.destination_type)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">审核状态：</span>
                <span className={`px-2 py-1 text-xs font-medium ${styles[`status${data.status.charAt(0).toUpperCase() + data.status.slice(1)}`]} rounded-full`}>
                  {getStatusText(data.status)}
                </span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-text-primary mb-3">详细信息</h4>
            <div className="space-y-2">
              {data.destination_type === 'employment' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">单位名称：</span>
                    <span className="text-text-primary">{data.company_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">职位：</span>
                    <span className="text-text-primary">{data.position}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">薪资：</span>
                    <span className="text-text-primary">{data.salary ? `${data.salary}元/月` : '未填写'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">工作地点：</span>
                    <span className="text-text-primary">{data.work_location}</span>
                  </div>
                </>
              )}
              {(data.destination_type === 'furtherstudy' || data.destination_type === 'abroad') && (
                <>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">学校名称：</span>
                    <span className="text-text-primary">{data.school_name}</span>
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
              {data.destination_type === 'entrepreneurship' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">公司名称：</span>
                    <span className="text-text-primary">{data.startup_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">职位：</span>
                    <span className="text-text-primary">{data.startup_role}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-text-secondary">提交时间：</span>
                <span className="text-text-primary">{data.submit_time ? new Date(data.submit_time).toLocaleString('zh-CN') : ''}</span>
              </div>
              {data.status === 'approved' && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">审核通过时间：</span>
                  <span className="text-text-primary">{data.reviewed_at ? new Date(data.reviewed_at).toLocaleString('zh-CN') : ''}</span>
                </div>
              )}
              {data.status === 'rejected' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">驳回时间：</span>
                    <span className="text-text-primary">{data.reviewed_at ? new Date(data.reviewed_at).toLocaleString('zh-CN') : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">驳回原因：</span>
                    <span className="text-red-600">{data.review_comment}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="border-t pt-4">
          <h4 className="font-medium text-text-primary mb-3">证明材料</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {data.proof_files && data.proof_files.length > 0 ? (
              data.proof_files.map((file: string, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-text-primary">{file}</span>
                  <button 
                    onClick={() => handleDownloadProofFile(file)}
                    className="text-secondary hover:text-accent transition-colors"
                  >
                    <i className="fas fa-download"></i>
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center text-gray-500 py-4">
                暂无证明材料
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 渲染编辑表单
  const renderEditForm = () => {
    const data = graduationData.find(item => item.id === currentEditId);
    if (!data) return null;

    const [editType, setEditType] = useState(data.destination_type);

    const renderEditDetails = () => {
      switch(editType) {
        case 'employment':
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">单位名称 *</label>
                <input type="text" defaultValue={data.company_name || ''} required className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary" />
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
                <input type="text" defaultValue={data.work_location || ''} className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary" />
              </div>
            </div>
          );
        case 'furtherstudy':
        case 'abroad':
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">学校名称 *</label>
                <input type="text" defaultValue={data.school_name || ''} required className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary" />
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
                <input type="text" defaultValue={data.startup_name || ''} required className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">创业角色</label>
                <input type="text" defaultValue={data.startup_role || ''} className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary" />
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
            <input type="text" value={data.student?.student_number || ''} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">姓名</label>
            <input type="text" value={data.student?.full_name || ''} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">班级</label>
            <input type="text" value={data.student?.class_name || ''} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
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
    const data = graduationData.find(item => item.id === currentReviewId);
    if (!data) return null;

    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-text-secondary">学号：</span>
          <span className="text-text-primary">{data.student?.student_number}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">姓名：</span>
          <span className="text-text-primary">{data.student?.full_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">班级：</span>
          <span className="text-text-primary">{data.student?.class_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">去向类型：</span>
          <span className={`px-2 py-1 text-xs font-medium ${styles[`type${data.destination_type.charAt(0).toUpperCase() + data.destination_type.slice(1)}`]} rounded-full`}>
            {getDestinationTypeText(data.destination_type)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">单位/学校：</span>
          <span className="text-text-primary">{data.company_name || data.school_name || data.startup_name || '-'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">提交时间：</span>
          <span className="text-text-primary">{data.submit_time ? new Date(data.submit_time).toLocaleString('zh-CN') : ''}</span>
        </div>
        <div className="border-t pt-4">
          <h5 className="font-medium text-text-primary mb-2">证明材料</h5>
          <div className="space-y-1">
            {data.proof_files && data.proof_files.length > 0 ? (
              data.proof_files.map((file: string, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-text-primary">{file}</span>
                  <button 
                    onClick={() => handleDownloadProofFile(file)}
                    className="text-secondary hover:text-accent transition-colors text-sm"
                  >
                    <i className="fas fa-download mr-1"></i>下载
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-2">
                暂无证明材料
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 表格显示的数据已经通过API过滤，直接使用
  const displayData = graduationData;

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
          

          <Link to="/teacher-graduation-management" className={`${styles.navItem} ${styles.navItemActive} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors`}>
            <i className="fas fa-rocket text-lg"></i>
            <span className="font-medium">毕业去向管理</span>
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
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-text-secondary">
                      <i className="fas fa-spinner fa-spin text-2xl mb-2"></i>
                      <div>加载中...</div>
                    </td>
                  </tr>
                ) : displayData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-text-secondary">
                      <i className="fas fa-inbox text-2xl mb-2"></i>
                      <div>暂无毕业去向数据</div>
                    </td>
                  </tr>
                ) : (
                  displayData.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        checked={selectedItems.has(record.id)}
                        onChange={() => handleItemSelect(record.id)}
                        className="rounded border-border-light"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{record.student?.student_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-text-primary">{record.student?.full_name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{record.student?.class_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium ${styles[`type${record.destination_type.charAt(0).toUpperCase() + record.destination_type.slice(1)}`]} rounded-full`}>
                        {getDestinationTypeText(record.destination_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                      {record.company_name || record.school_name || record.startup_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium ${styles[`status${record.status.charAt(0).toUpperCase() + record.status.slice(1)}`]} rounded-full`}>
                        {getStatusText(record.status)}
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
                )))}
              </tbody>
            </table>
          </div>
          
          {/* 分页 */}
          <div className="px-6 py-4 border-t border-border-light flex items-center justify-between">
            <div className="text-sm text-text-secondary">
              显示 1-{displayData.length} 条，共 {total} 条记录
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

