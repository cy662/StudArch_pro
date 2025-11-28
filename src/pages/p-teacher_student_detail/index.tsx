

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import styles from './styles.module.css';
import { RewardPunishmentService } from '../../services/rewardPunishmentService';
import { StudentProfileService } from '../../services/studentProfileService';
import { UserService } from '../../services/userService';
import { RewardPunishment, RewardPunishmentCreate, RewardPunishmentUpdate } from '../../types/rewardPunishment';
import RewardPunishmentForm from '../../components/RewardPunishmentForm';

interface StudentData {
  id: string;
  name: string;
  avatar: string;
  status: string;
  studentId: string;
  gender: string;
  birthDate: string;
  nationality: string;
  politicalStatus: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  college: string;
  major: string;
  className: string;
  enrollmentYear: string;
  studyDuration: string;
}

const TeacherStudentDetail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get('studentId');

  // 状态管理
  const [activeTab, setActiveTab] = useState<string>('basic');
  const [showEditProfileModal, setShowEditProfileModal] = useState<boolean>(false);

  const [showAddRewardModal, setShowAddRewardModal] = useState<boolean>(false);
  const [showEditGraduationModal, setShowEditGraduationModal] = useState<boolean>(false);
  const [destinationType, setDestinationType] = useState<string>('employment');
  const [rewardType, setRewardType] = useState<string>('reward');
  
  // 奖惩信息相关状态
  const [rewardPunishments, setRewardPunishments] = useState<RewardPunishment[]>([]);
  const [rewardPunishmentLoading, setRewardPunishmentLoading] = useState<boolean>(false);
  const [editingRewardPunishment, setEditingRewardPunishment] = useState<RewardPunishment | null>(null);
  const [showDeleteRewardModal, setShowDeleteRewardModal] = useState<boolean>(false);
  const [deleteRewardId, setDeleteRewardId] = useState<string>('');
  const [rewardFilters, setRewardFilters] = useState({
    type: undefined as 'reward' | 'punishment' | undefined
  });

  // 学生数据
  const [studentData, setStudentData] = useState<StudentData>({
    id: studentId || 'unknown',
    name: '加载中...',
    avatar: 'https://s.coze.cn/image/vdcOni23j40/',
    status: '未知',
    studentId: studentId || '未知',
    gender: '未知',
    birthDate: '未知',
    nationality: '未知',
    politicalStatus: '未知',
    phone: '未知',
    email: '未知',
    address: '未知',
    emergencyContact: '未知',
    emergencyPhone: '未知',
    college: '未知',
    major: '未知',
    className: '未知',
    enrollmentYear: '未知',
    studyDuration: '未知'
  });
  
  // 加载状态
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 加载学生数据
  useEffect(() => {
    const loadStudentData = async () => {
      if (!studentId) {
        setError('学生ID缺失，请通过学生列表页面访问');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // 首先，获取用户ID与档案ID的映射关系
        const profileMapping = await UserService.getProfileUserMapping([studentId]);
        
        // 获取用户基本信息和学生档案信息
        let userId = '';
        if (profileMapping.success && profileMapping.data && profileMapping.data.length > 0) {
          userId = profileMapping.data[0].user_id;
        } else {
          // 如果映射失败，尝试直接使用传入的ID作为用户ID
          userId = studentId;
        }
        
        // 获取学生个人信息
        const profileInfo = await StudentProfileService.getStudentProfile(userId);
        
        // 获取学生完整信息
        const completeInfo = await StudentProfileService.getStudentCompleteInfo(userId);
        
        // 整合数据
        const userInfo = completeInfo || {};
        
        // 构造学生数据对象
        const newStudentData: StudentData = {
          id: studentId,
          name: userInfo.full_name || '未知',
          avatar: userInfo.profile_photo || 'https://s.coze.cn/image/vdcOni23j40/',
          status: userInfo.profile_status_text || userInfo.user_status || '未知',
          studentId: userInfo.user_number || '未知',
          gender: userInfo.gender === 'male' ? '男' : userInfo.gender === 'female' ? '女' : userInfo.gender || '未知',
          birthDate: formatDate(userInfo.birth_date) || '未知',
          nationality: userInfo.nationality || '未知',
          politicalStatus: userInfo.political_status || '未知',
          phone: userInfo.profile_phone || userInfo.user_phone || '未知',
          email: userInfo.email || '未知',
          address: userInfo.home_address || '未知',
          emergencyContact: userInfo.emergency_contact || '未知',
          emergencyPhone: userInfo.emergency_phone || '未知',
          college: userInfo.department || '未知',
          major: completeInfo?.major || '未知',
          className: userInfo.profile_class_name || userInfo.user_class_name || '未知',
          enrollmentYear: userInfo.admission_date ? userInfo.admission_date.substring(0, 4) + '年' : '未知',
          studyDuration: completeInfo?.academic_system || '4年'
        };
        
        setStudentData(newStudentData);
      } catch (err) {
        console.error('加载学生数据失败:', err);
        setError('加载学生信息失败，请稍后重试');
        // 加载失败时使用默认数据
        setStudentData({
          id: studentId || 'unknown',
          name: '加载失败',
          avatar: 'https://s.coze.cn/image/vdcOni23j40/',
          status: '未知',
          studentId: studentId || '未知',
          gender: '未知',
          birthDate: '未知',
          nationality: '未知',
          politicalStatus: '未知',
          phone: '未知',
          email: '未知',
          address: '未知',
          emergencyContact: '未知',
          emergencyPhone: '未知',
          college: '未知',
          major: '未知',
          className: '未知',
          enrollmentYear: '未知',
          studyDuration: '未知'

        });
      } finally {
        setLoading(false);
      }
    };
    
    loadStudentData();
  }, [studentId]);
  
  // 辅助函数：格式化日期
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '年').replace(/\//, '月') + '日';
    } catch (e) {
      return '';
    }
  };
  
  // 加载奖惩信息
  const loadRewardPunishments = async () => {
    try {
      if (!studentId) {
        setRewardPunishments([]);
        return;
      }
      
      setRewardPunishmentLoading(true);
      const result = await RewardPunishmentService.getStudentRewardPunishments(
        studentId, 
        rewardFilters
      );
      setRewardPunishments(result.items);
    } catch (error) {
      console.error('加载奖惩信息失败:', error);
      setRewardPunishments([]);
    } finally {
      setRewardPunishmentLoading(false);
    }
  };

  // 设置页面标题和初始加载数据
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '学生档案详情 - 学档通';
    loadRewardPunishments();
    return () => { document.title = originalTitle; };
  }, [studentId]);

  // 当奖惩筛选条件改变时重新加载数据
  useEffect(() => {
    loadRewardPunishments();
  }, [rewardFilters]);

  // 标签页切换
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  // 模态框控制函数
  const showModal = (modalSetter: React.Dispatch<React.SetStateAction<boolean>>) => {
    modalSetter(true);
    document.body.style.overflow = 'hidden';
  };

  const hideModal = (modalSetter: React.Dispatch<React.SetStateAction<boolean>>) => {
    modalSetter(false);
    document.body.style.overflow = 'auto';
  };

  // 编辑档案
  const handleEditProfile = () => {
    showModal(setShowEditProfileModal);
  };

  const handleSaveEditProfile = () => {
    console.log('保存学生档案信息');
    hideModal(setShowEditProfileModal);
    alert('档案信息已更新');
  };



  // 新增奖惩
  const handleAddReward = () => {
    setEditingRewardPunishment(null);
    showModal(setShowAddRewardModal);
  };

  const handleSaveReward = async (formData: Partial<RewardPunishmentCreate>) => {
    try {
      console.log('🔍 开始保存奖惩信息...');
      console.log('📝 学生ID:', studentId);
      console.log('📝 表单数据:', formData);
      
      if (!studentId) {
        console.error('❌ 学生ID缺失');
        alert('学生ID缺失，无法保存奖惩信息');
        return;
      }

      // 验证UUID格式
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(studentId)) {
        console.error('❌ 学生ID格式无效:', studentId);
        alert('学生ID格式无效，请检查URL参数');
        return;
      }

      const rewardData: RewardPunishmentCreate = {
        student_id: studentId,
        type: formData.type || 'reward',
        name: formData.name || '',
        level: 'school', // 设置默认值，因为数据库字段是必需的
        category: formData.category,
        description: formData.description || '',
        date: formData.date || new Date().toISOString().split('T')[0],
        created_by: 'teacher001' // 实际项目中应该从认证状态获取
      };

      console.log('📦 准备保存的数据:', rewardData);

      if (editingRewardPunishment) {
        // 编辑模式
        console.log('🔧 编辑模式，ID:', editingRewardPunishment.id);
        await RewardPunishmentService.updateRewardPunishment(
          editingRewardPunishment.id,
          formData as RewardPunishmentUpdate
        );
        console.log('✅ 更新成功');
        alert('奖惩信息已更新');
      } else {
        // 新增模式
        console.log('➕ 新增模式');
        const result = await RewardPunishmentService.createRewardPunishment(rewardData);
        console.log('✅ 创建成功:', result);
        alert('奖惩信息已添加');
      }

      hideModal(setShowAddRewardModal);
      setEditingRewardPunishment(null);
      loadRewardPunishments(); // 重新加载数据
    } catch (error) {
      console.error('❌ 保存奖惩信息失败:', error);
      console.error('❌ 错误详情:', error instanceof Error ? error.message : '未知错误');
      alert(`保存失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // 编辑奖惩
  const handleEditReward = (reward: RewardPunishment) => {
    setEditingRewardPunishment(reward);
    setRewardType(reward.type);
    showModal(setShowAddRewardModal);
  };

  // 删除奖惩
  const handleDeleteReward = (id: string) => {
    setDeleteRewardId(id);
    showModal(setShowDeleteRewardModal);
  };

  const handleConfirmDeleteReward = async () => {
    try {
      await RewardPunishmentService.deleteRewardPunishment(deleteRewardId);
      alert('奖惩信息已删除');
      hideModal(setShowDeleteRewardModal);
      setDeleteRewardId('');
      loadRewardPunishments(); // 重新加载数据
    } catch (error) {
      console.error('删除奖惩信息失败:', error);
      alert('删除失败，请重试');
    }
  };

  // 筛选奖惩信息
  const handleRewardFilterChange = (filterType: string, value: any) => {
    setRewardPunishmentLoading(prev => prev);
    setRewardFilters(prev => ({
      ...prev,
      [filterType]: value || undefined
    }));
  };

  // 编辑毕业去向
  const handleEditGraduation = () => {
    showModal(setShowEditGraduationModal);
  };

  const handleSaveGraduation = () => {
    console.log('保存毕业去向信息');
    hideModal(setShowEditGraduationModal);
    alert('毕业去向信息已更新');
  };

  // 打印功能
  const handlePrint = () => {
    window.print();
  };

  // 退出登录
  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      navigate('/login');
    }
  };

  // 模态框背景点击关闭
  const handleModalBackdropClick = (modalSetter: React.Dispatch<React.SetStateAction<boolean>>) => {
    hideModal(modalSetter);
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
                src="https://s.coze.cn/image/Uvg6HvErqIs/" 
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
        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="mt-4 text-text-primary">加载学生信息中...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-500 rounded-lg">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </div>
        )}
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">学生档案详情</h2>
              <nav className="text-sm text-text-secondary">
                <span>首页</span>
                <i className="fas fa-chevron-right mx-2"></i>
                <span>我的学生</span>
                <i className="fas fa-chevron-right mx-2"></i>
                <span>学生档案详情</span>
              </nav>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={handleEditProfile}
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors"
              >
                <i className="fas fa-edit mr-2"></i>编辑档案
              </button>
              <button 
                onClick={handlePrint}
                className="px-4 py-2 border border-border-light text-text-primary rounded-lg hover:bg-gray-50 transition-colors"
              >
                <i className="fas fa-print mr-2"></i>打印
              </button>
            </div>
          </div>
        </div>

        {/* 学生基本信息卡片 */}
        <div className="bg-white rounded-xl shadow-card p-6 mb-8">
          <div className="flex items-start space-x-6">
            {/* 学生照片 */}
            <div className="flex-shrink-0">
              <img 
                src={studentData.avatar}
                alt={`${studentData.name}头像`} 
                className="w-24 h-32 rounded-lg object-cover border border-border-light"
              />
            </div>
            
            {/* 基本信息 */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-text-primary">{studentData.name}</h3>
                <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">{studentData.status}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <i className="fas fa-id-card text-text-secondary w-4"></i>
                  <div>
                    <div className="text-sm text-text-secondary">学号</div>
                    <div className="font-medium text-text-primary">{studentData.studentId}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <i className="fas fa-venus-mars text-text-secondary w-4"></i>
                  <div>
                    <div className="text-sm text-text-secondary">性别</div>
                    <div className="font-medium text-text-primary">{studentData.gender}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <i className="fas fa-calendar text-text-secondary w-4"></i>
                  <div>
                    <div className="text-sm text-text-secondary">出生日期</div>
                    <div className="font-medium text-text-primary">{studentData.birthDate}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <i className="fas fa-flag text-text-secondary w-4"></i>
                  <div>
                    <div className="text-sm text-text-secondary">民族</div>
                    <div className="font-medium text-text-primary">{studentData.nationality}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <i className="fas fa-heart text-text-secondary w-4"></i>
                  <div>
                    <div className="text-sm text-text-secondary">政治面貌</div>
                    <div className="font-medium text-text-primary">{studentData.politicalStatus}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <i className="fas fa-phone text-text-secondary w-4"></i>
                  <div>
                    <div className="text-sm text-text-secondary">联系电话</div>
                    <div className="font-medium text-text-primary">{studentData.phone}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <i className="fas fa-envelope text-text-secondary w-4"></i>
                  <div>
                    <div className="text-sm text-text-secondary">电子邮箱</div>
                    <div className="font-medium text-text-primary">{studentData.email}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <i className="fas fa-map-marker-alt text-text-secondary w-4"></i>
                  <div>
                    <div className="text-sm text-text-secondary">家庭住址</div>
                    <div className="font-medium text-text-primary">{studentData.address}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <i className="fas fa-user-friends text-text-secondary w-4"></i>
                  <div>
                    <div className="text-sm text-text-secondary">紧急联系人</div>
                    <div className="font-medium text-text-primary">{studentData.emergencyContact} {studentData.emergencyPhone}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 标签页导航 */}
        <div className="bg-white rounded-xl shadow-card mb-8">
          <div className="flex border-b border-border-light" role="tablist">
            <button 
              onClick={() => handleTabChange('basic')}
              className={`${activeTab === 'basic' ? styles.tabActive : styles.tabInactive} px-6 py-4 text-sm font-medium rounded-t-lg focus:outline-none transition-colors`}
              role="tab"
            >
              基本信息
            </button>

            <button 
              onClick={() => handleTabChange('rewards')}
              className={`${activeTab === 'rewards' ? styles.tabActive : styles.tabInactive} px-6 py-4 text-sm font-medium rounded-t-lg focus:outline-none transition-colors`}
              role="tab"
            >
              奖惩信息
            </button>
            <button 
              onClick={() => handleTabChange('graduation')}
              className={`${activeTab === 'graduation' ? styles.tabActive : styles.tabInactive} px-6 py-4 text-sm font-medium rounded-t-lg focus:outline-none transition-colors`}
              role="tab"
            >
              毕业去向
            </button>
          </div>

          {/* 基本信息内容 */}
          <div className={`${styles.tabContent} ${activeTab !== 'basic' ? styles.tabContentHidden : ''} p-6`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 学籍信息 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-text-primary mb-3">学籍信息</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">院系</span>
                    <span className="font-medium">{studentData.college}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">专业</span>
                    <span className="font-medium">{studentData.major}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">班级</span>
                    <span className="font-medium">{studentData.className}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">入学年份</span>
                    <span className="font-medium">{studentData.enrollmentYear}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">学制</span>
                    <span className="font-medium">{studentData.studyDuration}</span>
                  </div>

                </div>
              </div>


            </div>
          </div>



          {/* 奖惩信息内容 */}
          <div className={`${styles.tabContent} ${activeTab !== 'rewards' ? styles.tabContentHidden : ''} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-text-primary">奖惩记录</h4>
              <button 
                onClick={handleAddReward}
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors text-sm"
              >
                <i className="fas fa-plus mr-2"></i>新增奖惩
              </button>
            </div>

            {/* 筛选条件 */}
            <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-text-secondary">类型:</label>
                <select 
                  value={rewardFilters.type || ''}
                  onChange={(e) => handleRewardFilterChange('type', e.target.value)}
                  className="px-3 py-1 text-sm border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                >
                  <option value="">全部</option>
                  <option value="reward">奖励</option>
                  <option value="punishment">惩罚</option>
                </select>
              </div>


            </div>

            {/* 奖惩统计信息 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <i className="fas fa-trophy text-green-600 text-2xl"></i>
                </div>
                <div className="text-2xl font-bold text-green-800">
                  {rewardPunishments.filter(r => r.type === 'reward').length}
                </div>
                <div className="text-sm text-green-600">奖励记录</div>
              </div>
              <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
                </div>
                <div className="text-2xl font-bold text-red-800">
                  {rewardPunishments.filter(r => r.type === 'punishment').length}
                </div>
                <div className="text-sm text-red-600">惩罚记录</div>
              </div>

            </div>

            {/* 奖惩列表 */}
            <div className="space-y-4">
              {rewardPunishmentLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <i className="fas fa-spinner fa-spin text-2xl text-secondary mb-4"></i>
                    <p className="text-text-secondary">加载中...</p>
                  </div>
                </div>
              ) : rewardPunishments.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <i className="fas fa-clipboard-list text-4xl text-gray-300 mb-4"></i>
                    <p className="text-text-secondary mb-4">暂无奖惩记录</p>
                    <button 
                      onClick={handleAddReward}
                      className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors"
                    >
                      新增奖惩
                    </button>
                  </div>
                </div>
              ) : (
                (() => {
                  // 按年份分组
                  const groupedRewards = rewardPunishments.reduce((groups, reward) => {
                    const year = new Date(reward.date).getFullYear();
                    if (!groups[year]) {
                      groups[year] = { rewards: [], punishments: [] };
                    }
                    if (reward.type === 'reward') {
                      groups[year].rewards.push(reward);
                    } else {
                      groups[year].punishments.push(reward);
                    }
                    return groups;
                  }, {} as Record<number, { rewards: RewardPunishment[], punishments: RewardPunishment[] }>);

                  // 按年份倒序排列
                  const sortedYears = Object.keys(groupedRewards).map(Number).sort((a, b) => b - a);

                  return sortedYears.map(year => (
                    <div key={year} className="mb-6">
                      <h5 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                        <i className="fas fa-calendar-alt mr-2 text-secondary"></i>
                        {year}年度
                      </h5>
                      
                      {/* 奖励记录 */}
                      {groupedRewards[year].rewards.length > 0 && (
                        <div className="mb-4">
                          <h6 className="text-sm font-medium text-green-700 mb-3">奖励记录</h6>
                          <div className="space-y-3">
                            {groupedRewards[year].rewards
                              .map((reward) => (
                                <div 
                                  key={reward.id}
                                  className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <i className="fas fa-trophy text-green-600"></i>
                                        <span className="font-semibold text-green-800">{reward.name}</span>
                                        <span className="px-2 py-1 text-xs bg-green-200 text-green-800 rounded">奖励</span>


                                      </div>
                                      <p className="text-sm text-green-700 mb-2">{reward.description}</p>
                                      <div className="flex items-center space-x-4 text-xs text-green-600">
                                        <span><i className="fas fa-calendar mr-1"></i>{reward.date}</span>
                                        <span><i className="fas fa-user mr-1"></i>管理员</span>

                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <button 
                                        onClick={() => handleEditReward(reward)}
                                        className="text-green-600 hover:text-green-800 transition-colors"
                                        title="编辑"
                                      >
                                        <i className="fas fa-edit"></i>
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteReward(reward.id)}
                                        className="text-green-600 hover:text-green-800 transition-colors"
                                        title="删除"
                                      >
                                        <i className="fas fa-trash"></i>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                      
                      {/* 惩罚记录 */}
                      {groupedRewards[year].punishments.length > 0 && (
                        <div>
                          <h6 className="text-sm font-medium text-red-700 mb-3">惩罚记录</h6>
                          <div className="space-y-3">
                            {groupedRewards[year].punishments
                              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                              .map((punishment) => (
                                <div 
                                  key={punishment.id}
                                  className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <i className="fas fa-exclamation-triangle text-red-600"></i>
                                        <span className="font-semibold text-red-800">{punishment.name}</span>
                                        <span className="px-2 py-1 text-xs bg-red-200 text-red-800 rounded">惩罚</span>


                                      </div>
                                      <p className="text-sm text-red-700 mb-2">{punishment.description}</p>
                                      <div className="flex items-center space-x-4 text-xs text-red-600">
                                        <span><i className="fas fa-calendar mr-1"></i>{punishment.date}</span>
                                        <span><i className="fas fa-user mr-1"></i>管理员</span>

                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <button 
                                        onClick={() => handleEditReward(punishment)}
                                        className="text-red-600 hover:text-red-800 transition-colors"
                                        title="编辑"
                                      >
                                        <i className="fas fa-edit"></i>
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteReward(punishment.id)}
                                        className="text-red-600 hover:text-red-800 transition-colors"
                                        title="删除"
                                      >
                                        <i className="fas fa-trash"></i>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ));
                })()
              )}
            </div>
          </div>

          {/* 毕业去向内容 */}
          <div className={`${styles.tabContent} ${activeTab !== 'graduation' ? styles.tabContentHidden : ''} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-text-primary">毕业去向</h4>
              <button 
                onClick={handleEditGraduation}
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors text-sm"
              >
                <i className="fas fa-edit mr-2"></i>编辑去向
              </button>
            </div>
            
            <div className="bg-white border border-border-light rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-text-primary mb-3">去向信息</h5>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">去向类型</span>
                      <span className="font-medium">就业</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">单位名称</span>
                      <span className="font-medium">阿里巴巴（中国）有限公司</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">单位性质</span>
                      <span className="font-medium">互联网企业</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">职位</span>
                      <span className="font-medium">前端开发工程师</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">工作地点</span>
                      <span className="font-medium">浙江省杭州市</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">薪资</span>
                      <span className="font-medium">15K/月</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">入职时间</span>
                      <span className="font-medium">2024年7月1日</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-text-primary mb-3">审核状态</h5>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <i className="fas fa-check-circle text-green-500 text-3xl mb-2"></i>
                    <div className="font-medium text-green-800">已审核通过</div>
                    <div className="text-sm text-green-600 mt-1">审核人：张老师</div>
                    <div className="text-sm text-green-600">审核时间：2024年1月10日</div>
                  </div>
                  
                  <h5 className="font-medium text-text-primary mb-3 mt-6">证明材料</h5>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <i className="fas fa-file-pdf text-red-500"></i>
                        <span className="text-sm">就业协议书.pdf</span>
                      </div>
                      <button className="text-secondary hover:text-accent transition-colors">
                        <i className="fas fa-download"></i>
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <i className="fas fa-file-pdf text-red-500"></i>
                        <span className="text-sm">录用通知书.pdf</span>
                      </div>
                      <button className="text-secondary hover:text-accent transition-colors">
                        <i className="fas fa-download"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 编辑档案模态框 */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50">
          <div 
            className={styles.modalBackdrop}
            onClick={() => handleModalBackdropClick(setShowEditProfileModal)}
          ></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`${styles.modalEnter} bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between p-6 border-b border-border-light">
                <h3 className="text-lg font-semibold text-text-primary">编辑学生档案</h3>
                <button 
                  onClick={() => hideModal(setShowEditProfileModal)}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">联系电话</label>
                    <input 
                      type="tel" 
                      className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent" 
                      defaultValue={studentData.phone}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">电子邮箱</label>
                    <input 
                      type="email" 
                      className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent" 
                      defaultValue={studentData.email}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-primary mb-2">家庭住址</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent" 
                      defaultValue={studentData.address}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">紧急联系人</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent" 
                      defaultValue={studentData.emergencyContact}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">紧急联系电话</label>
                    <input 
                      type="tel" 
                      className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent" 
                      defaultValue={studentData.emergencyPhone}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-border-light">
                <button 
                  onClick={() => hideModal(setShowEditProfileModal)}
                  className="px-4 py-2 border border-border-light text-text-primary rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={handleSaveEditProfile}
                  className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* 新增/编辑奖惩模态框 */}
      {showAddRewardModal && (
        <RewardPunishmentForm
          reward={editingRewardPunishment}
          onSave={handleSaveReward}
          onCancel={() => {
            hideModal(setShowAddRewardModal);
            setEditingRewardPunishment(null);
          }}
        />
      )}

      {/* 删除确认模态框 */}
      {showDeleteRewardModal && (
        <div className="fixed inset-0 z-50">
          <div 
            className={styles.modalBackdrop}
            onClick={() => handleModalBackdropClick(setShowDeleteRewardModal)}
          ></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`${styles.modalEnter} bg-white rounded-xl shadow-lg w-full max-w-md`}>
              <div className="flex items-center justify-between p-6 border-b border-border-light">
                <h3 className="text-lg font-semibold text-text-primary">确认删除</h3>
                <button 
                  onClick={() => hideModal(setShowDeleteRewardModal)}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              <div className="p-6">
                <div className="text-center mb-6">
                  <i className="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
                  <p className="text-text-primary">确定要删除这条奖惩记录吗？</p>
                  <p className="text-sm text-text-secondary mt-2">此操作不可恢复</p>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-border-light">
                <button 
                  onClick={() => hideModal(setShowDeleteRewardModal)}
                  className="px-4 py-2 border border-border-light text-text-primary rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={handleConfirmDeleteReward}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 编辑毕业去向模态框 */}
      {showEditGraduationModal && (
        <div className="fixed inset-0 z-50">
          <div 
            className={styles.modalBackdrop}
            onClick={() => handleModalBackdropClick(setShowEditGraduationModal)}
          ></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`${styles.modalEnter} bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between p-6 border-b border-border-light">
                <h3 className="text-lg font-semibold text-text-primary">编辑毕业去向</h3>
                <button 
                  onClick={() => hideModal(setShowEditGraduationModal)}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">去向类型</label>
                    <select 
                      value={destinationType}
                      onChange={(e) => setDestinationType(e.target.value)}
                      className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                    >
                      <option value="employment">就业</option>
                      <option value="further-study">升学</option>
                      <option value="entrepreneurship">自主创业</option>
                      <option value="abroad">出国</option>
                      <option value="unemployed">待业</option>
                      <option value="other">其他</option>
                    </select>
                  </div>
                  
                  {/* 就业相关字段 */}
                  {destinationType === 'employment' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">单位名称</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent" 
                          defaultValue="阿里巴巴（中国）有限公司"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">单位性质</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent" 
                          defaultValue="互联网企业"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">职位</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent" 
                          defaultValue="前端开发工程师"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">工作地点</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent" 
                          defaultValue="浙江省杭州市"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">薪资</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent" 
                          defaultValue="15K/月"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">入职时间</label>
                        <input 
                          type="date" 
                          className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent" 
                          defaultValue="2024-07-01"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* 升学相关字段 */}
                  {destinationType === 'further-study' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">学校名称</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">专业</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">学历层次</label>
                        <select className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent">
                          <option>硕士研究生</option>
                          <option>博士研究生</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-border-light">
                <button 
                  onClick={() => hideModal(setShowEditGraduationModal)}
                  className="px-4 py-2 border border-border-light text-text-primary rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={handleSaveGraduation}
                  className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherStudentDetail;

