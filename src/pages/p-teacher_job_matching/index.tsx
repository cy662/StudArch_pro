import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

const P_teacher_job_matching: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [jobDescription, setJobDescription] = useState('');

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '岗位匹配与推送 - 学档通';
    
    // 获取当前用户信息
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
      const userData = JSON.parse(userInfo);
      setCurrentUser(userData);
    }
    
    return () => { document.title = originalTitle; };
  }, []);

  const handleLogoutClick = () => {
    if (confirm('确定要退出登录吗？')) {
      navigate('/login');
    }
  };

  const handleMatch = async () => {
    if (!jobDescription.trim()) {
      alert('请输入岗位描述');
      return;
    }
    
    console.log('开始匹配岗位:', jobDescription);
    
    try {
      // 通过现有的 API 服务器代理发送到 n8n Webhook
      const webhookUrl = 'http://localhost:3001/api/webhook-proxy';
      const requestData = {
        岗位信息: jobDescription,
        提交时间: new Date().toLocaleString('zh-CN'),
        操作用户: currentUser?.full_name || currentUser?.username || '教师'
      };
      
      console.log('正在发送请求到 API 代理:', webhookUrl);
      console.log('请求数据:', requestData);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      const responseData = await response.json();
      console.log('API 代理响应:', responseData);
      
      if (response.ok && responseData.success) {
        console.log('Webhook 请求发送成功！');
        alert('岗位信息已成功提交到 n8n 工作流！');
      } else {
        console.error('API 代理请求失败:', responseData);
        alert(`提交失败: ${responseData.message || '未知错误'}`);
      }
      
    } catch (error) {
      console.error('发送 Webhook 请求时出错:', error);
      
      // 如果 API 服务器不可用，尝试直接发送
      try {
        console.log('API 服务器不可用，尝试直接发送...');
        const webhookUrl = 'https://liu0521.app.n8n.cloud/webhook/014a3e71-b221-460d-8de8-1c5bb4c02dad';
        const requestData = {
          岗位信息: jobDescription,
          提交时间: new Date().toLocaleString('zh-CN'),
          操作用户: currentUser?.full_name || currentUser?.username || '教师'
        };
        
        const response = await fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData)
        });
        
        console.log('直接请求已发送（no-cors 模式）');
        alert('岗位信息已提交（通过直接请求）');
        
      } catch (directError) {
        console.error('直接请求也失败:', directError);
        alert('提交失败，请确保 API 服务器正在运行');
      }
    }
    
    // 这里后续可以添加其他匹配逻辑
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
              <img 
                src="https://s.coze.cn/image/hatzc53pi4k/" 
                alt="教师头像" 
                className="w-8 h-8 rounded-full" 
              />
              <div className="text-sm">
                <div className="font-medium text-text-primary">
                  {currentUser?.full_name || currentUser?.username || '教师'}
                </div>
                <div className="text-text-secondary">辅导员</div>
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
      <aside className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-border-light ${styles.sidebarTransition} z-40`}>
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
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
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
            to="/teacher-job-matching" 
            className={`${styles.navItem} ${styles.navItemActive} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors`}
          >
            <i className="fas fa-briefcase text-lg"></i>
            <span className="font-medium">岗位匹配与推送</span>
          </Link>
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="ml-64 mt-16 p-6 min-h-screen">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                岗位匹配与推送
              </h2>
              <nav className="text-sm text-text-secondary">
                <span>教师管理平台 / 岗位匹配与推送</span>
              </nav>
            </div>
          </div>
        </div>

        {/* 主要功能区域 */}
        <div className="grid grid-cols-1 gap-6">
          {/* 岗位描述输入卡片 */}
          <div className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300`}>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mr-4">
                <i className="fas fa-briefcase text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">岗位信息录入</h3>
                <p className="text-sm text-text-secondary">详细描述岗位需求，系统将智能匹配合适的学生</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  岗位描述 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="请输入详细的岗位描述，包括：&#10;• 岗位职责和工作内容&#10;• 专业技能要求&#10;• 学历和证书要求&#10;• 工作经验要求&#10;• 薪资待遇范围&#10;• 工作地点和时间要求"
                  className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  style={{ lineHeight: '1.6' }}
                />
              </div>

              <div className="flex justify-center pt-4">
                <button
                  onClick={handleMatch}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <i className="fas fa-search"></i>
                  <span>立即匹配</span>
                </button>
              </div>
            </div>
          </div>

          {/* 匹配结果卡片 */}
          <div className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300`}>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center mr-4">
                <i className="fas fa-users text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">匹配结果</h3>
                <p className="text-sm text-text-secondary">符合岗位要求的学生推荐列表</p>
              </div>
            </div>

            <div className="text-center py-16 text-gray-500">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-user-search text-4xl text-gray-400"></i>
              </div>
              <h4 className="text-lg font-medium text-gray-600 mb-2">暂无匹配结果</h4>
              <p className="text-sm text-gray-500">请先输入岗位描述并点击"立即匹配"按钮</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default P_teacher_job_matching;