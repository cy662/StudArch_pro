

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

interface TabType {
  id: string;
  label: string;
  content: string;
}

const StudentMyProfile: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('basic');

  const tabs: TabType[] = [
    { id: 'basic', label: '基本信息', content: 'basic-content' },
    { id: 'academic', label: '学籍信息', content: 'academic-content' },
    { id: 'study', label: '学业信息', content: 'study-content' },
    { id: 'awards', label: '奖惩信息', content: 'awards-content' },
    { id: 'practice', label: '社会实践', content: 'practice-content' },
    { id: 'graduation', label: '毕业去向', content: 'graduation-content' }
  ];

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '我的档案 - 学档通';
    return () => { document.title = originalTitle; };
  }, []);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleEditProfileClick = () => {
    navigate('/student-profile-edit');
  };

  const handleFillGraduationClick = () => {
    navigate('/student-graduation-fill');
  };

  const handleLogoutClick = () => {
    if (confirm('确定要退出登录吗？')) {
      navigate('/login');
    }
  };

  const handleNotificationClick = () => {
    // 消息通知功能
    console.log('Notification clicked');
  };

  const handleUserInfoClick = () => {
    // 用户信息点击
    console.log('User info clicked');
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
            <button 
              onClick={handleNotificationClick}
              className="relative p-2 text-text-secondary hover:text-secondary transition-colors"
            >
              <i className="fas fa-bell text-lg"></i>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">1</span>
            </button>
            
            {/* 用户信息 */}
            <div 
              onClick={handleUserInfoClick}
              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
            >
              <img 
                src="https://s.coze.cn/image/sFgjeSbTJRw/" 
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
              onClick={handleLogoutClick}
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
            className={`${styles.navItem} ${styles.navItemActive} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors`}
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
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-file-alt text-lg"></i>
            <span className="font-medium">信息查看与下载</span>
          </Link>
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="ml-64 mt-16 p-6 min-h-screen">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">我的档案</h2>
              <nav className="text-sm text-text-secondary">
                <span>首页</span>
                <i className="fas fa-chevron-right mx-2"></i>
                <span>我的档案</span>
              </nav>
            </div>
            <button 
              onClick={handleEditProfileClick}
              className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors"
            >
              <i className="fas fa-edit mr-2"></i>
              编辑信息
            </button>
          </div>
        </div>

        {/* 个人概览卡片 */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center space-x-6">
              <img 
                src="https://s.coze.cn/image/hAFUsHRaPGI/" 
                alt="李小明头像" 
                className="w-20 h-20 rounded-full" 
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-text-primary mb-2">李小明</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-text-secondary">学号：</span>
                    <span className="text-text-primary font-medium">2021001</span>
                  </div>
                  <div>
                    <span className="text-text-secondary">班级：</span>
                    <span className="text-text-primary font-medium">计算机科学与技术1班</span>
                  </div>
                  <div>
                    <span className="text-text-secondary">学籍状态：</span>
                    <span className="text-green-600 font-medium">在读</span>
                  </div>
                  <div>
                    <span className="text-text-secondary">入学年份：</span>
                    <span className="text-text-primary font-medium">2021年</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 档案信息标签页 */}
        <section className="mb-8">
          {/* 标签页导航 */}
          <div className="flex space-x-4 mb-6" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg focus:outline-none ${
                  activeTab === tab.id ? styles.tabActive : styles.tabInactive
                }`}
                role="tab"
                aria-controls={tab.content}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 基本信息 */}
          <div className={`${styles.tabContent} ${activeTab !== 'basic' ? styles.tabContentHidden : ''} bg-white rounded-xl shadow-card p-6`}>
            <h4 className="text-lg font-semibold text-text-primary mb-4">基本信息</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-text-secondary">姓名：</span>
                  <span className="text-text-primary font-medium">李小明</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">性别：</span>
                  <span className="text-text-primary font-medium">男</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">民族：</span>
                  <span className="text-text-primary font-medium">汉族</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">出生日期：</span>
                  <span className="text-text-primary font-medium">2003年5月15日</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">政治面貌：</span>
                  <span className="text-text-primary font-medium">共青团员</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-text-secondary">联系电话：</span>
                  <span className="text-text-primary font-medium">138****5678</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">电子邮箱：</span>
                  <span className="text-text-primary font-medium">lixiaoming@example.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">家庭住址：</span>
                  <span className="text-text-primary font-medium">河南省郑州市金水区</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">紧急联系人：</span>
                  <span className="text-text-primary font-medium">李建国</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">紧急联系电话：</span>
                  <span className="text-text-primary font-medium">139****9876</span>
                </div>
              </div>
            </div>
          </div>

          {/* 学籍信息 */}
          <div className={`${styles.tabContent} ${activeTab !== 'academic' ? styles.tabContentHidden : ''} bg-white rounded-xl shadow-card p-6`}>
            <h4 className="text-lg font-semibold text-text-primary mb-4">学籍信息</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-text-secondary">院系：</span>
                  <span className="text-text-primary font-medium">计算机学院</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">专业：</span>
                  <span className="text-text-primary font-medium">计算机科学与技术</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">班级：</span>
                  <span className="text-text-primary font-medium">计算机科学与技术1班</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">入学年份：</span>
                  <span className="text-text-primary font-medium">2021年</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">学制：</span>
                  <span className="text-text-primary font-medium">四年</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-text-secondary">学籍状态：</span>
                  <span className="text-green-600 font-medium">在读</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">辅导员：</span>
                  <span className="text-text-primary font-medium">张老师</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">入学方式：</span>
                  <span className="text-text-primary font-medium">普通高考</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">生源地：</span>
                  <span className="text-text-primary font-medium">河南省郑州市</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">高考成绩：</span>
                  <span className="text-text-primary font-medium">625分</span>
                </div>
              </div>
            </div>
          </div>

          {/* 学业信息 */}
          <div className={`${styles.tabContent} ${activeTab !== 'study' ? styles.tabContentHidden : ''} bg-white rounded-xl shadow-card p-6`}>
            <h4 className="text-lg font-semibold text-text-primary mb-4">学业信息</h4>
            
            {/* 总体学业情况 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">3.78</div>
                <div className="text-sm text-text-secondary">平均绩点</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">128</div>
                <div className="text-sm text-text-secondary">已获学分</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">160</div>
                <div className="text-sm text-text-secondary">总学分</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">80%</div>
                <div className="text-sm text-text-secondary">完成进度</div>
              </div>
            </div>

            {/* 成绩列表 */}
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-border-light">
                  <tr>
                    <td className="px-4 py-3 text-sm text-text-primary">高等数学A</td>
                    <td className="px-4 py-3 text-sm text-text-primary">MATH101</td>
                    <td className="px-4 py-3 text-sm text-text-primary">2021-2022学年第1学期</td>
                    <td className="px-4 py-3 text-sm text-text-primary">85</td>
                    <td className="px-4 py-3 text-sm text-text-primary">5</td>
                    <td className="px-4 py-3 text-sm text-text-primary">3.5</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-text-primary">大学英语</td>
                    <td className="px-4 py-3 text-sm text-text-primary">ENG101</td>
                    <td className="px-4 py-3 text-sm text-text-primary">2021-2022学年第1学期</td>
                    <td className="px-4 py-3 text-sm text-text-primary">92</td>
                    <td className="px-4 py-3 text-sm text-text-primary">4</td>
                    <td className="px-4 py-3 text-sm text-text-primary">4.0</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-text-primary">程序设计基础</td>
                    <td className="px-4 py-3 text-sm text-text-primary">CS101</td>
                    <td className="px-4 py-3 text-sm text-text-primary">2021-2022学年第2学期</td>
                    <td className="px-4 py-3 text-sm text-text-primary">88</td>
                    <td className="px-4 py-3 text-sm text-text-primary">4</td>
                    <td className="px-4 py-3 text-sm text-text-primary">3.7</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-text-primary">数据结构</td>
                    <td className="px-4 py-3 text-sm text-text-primary">CS201</td>
                    <td className="px-4 py-3 text-sm text-text-primary">2022-2023学年第1学期</td>
                    <td className="px-4 py-3 text-sm text-text-primary">95</td>
                    <td className="px-4 py-3 text-sm text-text-primary">5</td>
                    <td className="px-4 py-3 text-sm text-text-primary">4.0</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-text-primary">计算机网络</td>
                    <td className="px-4 py-3 text-sm text-text-primary">CS301</td>
                    <td className="px-4 py-3 text-sm text-text-primary">2022-2023学年第2学期</td>
                    <td className="px-4 py-3 text-sm text-text-primary">81</td>
                    <td className="px-4 py-3 text-sm text-text-primary">4</td>
                    <td className="px-4 py-3 text-sm text-text-primary">3.2</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 奖惩信息 */}
          <div className={`${styles.tabContent} ${activeTab !== 'awards' ? styles.tabContentHidden : ''} bg-white rounded-xl shadow-card p-6`}>
            <h4 className="text-lg font-semibold text-text-primary mb-4">奖惩信息</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-trophy text-green-600"></i>
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-text-primary">校级奖学金</h5>
                  <p className="text-sm text-text-secondary mt-1">获得2021-2022学年校级一等奖学金</p>
                  <p className="text-xs text-text-secondary mt-1">2022年9月</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-medal text-blue-600"></i>
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-text-primary">优秀学生干部</h5>
                  <p className="text-sm text-text-secondary mt-1">被评为2022年度优秀学生干部</p>
                  <p className="text-xs text-text-secondary mt-1">2023年3月</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 bg-yellow-50 rounded-lg">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-award text-yellow-600"></i>
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-text-primary">学科竞赛获奖</h5>
                  <p className="text-sm text-text-secondary mt-1">在全国大学生数学建模竞赛中获得省级二等奖</p>
                  <p className="text-xs text-text-secondary mt-1">2023年11月</p>
                </div>
              </div>
            </div>
          </div>

          {/* 社会实践 */}
          <div className={`${styles.tabContent} ${activeTab !== 'practice' ? styles.tabContentHidden : ''} bg-white rounded-xl shadow-card p-6`}>
            <h4 className="text-lg font-semibold text-text-primary mb-4">社会实践</h4>
            <div className="space-y-4">
              <div className="border border-border-light rounded-lg p-4">
                <h5 className="font-medium text-text-primary mb-2">暑期社会实践</h5>
                <p className="text-sm text-text-secondary mb-2">参与"乡村振兴"暑期社会实践活动，在河南省某乡村进行为期一个月的支教工作</p>
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>2022年7月-8月</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">已完成</span>
                </div>
              </div>
              
              <div className="border border-border-light rounded-lg p-4">
                <h5 className="font-medium text-text-primary mb-2">志愿服务</h5>
                <p className="text-sm text-text-secondary mb-2">参与校园疫情防控志愿服务，累计服务时长120小时</p>
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>2022年9月-12月</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">已完成</span>
                </div>
              </div>
              
              <div className="border border-border-light rounded-lg p-4">
                <h5 className="font-medium text-text-primary mb-2">企业实习</h5>
                <p className="text-sm text-text-secondary mb-2">在某知名互联网公司担任前端开发实习生，参与实际项目开发</p>
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>2023年7月-9月</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">已完成</span>
                </div>
              </div>
            </div>
          </div>

          {/* 毕业去向 */}
          <div className={`${styles.tabContent} ${activeTab !== 'graduation' ? styles.tabContentHidden : ''} bg-white rounded-xl shadow-card p-6`}>
            <h4 className="text-lg font-semibold text-text-primary mb-4">毕业去向</h4>
            <div className="space-y-6">
              {/* 当前状态 */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <i className="fas fa-info-circle text-blue-600"></i>
                  <span className="font-medium text-text-primary">当前状态</span>
                </div>
                <p className="text-sm text-text-secondary">尚未填报毕业去向，请及时完成毕业去向填报</p>
                <button 
                  onClick={handleFillGraduationClick}
                  className="mt-3 px-4 py-2 bg-secondary text-white text-sm rounded-lg hover:bg-accent transition-colors"
                >
                  立即填报
                </button>
              </div>

              {/* 填报说明 */}
              <div className="border border-border-light rounded-lg p-4">
                <h5 className="font-medium text-text-primary mb-3">填报说明</h5>
                <div className="space-y-2 text-sm text-text-secondary">
                  <div className="flex items-start space-x-2">
                    <i className="fas fa-check-circle text-green-600 mt-1"></i>
                    <span>请根据实际情况选择去向类型：就业、升学、创业、出国、待业等</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <i className="fas fa-check-circle text-green-600 mt-1"></i>
                    <span>需上传相关证明材料，如就业协议、录取通知书等</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <i className="fas fa-check-circle text-green-600 mt-1"></i>
                    <span>填报信息需经辅导员审核通过后方可生效</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentMyProfile;

