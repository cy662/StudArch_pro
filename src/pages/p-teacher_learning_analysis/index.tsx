import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

const P_teacher_learning_analysis: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '学习成果智能分析 - 学档通';
    
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

  const handleAnalysis = async () => {
    if (!studentId.trim()) {
      alert('请填写学生学号');
      return;
    }
    
    console.log('开始分析学习成果:', { studentId, studentName });
    setIsAnalyzing(true);
    
    try {
      // 模拟分析过程 - 实际项目中这里应该调用后端API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟分析结果
      const mockResults = {
        studentInfo: {
          studentId: studentId,
          name: studentName.trim() || '未填写姓名',
          class: '计算机科学与技术2023-1班',
          major: '计算机科学与技术',
          enrollmentDate: '2023-09-01'
        },
        academicPerformance: {
          overallScore: 85.5,
          ranking: '15/120',
          gpa: 3.7,
          credits: 98,
          completedCourses: 32
        },
        skillsAnalysis: [
          { category: '编程语言', skills: ['Java', 'Python', 'C++', 'JavaScript'], level: '优秀' },
          { category: '前端开发', skills: ['React', 'Vue', 'HTML/CSS'], level: '良好' },
          { category: '后端开发', skills: ['Spring Boot', 'Node.js', 'MySQL'], level: '良好' },
          { category: '工具使用', skills: ['Git', 'Docker', 'Linux'], level: '一般' }
        ],
        projectsExperience: [
          { name: '学生管理系统', role: '主要开发者', description: '使用Java Spring Boot开发的学生信息管理系统', technologies: ['Java', 'Spring Boot', 'MySQL'] },
          { name: '电商网站', role: '前端开发', description: '使用React开发的电商前端项目', technologies: ['React', 'TypeScript', 'Tailwind CSS'] }
        ],
        strengths: [
          '编程基础扎实，掌握多种编程语言',
          '项目实践经验丰富',
          '学习能力强，能快速适应新技术',
          '团队协作能力良好'
        ],
        improvementAreas: [
          '算法和数据结构需要进一步加强',
          '系统设计经验有待提升',
          '专业证书获取较少'
        ],
        recommendations: [
          '建议参加算法竞赛，提升编程能力',
          '考取相关的技术认证，如Oracle Java认证',
          '参与更多开源项目，积累实战经验',
          '加强系统架构设计的学习'
        ],
        careerDirection: '建议向全栈开发或后端开发方向发展，当前技术栈匹配度较高'
      };
      
      setAnalysisResults(mockResults);
      console.log('分析完成:', mockResults);
      
    } catch (error) {
      console.error('分析过程中出错:', error);
      alert('分析失败，请重试');
    } finally {
      setIsAnalyzing(false);
    }
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
            to="/teacher-learning-analysis" 
            className={`${styles.navItem} ${styles.navItemActive} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors`}
          >
            <i className="fas fa-chart-line text-lg"></i>
            <span className="font-medium">学习成果智能分析</span>
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
                学习成果智能分析
              </h2>
              <nav className="text-sm text-text-secondary">
                <span>教师管理平台 / 学习成果智能分析</span>
              </nav>
            </div>
          </div>
        </div>

        {/* 主要功能区域 */}
        <div className="grid grid-cols-1 gap-6">
          {/* 学生信息输入卡片 */}
          <div className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300`}>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mr-4">
                <i className="fas fa-user-graduate text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">学生信息录入</h3>
                <p className="text-sm text-text-secondary">输入学生学号和姓名，系统将智能分析其学习成果</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
                  学生学号 <span className="text-red-500">*</span>
                </label>
                <input
                  id="studentId"
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="请输入学生学号"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-2">
                  学生姓名 <span className="text-gray-400">（选填）</span>
                </label>
                <input
                  id="studentName"
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="请输入学生姓名"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                />
              </div>
            </div>

            <div className="flex justify-center pt-6">
              <button
                onClick={handleAnalysis}
                disabled={isAnalyzing}
                className="px-8 py-3 bg-secondary text-white font-medium rounded-lg hover:bg-accent transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>分析中...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-search"></i>
                    <span>立即分析</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 分析结果卡片 */}
          <div className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300`}>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center mr-4">
                <i className="fas fa-chart-bar text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">分析结果</h3>
                <p className="text-sm text-text-secondary">学生学习成果的详细分析报告</p>
              </div>
            </div>

            {!analysisResults ? (
              <div className="text-center py-16 text-gray-500">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-chart-line text-4xl text-gray-400"></i>
                </div>
                <h4 className="text-lg font-medium text-gray-600 mb-2">暂无分析结果</h4>
                <p className="text-sm text-gray-500">请先输入学生信息并点击"立即分析"按钮</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 学生基本信息 */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-800 mb-2">学生基本信息</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-600">学号：</span>{analysisResults.studentInfo.studentId}</div>
                    <div><span className="text-gray-600">姓名：</span>{analysisResults.studentInfo.name}</div>
                    <div><span className="text-gray-600">班级：</span>{analysisResults.studentInfo.class}</div>
                    <div><span className="text-gray-600">专业：</span>{analysisResults.studentInfo.major}</div>
                  </div>
                </div>

                {/* 学业表现 */}
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-800 mb-2">学业表现</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-gray-600">综合成绩</div>
                      <div className="text-xl font-bold text-green-600">{analysisResults.academicPerformance.overallScore}分</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-gray-600">班级排名</div>
                      <div className="text-xl font-bold text-blue-600">{analysisResults.academicPerformance.ranking}</div>
                    </div>
                  </div>
                </div>

                {/* 技能分析 */}
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-800 mb-2">技能分析</h4>
                  <div className="space-y-2">
                    {analysisResults.skillsAnalysis.map((skill: any, index: number) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm font-medium">{skill.category}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-600">{skill.skills.join(', ')}</span>
                          <span className={`px-2 py-1 text-xs rounded ${
                            skill.level === '优秀' ? 'bg-green-100 text-green-600' :
                            skill.level === '良好' ? 'bg-blue-100 text-blue-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>{skill.level}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 优势分析 */}
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-semibold text-gray-800 mb-2">优势分析</h4>
                  <ul className="space-y-1">
                    {analysisResults.strengths.map((strength: string, index: number) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <i className="fas fa-check-circle text-green-500 mt-0.5 mr-2"></i>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 改进建议 */}
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold text-gray-800 mb-2">改进建议</h4>
                  <ul className="space-y-1">
                    {analysisResults.improvementAreas.map((area: string, index: number) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <i className="fas fa-exclamation-circle text-orange-500 mt-0.5 mr-2"></i>
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 发展建议 */}
                <div className="border-l-4 border-indigo-500 pl-4">
                  <h4 className="font-semibold text-gray-800 mb-2">发展建议</h4>
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <p className="text-sm text-indigo-700">{analysisResults.careerDirection}</p>
                    <ul className="mt-2 space-y-1">
                      {analysisResults.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="text-sm text-indigo-600 flex items-start">
                          <i className="fas fa-lightbulb text-indigo-400 mt-0.5 mr-2"></i>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default P_teacher_learning_analysis;