

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import styles from './styles.module.css';
import { UserWithRole } from '../../types/user';
import { useAuth } from '../../hooks/useAuth';
import useStudentProfile from '../../hooks/useStudentProfile';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading, needsProfileCompletion, clearProfileCompletionReminder } = useAuth();
  const [showProfileReminder, setShowProfileReminder] = useState(false);
  const [loading, setLoading] = useState(true);

  // 使用useStudentProfile hook获取个人信息状态
  const { 
    profile, 
    loading: profileLoading, 
    getCompletionRate,
    isProfileComplete 
  } = useStudentProfile(currentUser?.id || '');

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '学生服务平台 - 学档通';
    
    // 检查是否需要显示个人信息完成提醒
    if (needsProfileCompletion()) {
      setShowProfileReminder(true);
    }
    
    setLoading(false);
    
    return () => { document.title = originalTitle; };
  }, [needsProfileCompletion]);

  // 处理关闭提醒
  const handleCloseReminder = () => {
    setShowProfileReminder(false);
    clearProfileCompletionReminder();
  };

  // 立即填写个人信息
  const handleFillProfile = () => {
    handleCloseReminder();
    navigate('/student-profile-edit');
  };



  const handleLogoutClick = () => {
    if (confirm('确定要退出登录吗？')) {
      navigate('/login');
    }
  };

  const handleExportProfile = async () => {
    try {
      // 显示导出提示
      message.loading('档案导出中，请稍候...', 0);
      
      // 获取学生信息
      const studentProfile = profile || {};
      const userInfo = currentUser || {};
      
      // 获取学生学习信息（包含课程相关数据）
      let learningInfo = {
        technical_tags: [],
        learning_achievements: [],
        learning_outcomes: [],
        courses: []
      };
      
      if (studentProfile.id) {
        try {
          // 1. 获取学习数据汇总
          const response = await fetch(`/api/student-learning/get-summary/${studentProfile.id}`);
          if (response.ok) {
            const result = await response.json();
            learningInfo = {
              technical_tags: result.data.technical_tags || [],
              learning_achievements: result.data.learning_achievements || [],
              learning_outcomes: result.data.learning_outcomes || []
            };
          }
          

        } catch (learningError) {
          console.warn('获取学习信息失败，将不包含课程相关数据:', learningError);
          // 继续导出基础信息，即使学习信息获取失败
        }
      }
      
      // 创建PDF内容的HTML元素
      const pdfContent = document.createElement('div');
      pdfContent.id = 'pdf-export-content';
      pdfContent.style.position = 'fixed';
      pdfContent.style.top = '0';
      pdfContent.style.left = '0';
      pdfContent.style.width = '100%';
      pdfContent.style.height = '100%';
      pdfContent.style.zIndex = '-1';
      pdfContent.style.visibility = 'hidden';
      pdfContent.style.padding = '2cm';
      pdfContent.style.backgroundColor = 'white';
      pdfContent.style.fontFamily = 'Arial, sans-serif';
      
      // 构建PDF内容
      const exportDate = new Date();
      const formattedDate = exportDate.toLocaleDateString('zh-CN');
      
      pdfContent.innerHTML = `
        <div style="max-width: 210mm; margin: 0 auto;">
          <!-- 标题部分 -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-size: 24px; color: #333; margin-bottom: 10px;">学生档案</h1>
            <p style="font-size: 14px; color: #666;">导出日期: ${formattedDate}</p>
          </div>
          
          <!-- 个人信息部分 (含证件照) -->
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 18px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px;">个人基本信息</h2>
            <div style="display: flex; gap: 30px; margin-bottom: 20px;">
              <!-- 证件照 -->
              <div style="flex-shrink: 0;">
                <img 
                  src="${profile?.profile_photo || currentUser?.avatar || 'https://via.placeholder.com/150x200?text=无照片'}" 
                  alt="学生证件照" 
                  style="width: 150px; height: 200px; object-fit: cover; border: 1px solid #ddd;"
                />
                <div style="text-align: center; margin-top: 5px; font-size: 12px; color: #666;">证件照</div>
              </div>
              
              <!-- 基本信息表格 -->
              <table style="flex: 1; border-collapse: collapse;">
                <tbody>
                  <tr>
                    <td style="width: 25%; padding: 8px 0; font-weight: bold;">姓名:</td>
                    <td style="width: 75%; padding: 8px 0;">${studentProfile.full_name || userInfo.name || userInfo.full_name || studentProfile.name || '未知'}</td>
                  </tr>
                  <tr>
                    <td style="width: 25%; padding: 8px 0; font-weight: bold;">学号:</td>
                    <td style="width: 75%; padding: 8px 0;">${userInfo.username || studentProfile.student_id || '未知'}</td>
                  </tr>
                  <tr>
                    <td style="width: 25%; padding: 8px 0; font-weight: bold;">班级:</td>
                    <td style="width: 75%; padding: 8px 0;">${userInfo.class_name || studentProfile.class_name || '未知'}</td>
                  </tr>
                  <tr>
                    <td style="width: 25%; padding: 8px 0; font-weight: bold;">专业:</td>
                    <td style="width: 75%; padding: 8px 0;">${studentProfile.major || '未知'}</td>
                  </tr>
                  <tr>
                    <td style="width: 25%; padding: 8px 0; font-weight: bold;">性别:</td>
                    <td style="width: 75%; padding: 8px 0;">${studentProfile.gender === 'male' ? '男' : studentProfile.gender === 'female' ? '女' : '未知'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- 更多详细信息 -->
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <tbody>
                <tr>
                  <td style="width: 25%; padding: 8px 0; font-weight: bold;">出生日期:</td>
                  <td style="width: 75%; padding: 8px 0;">${studentProfile.birth_date ? new Date(studentProfile.birth_date).toLocaleDateString('zh-CN') : '未知'}</td>
                </tr>
                <tr>
                  <td style="width: 25%; padding: 8px 0; font-weight: bold;">入学时间:</td>
                  <td style="width: 75%; padding: 8px 0;">${studentProfile.admission_date ? new Date(studentProfile.admission_date).toLocaleDateString('zh-CN') : '未知'}</td>
                </tr>
                <tr>
                  <td style="width: 25%; padding: 8px 0; font-weight: bold;">联系电话:</td>
                  <td style="width: 75%; padding: 8px 0;">${studentProfile.phone || userInfo.phone || '未知'}</td>
                </tr>
                <tr>
                  <td style="width: 25%; padding: 8px 0; font-weight: bold;">电子邮箱:</td>
                  <td style="width: 75%; padding: 8px 0;">${studentProfile.email || userInfo.email || '未知'}</td>
                </tr>
                <tr>
                  <td style="width: 25%; padding: 8px 0; font-weight: bold;">身份证号:</td>
                  <td style="width: 75%; padding: 8px 0;">${studentProfile.id_card || '未知'}</td>
                </tr>
                <tr>
                  <td style="width: 25%; padding: 8px 0; font-weight: bold;">籍贯:</td>
                  <td style="width: 75%; padding: 8px 0;">${studentProfile.native_place || studentProfile.home_address || '未知'}</td>
                </tr>
                <tr>
                  <td style="width: 25%; padding: 8px 0; font-weight: bold;">政治面貌:</td>
                  <td style="width: 75%; padding: 8px 0;">${studentProfile.political_status || '未知'}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- 统一技术标签展示 -->
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 18px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px;">🏷️ 技术标签汇总</h2>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${learningInfo.technical_tags.length > 0 
                ? [...new Set(learningInfo.technical_tags.map(tag => tag.tag_name))].sort().map(tagName => 
                    `<span style="
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      padding: 6px 12px;
                      border-radius: 20px;
                      font-size: 12px;
                      font-weight: 500;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    ">${tagName}</span>`
                  ).join('')
                : '<p style="color: #999;">暂无技术标签信息</p>'
              }
            </div>
            ${learningInfo.technical_tags.length > 0 ? `
              <div style="margin-top: 10px; font-size: 12px; color: #666;">
                📊 共掌握 ${[...new Set(learningInfo.technical_tags.map(tag => tag.tag_name))].length} 项技术技能
              </div>
            ` : ''}
          </div>
          
          <!-- 课程学习详情（按课程分组展示收获和成果） -->
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 18px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px;">📚 课程学习详情</h2>
            
            ${
              // 按课程分组数据
              (() => {
                const courseGroups: Record<string, {achievements: any[], outcomes: any[]}> = {};
                
                // 处理学习收获
                learningInfo.learning_achievements.forEach((achievement: any) => {
                  const courseName = achievement.related_course || 
                                   achievement.title?.split(' - ')[0] || 
                                   '未分类收获';
                  if (!courseGroups[courseName]) {
                    courseGroups[courseName] = { achievements: [], outcomes: [] };
                  }
                  courseGroups[courseName].achievements.push(achievement);
                });
                
                // 处理学习成果
                learningInfo.learning_outcomes.forEach((outcome: any) => {
                  const courseName = outcome.related_course || 
                                   outcome.outcome_title?.split(' - ')[0] || 
                                   '未分类成果';
                  if (!courseGroups[courseName]) {
                    courseGroups[courseName] = { achievements: [], outcomes: [] };
                  }
                  courseGroups[courseName].outcomes.push(outcome);
                });
                
                return Object.keys(courseGroups).length > 0 
                  ? Object.entries(courseGroups).map(([courseName, data], index) => `
                    <div style="
                      margin-bottom: 25px;
                      padding: 20px;
                      background: white;
                      border: 1px solid #e1e8ed;
                      border-radius: 8px;
                      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                    ">
                      <!-- 课程标题 -->
                      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                        <h3 style="
                          font-size: 16px;
                          font-weight: bold;
                          color: #2c3e50;
                          margin: 0;
                        ">${index + 1}. ${courseName}</h3>
                        <div style="display: flex; align-items: center; gap: 10px; font-size: 12px;">
                          <span style="
                            padding: 4px 8px;
                            background: #d4edda;
                            color: #155724;
                            border-radius: 4px;
                            font-weight: 500;
                          ">已录入</span>
                        </div>
                      </div>

                      <!-- 学习收获 -->
                      <div style="margin-bottom: 15px;">
                        <div style="font-size: 13px; font-weight: 600; color: #2c3e50; margin-bottom: 8px; display: flex; align-items: center;">
                          <span style="margin-right: 5px;">💡</span> 学习收获
                        </div>
                        <div style="
                          padding: 12px;
                          background: #fefefe;
                          border: 1px solid #f0f0f0;
                          border-radius: 6px;
                          font-size: 13px;
                          line-height: 1.6;
                          color: #555;
                          min-height: 40px;
                        ">
                          ${data.achievements.length > 0 
                            ? (() => {
                                // 按更新时间排序，取最新的
                                const latestAchievement = data.achievements.sort((a, b) => 
                                  new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
                                )[0];
                                return latestAchievement.content || latestAchievement.description || '暂无详细描述';
                              })()
                            : '<span style="color: #999; font-style: italic;">暂未填写学习收获</span>'
                          }
                        </div>
                      </div>

                      <!-- 学习成果 -->
                      <div>
                        <div style="font-size: 13px; font-weight: 600; color: #2c3e50; margin-bottom: 8px; display: flex; align-items: center;">
                          <span style="margin-right: 5px;">🏆</span> 学习成果
                        </div>
                        <div style="
                          padding: 12px;
                          background: #fefefe;
                          border: 1px solid #f0f0f0;
                          border-radius: 6px;
                          font-size: 13px;
                          line-height: 1.6;
                          color: #555;
                          min-height: 40px;
                        ">
                          ${data.outcomes.length > 0 
                            ? (() => {
                                // 按更新时间排序，取最新的
                                const latestOutcome = data.outcomes.sort((a, b) => 
                                  new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
                                )[0];
                                return latestOutcome.outcome_description || latestOutcome.description || '暂无详细描述';
                              })()
                            : '<span style="color: #999; font-style: italic;">暂未填写学习成果</span>'
                          }
                        </div>
                      </div>
                    </div>
                  `).join('')
                  : '<div style="color: #999; text-align: center; padding: 20px;">📝 暂无课程学习数据</div>';
              })()
            }
          </div>
          
          <!-- 学习统计信息 -->
          <div style="
            padding: 20px;
            background: #f0f8ff;
            border-radius: 8px;
            border-left: 4px solid #4299e1;
            margin-bottom: 30px;
          ">
            <h3 style="font-size: 16px; font-weight: bold; color: #2c3e50; margin: 0 0 15px 0;">
              <span style="margin-right: 5px;">📊</span>学习统计
            </h3>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; text-align: center;">
              <div>
                <div style="font-size: 24px; font-weight: bold; color: #3498db; margin-bottom: 5px;">
                  ${(() => {
                    const courseGroups: Record<string, any> = {};
                    learningInfo.learning_achievements.forEach((achievement: any) => {
                      const courseName = achievement.related_course || achievement.title?.split(' - ')[0] || '未分类';
                      courseGroups[courseName] = true;
                    });
                    learningInfo.learning_outcomes.forEach((outcome: any) => {
                      const courseName = outcome.related_course || outcome.outcome_title?.split(' - ')[0] || '未分类';
                      courseGroups[courseName] = true;
                    });
                    return Object.keys(courseGroups).length;
                  })()}
                </div>
                <div style="font-size: 12px; color: #666;">涉及课程数</div>
              </div>
              <div>
                <div style="font-size: 24px; font-weight: bold; color: #27ae60; margin-bottom: 5px;">
                  ${learningInfo.learning_achievements.length}
                </div>
                <div style="font-size: 12px; color: #666;">收获记录</div>
              </div>
              <div>
                <div style="font-size: 24px; font-weight: bold; color: #f39c12; margin-bottom: 5px;">
                  ${learningInfo.learning_outcomes.length}
                </div>
                <div style="font-size: 12px; color: #666;">成果记录</div>
              </div>
              <div>
                <div style="font-size: 24px; font-weight: bold; color: #e74c3c; margin-bottom: 5px;">
                  ${[...new Set(learningInfo.technical_tags.map((tag: any) => tag.tag_name))].length}
                </div>
                <div style="font-size: 12px; color: #666;">技术技能</div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // 添加到DOM
      document.body.appendChild(pdfContent);
      
      // 保存原始打印样式
      const originalTitle = document.title;
      document.title = `学生档案_${userInfo.name || userInfo.full_name || studentProfile.name || '未命名'}_${formattedDate}`;
      
      // 打印样式
      const printStyle = document.createElement('style');
      printStyle.id = 'print-style';
      printStyle.textContent = `
        @media print {
          body > :not(#pdf-export-content) {
            display: none !important;
          }
          
          #pdf-export-content {
            visibility: visible !important;
            z-index: 9999 !important;
            position: static !important;
            padding: 0 !important;
          }
          
          @page {
            margin: 2cm;
          }
        }
      `;
      document.head.appendChild(printStyle);
      
      // 显示打印预览对话框
      setTimeout(() => {
        window.print();
        
        // 清理
        document.body.removeChild(pdfContent);
        document.head.removeChild(printStyle);
        document.title = originalTitle;
        
        // 显示导出完成提示
        message.success('档案已准备好导出，请在打印对话框中选择「保存为PDF」完成导出！');
      }, 100);
    } catch (error) {
      console.error('导出档案失败:', error);
      message.error('导出档案失败，请重试');
    }
  };

  const handleQuickActionClick = (path: string) => {
    navigate(path);
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
            <Link 
              to="/student-my-profile"
              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
            >
              <img 
                src={profile?.profile_photo || currentUser?.avatar || "https://s.coze.cn/image/DQIklNDlQyw/"} 
                alt="学生头像" 
                className="w-8 h-8 rounded-full object-cover" 
              />
              <div className="text-sm">
                <div className="font-medium text-text-primary">
                  {loading ? '加载中...' : (currentUser?.full_name || currentUser?.username || '未知用户')}
                </div>
                <div className="text-text-secondary">
                  {loading ? '加载中...' : (currentUser?.class_name || '未知班级')}
                </div>
              </div>
              <i className="fas fa-chevron-down text-xs text-text-secondary"></i>
            </Link>
            
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
            to="/student-dashboard" 
            className={`${styles.navItem} ${styles.navItemActive} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors`}
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
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
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
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                欢迎回来，{loading ? '加载中...' : (currentUser?.full_name || currentUser?.username || '同学')}同学
              </h2>
              <nav className="text-sm text-text-secondary">
                <span>首页</span>
              </nav>
            </div>
            <div className="text-right">
              <div className="text-sm text-text-secondary">今天是</div>
              <div className="text-lg font-medium text-text-primary">{new Date().toLocaleDateString('zh-CN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}</div>
            </div>
          </div>
        </div>

        {/* 个人信息完成提醒 */}
        {showProfileReminder && (
          <section className="mb-6">
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-l-4 border-orange-500 p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-user-edit text-orange-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-orange-900">首次登录提醒</h3>
                    <p className="text-orange-700 mt-1">
                      检测到您是首次登录系统，请及时完善个人信息以使用完整功能。
                    </p>
                    <p className="text-sm text-orange-600 mt-2">
                      个人信息完成度：
                      <span className="font-bold ml-2">
                        {profileLoading ? '加载中...' : `${getCompletionRate()}%`}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={handleCloseReminder}
                    className="px-4 py-2 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors"
                  >
                    稍后再说
                  </button>
                  <button 
                    onClick={handleFillProfile}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    立即填写
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 数据概览区 */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">个人概览</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 个人信息完成度 */}
            <div className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm mb-1">个人信息完成度</p>
                  <p className={`text-3xl font-bold ${
                    getCompletionRate() >= 80 ? 'text-green-600' : 
                    getCompletionRate() >= 50 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {profileLoading ? '--' : `${getCompletionRate()}%`}
                  </p>
                  <p className="text-text-secondary text-sm mt-1">
                    {profileLoading ? '加载中...' : 
                     isProfileComplete() ? '已完成' : '需完善'}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  getCompletionRate() >= 80 ? 'bg-gradient-to-br from-green-400 to-green-600' : 
                  getCompletionRate() >= 50 ? 'bg-gradient-to-br from-orange-400 to-orange-600' : 
                  'bg-gradient-to-br from-red-400 to-red-600'
                }`}>
                  <i className="fas fa-user-check text-white text-xl"></i>
                </div>
              </div>
            </div>

            {/* 学籍状态 */}
            <div className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm mb-1">学籍状态</p>
                  <p className="text-xl font-bold text-green-600">在读</p>
                  <p className="text-text-secondary text-sm mt-1">
                    {loading ? '加载中...' : (currentUser?.class_name || '未知班级')}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-user-graduate text-white text-xl"></i>
                </div>
              </div>
            </div>




          </div>
        </section>



        {/* 快捷操作区 */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">快捷操作</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 查看档案 */}
            <div 
              onClick={() => handleQuickActionClick('/student-my-profile')}
              className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300 cursor-pointer`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
                  <i className="fas fa-user text-white text-xl"></i>
                </div>
                <div>
                  <h4 className="font-medium text-text-primary">查看档案</h4>
                  <p className="text-sm text-text-secondary">查看个人完整档案信息</p>
                </div>
              </div>
            </div>

            {/* 修改信息 */}
            <div 
              onClick={() => handleQuickActionClick('/student-profile-edit')}
              className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300 cursor-pointer`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-edit text-white text-xl"></i>
                </div>
                <div>
                  <h4 className="font-medium text-text-primary">修改信息</h4>
                  <p className="text-sm text-text-secondary">更新个人联系方式等信息</p>
                </div>
              </div>
            </div>

            {/* 填报去向 */}
            <div 
              onClick={() => handleQuickActionClick('/student-graduation-fill')}
              className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300 cursor-pointer`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-rocket text-white text-xl"></i>
                </div>
                <div>
                  <h4 className="font-medium text-text-primary">填报去向</h4>
                  <p className="text-sm text-text-secondary">提交毕业去向信息</p>
                </div>
              </div>
            </div>

            {/* 下载证明 */}
            <div 
              onClick={() => handleQuickActionClick('/student-document-view')}
              className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300 cursor-pointer`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-download text-white text-xl"></i>
                </div>
                <div>
                  <h4 className="font-medium text-text-primary">下载证明</h4>
                  <p className="text-sm text-text-secondary">获取成绩单、在校证明等</p>
                </div>
              </div>
            </div>
            
            {/* 导出档案 */}
            <div 
              onClick={() => handleExportProfile()}
              className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300 cursor-pointer`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-file-export text-white text-xl"></i>
                </div>
                <div>
                  <h4 className="font-medium text-text-primary">导出档案</h4>
                  <p className="text-sm text-text-secondary">导出完整个人档案信息</p>
                </div>
              </div>
            </div>
          </div>
        </section>


      </main>
    </div>
  );
};

export default StudentDashboard;

