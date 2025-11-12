

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import styles from './styles.module.css';

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
  counselor: string;
  hometown: string;
  entranceScore: string;
  entranceMethod: string;
  entranceDate: string;
}

const TeacherStudentDetail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get('studentId') || '2021001';

  // 状态管理
  const [activeTab, setActiveTab] = useState<string>('basic');
  const [showEditProfileModal, setShowEditProfileModal] = useState<boolean>(false);
  const [showAddGradeModal, setShowAddGradeModal] = useState<boolean>(false);
  const [showAddRewardModal, setShowAddRewardModal] = useState<boolean>(false);
  const [showEditGraduationModal, setShowEditGraduationModal] = useState<boolean>(false);
  const [destinationType, setDestinationType] = useState<string>('employment');
  const [rewardType, setRewardType] = useState<string>('reward');

  // 学生数据
  const [studentData] = useState<StudentData>({
    id: studentId,
    name: '李小明',
    avatar: 'https://s.coze.cn/image/vdcOni23j40/',
    status: '在读',
    studentId: '2021001',
    gender: '男',
    birthDate: '2003年5月15日',
    nationality: '汉族',
    politicalStatus: '共青团员',
    phone: '138****5678',
    email: 'lixiaoming@example.com',
    address: '河南省郑州市金水区',
    emergencyContact: '李大明 (父亲)',
    emergencyPhone: '139****1234',
    college: '计算机学院',
    major: '计算机科学与技术',
    className: '计算机科学与技术1班',
    enrollmentYear: '2021年',
    studyDuration: '4年',
    counselor: '张老师',
    hometown: '河南省郑州市',
    entranceScore: '625分',
    entranceMethod: '普通高考',
    entranceDate: '2021年9月1日'
  });

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '学生档案详情 - 学档通';
    return () => { document.title = originalTitle; };
  }, []);

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

  // 录入成绩
  const handleAddGrade = () => {
    showModal(setShowAddGradeModal);
  };

  const handleSaveGrade = () => {
    console.log('保存成绩信息');
    hideModal(setShowAddGradeModal);
    alert('成绩已录入');
  };

  // 新增奖惩
  const handleAddReward = () => {
    showModal(setShowAddRewardModal);
  };

  const handleSaveReward = () => {
    console.log('保存奖惩信息');
    hideModal(setShowAddRewardModal);
    alert('奖惩信息已添加');
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
              onClick={() => handleTabChange('academic')}
              className={`${activeTab === 'academic' ? styles.tabActive : styles.tabInactive} px-6 py-4 text-sm font-medium rounded-t-lg focus:outline-none transition-colors`}
              role="tab"
            >
              学业信息
            </button>
            <button 
              onClick={() => handleTabChange('rewards')}
              className={`${activeTab === 'rewards' ? styles.tabActive : styles.tabInactive} px-6 py-4 text-sm font-medium rounded-t-lg focus:outline-none transition-colors`}
              role="tab"
            >
              奖惩信息
            </button>
            <button 
              onClick={() => handleTabChange('practice')}
              className={`${activeTab === 'practice' ? styles.tabActive : styles.tabInactive} px-6 py-4 text-sm font-medium rounded-t-lg focus:outline-none transition-colors`}
              role="tab"
            >
              社会实践
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
                  <div className="flex justify-between">
                    <span className="text-text-secondary">辅导员</span>
                    <span className="font-medium">{studentData.counselor}</span>
                  </div>
                </div>
              </div>

              {/* 入学信息 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-text-primary mb-3">入学信息</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">生源地</span>
                    <span className="font-medium">{studentData.hometown}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">高考成绩</span>
                    <span className="font-medium">{studentData.entranceScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">入学方式</span>
                    <span className="font-medium">{studentData.entranceMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">入学时间</span>
                    <span className="font-medium">{studentData.entranceDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 学业信息内容 */}
          <div className={`${styles.tabContent} ${activeTab !== 'academic' ? styles.tabContentHidden : ''} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-text-primary">学业成绩</h4>
              <button 
                onClick={handleAddGrade}
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors text-sm"
              >
                <i className="fas fa-plus mr-2"></i>录入成绩
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">课程名称</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">课程代码</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">学期</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">成绩</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">学分</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">绩点</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-border-light">
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary">高等数学</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary">MATH101</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary">2021-2022学年第1学期</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">85</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary">4.0</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary">3.5</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm space-x-2">
                      <button className="text-secondary hover:text-accent transition-colors">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="text-red-500 hover:text-red-700 transition-colors">
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary">大学英语</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary">ENG101</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary">2021-2022学年第1学期</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">92</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary">3.0</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary">4.0</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm space-x-2">
                      <button className="text-secondary hover:text-accent transition-colors">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="text-red-500 hover:text-red-700 transition-colors">
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary">程序设计基础</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary">CS101</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary">2021-2022学年第2学期</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">88</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary">4.0</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary">3.7</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm space-x-2">
                      <button className="text-secondary hover:text-accent transition-colors">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="text-red-500 hover:text-red-700 transition-colors">
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* 学业统计 */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-text-primary">3.73</div>
                <div className="text-sm text-text-secondary">平均绩点</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-text-primary">11.0</div>
                <div className="text-sm text-text-secondary">已获学分</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-text-primary">88.3</div>
                <div className="text-sm text-text-secondary">平均成绩</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-text-primary">85%</div>
                <div className="text-sm text-text-secondary">课程完成率</div>
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
            
            <div className="space-y-4">
              {/* 奖励记录 */}
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <i className="fas fa-trophy text-green-600"></i>
                      <span className="font-semibold text-green-800">校级奖学金</span>
                      <span className="px-2 py-1 text-xs bg-green-200 text-green-800 rounded">奖励</span>
                    </div>
                    <p className="text-sm text-green-700 mb-2">获得2021-2022学年校级一等奖学金</p>
                    <div className="flex items-center space-x-4 text-xs text-green-600">
                      <span><i className="fas fa-calendar mr-1"></i>2022年10月15日</span>
                      <span><i className="fas fa-user mr-1"></i>张老师</span>
                    </div>
                  </div>
                  <button className="text-green-600 hover:text-green-800 transition-colors">
                    <i className="fas fa-edit"></i>
                  </button>
                </div>
              </div>
              
              {/* 奖励记录 */}
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <i className="fas fa-medal text-green-600"></i>
                      <span className="font-semibold text-green-800">优秀学生干部</span>
                      <span className="px-2 py-1 text-xs bg-green-200 text-green-800 rounded">奖励</span>
                    </div>
                    <p className="text-sm text-green-700 mb-2">被评为2022年度优秀学生干部</p>
                    <div className="flex items-center space-x-4 text-xs text-green-600">
                      <span><i className="fas fa-calendar mr-1"></i>2023年3月20日</span>
                      <span><i className="fas fa-user mr-1"></i>张老师</span>
                    </div>
                  </div>
                  <button className="text-green-600 hover:text-green-800 transition-colors">
                    <i className="fas fa-edit"></i>
                  </button>
                </div>
              </div>
              
              {/* 惩罚记录 */}
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <i className="fas fa-exclamation-triangle text-red-600"></i>
                      <span className="font-semibold text-red-800">迟到警告</span>
                      <span className="px-2 py-1 text-xs bg-red-200 text-red-800 rounded">警告</span>
                    </div>
                    <p className="text-sm text-red-700 mb-2">因多次上课迟到，给予口头警告</p>
                    <div className="flex items-center space-x-4 text-xs text-red-600">
                      <span><i className="fas fa-calendar mr-1"></i>2022年12月5日</span>
                      <span><i className="fas fa-user mr-1"></i>张老师</span>
                    </div>
                  </div>
                  <button className="text-red-600 hover:text-red-800 transition-colors">
                    <i className="fas fa-edit"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 社会实践内容 */}
          <div className={`${styles.tabContent} ${activeTab !== 'practice' ? styles.tabContentHidden : ''} p-6`}>
            <h4 className="font-semibold text-text-primary mb-4">社会实践经历</h4>
            
            <div className="space-y-4">
              <div className="bg-white border border-border-light rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h5 className="font-medium text-text-primary">社区志愿者服务</h5>
                    <p className="text-sm text-text-secondary mt-1">郑州市金水区社区服务中心</p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">2022年暑假</span>
                </div>
                <p className="text-sm text-text-secondary mb-3">参与社区疫情防控志愿服务，负责体温检测和信息登记工作，累计服务时长120小时。</p>
                <div className="flex items-center space-x-4 text-xs text-text-secondary">
                  <span><i className="fas fa-clock mr-1"></i>120小时</span>
                  <span><i className="fas fa-file-alt mr-1"></i>已认证</span>
                </div>
              </div>
              
              <div className="bg-white border border-border-light rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h5 className="font-medium text-text-primary">科技创新大赛</h5>
                    <p className="text-sm text-text-secondary mt-1">河南省大学生科技创新大赛</p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">2023年3月</span>
                </div>
                <p className="text-sm text-text-secondary mb-3">作为团队负责人，带领团队参加省级科技创新大赛，获得二等奖。</p>
                <div className="flex items-center space-x-4 text-xs text-text-secondary">
                  <span><i className="fas fa-trophy mr-1"></i>二等奖</span>
                  <span><i className="fas fa-users mr-1"></i>团队负责人</span>
                </div>
              </div>
              
              <div className="bg-white border border-border-light rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h5 className="font-medium text-text-primary">企业实习</h5>
                    <p className="text-sm text-text-secondary mt-1">郑州某科技有限公司</p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">2023年暑假</span>
                </div>
                <p className="text-sm text-text-secondary mb-3">在技术部门担任前端开发实习生，参与公司产品开发，掌握了React等前端技术。</p>
                <div className="flex items-center space-x-4 text-xs text-text-secondary">
                  <span><i className="fas fa-calendar mr-1"></i>2个月</span>
                  <span><i className="fas fa-star mr-1"></i>优秀实习生</span>
                </div>
              </div>
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

      {/* 录入成绩模态框 */}
      {showAddGradeModal && (
        <div className="fixed inset-0 z-50">
          <div 
            className={styles.modalBackdrop}
            onClick={() => handleModalBackdropClick(setShowAddGradeModal)}
          ></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`${styles.modalEnter} bg-white rounded-xl shadow-lg w-full max-w-md`}>
              <div className="flex items-center justify-between p-6 border-b border-border-light">
                <h3 className="text-lg font-semibold text-text-primary">录入成绩</h3>
                <button 
                  onClick={() => hideModal(setShowAddGradeModal)}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">课程名称</label>
                    <select className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent">
                      <option>数据结构</option>
                      <option>计算机网络</option>
                      <option>数据库原理</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">学期</label>
                    <select className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent">
                      <option>2023-2024学年第1学期</option>
                      <option>2023-2024学年第2学期</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">成绩</label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent" 
                      placeholder="请输入成绩"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">学分</label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent" 
                      placeholder="请输入学分"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-border-light">
                <button 
                  onClick={() => hideModal(setShowAddGradeModal)}
                  className="px-4 py-2 border border-border-light text-text-primary rounded-lg hover:bg-gray-50 transition-colors"
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

      {/* 新增奖惩模态框 */}
      {showAddRewardModal && (
        <div className="fixed inset-0 z-50">
          <div 
            className={styles.modalBackdrop}
            onClick={() => handleModalBackdropClick(setShowAddRewardModal)}
          ></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`${styles.modalEnter} bg-white rounded-xl shadow-lg w-full max-w-md`}>
              <div className="flex items-center justify-between p-6 border-b border-border-light">
                <h3 className="text-lg font-semibold text-text-primary">新增奖惩</h3>
                <button 
                  onClick={() => hideModal(setShowAddRewardModal)}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">奖惩类型</label>
                    <select 
                      value={rewardType}
                      onChange={(e) => setRewardType(e.target.value)}
                      className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                    >
                      <option value="reward">奖励</option>
                      <option value="punishment">惩罚</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">奖惩名称</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent" 
                      placeholder="请输入奖惩名称"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">奖惩等级</label>
                    <select className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent">
                      <option>校级</option>
                      <option>省级</option>
                      <option>国家级</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">描述</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent" 
                      rows={3} 
                      placeholder="请输入详细描述"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">日期</label>
                    <input 
                      type="date" 
                      className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-border-light">
                <button 
                  onClick={() => hideModal(setShowAddRewardModal)}
                  className="px-4 py-2 border border-border-light text-text-primary rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={handleSaveReward}
                  className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors"
                >
                  保存
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

