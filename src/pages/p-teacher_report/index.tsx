

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

// 声明Chart.js的全局类型
declare global {
  interface Window {
    Chart: any;
  }
}

const TeacherReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'grades' | 'graduation' | 'rewards'>('all');
  const [classFilter, setClassFilter] = useState('');
  const [timeRange, setTimeRange] = useState('current');
  const [statDimension, setStatDimension] = useState('all');

  // Chart实例引用
  const gradeDistributionChartRef = useRef<any>(null);
  const graduationDistributionChartRef = useRef<any>(null);
  const courseGradesChartRef = useRef<any>(null);

  const destinationTypeChartRef = useRef<any>(null);
  const salaryDistributionChartRef = useRef<any>(null);
  const rewardsTypesChartRef = useRef<any>(null);
  const classRewardsChartRef = useRef<any>(null);

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '统计报表 - 学档通';
    return () => { document.title = originalTitle; };
  }, []);

  // 初始化图表
  useEffect(() => {
    if (typeof window.Chart === 'undefined') {
      // 如果Chart.js未加载，动态加载它
      const script = document.createElement('script');
      script.src = 'https://unpkg.byted-static.com/chart.js/4.5.0/dist/chart.umd.js';
      script.onload = () => {
        initCharts();
      };
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    } else {
      initCharts();
    }

    return () => {
      // 清理所有图表实例
      if (gradeDistributionChartRef.current) {
        gradeDistributionChartRef.current.destroy();
        gradeDistributionChartRef.current = null;
      }
      if (graduationDistributionChartRef.current) {
        graduationDistributionChartRef.current.destroy();
        graduationDistributionChartRef.current = null;
      }
      if (courseGradesChartRef.current) {
        courseGradesChartRef.current.destroy();
        courseGradesChartRef.current = null;
      }

      if (destinationTypeChartRef.current) {
        destinationTypeChartRef.current.destroy();
        destinationTypeChartRef.current = null;
      }
      if (salaryDistributionChartRef.current) {
        salaryDistributionChartRef.current.destroy();
        salaryDistributionChartRef.current = null;
      }
      if (rewardsTypesChartRef.current) {
        rewardsTypesChartRef.current.destroy();
        rewardsTypesChartRef.current = null;
      }
      if (classRewardsChartRef.current) {
        classRewardsChartRef.current.destroy();
        classRewardsChartRef.current = null;
      }
    };
  }, []);

  const initCharts = () => {
    // 成绩等级分布饼图
    const gradeCtx = document.querySelector('#grade-distribution-chart') as HTMLCanvasElement;
    if (gradeCtx && !gradeDistributionChartRef.current) {
      gradeDistributionChartRef.current = new window.Chart(gradeCtx, {
        type: 'doughnut',
        data: {
          labels: ['优秀 (90-100)', '良好 (80-89)', '中等 (70-79)', '及格 (60-69)', '不及格 (<60)'],
          datasets: [{
            data: [25, 35, 20, 15, 5],
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }

    // 毕业去向分布柱状图
    const graduationCtx = document.querySelector('#graduation-distribution-chart') as HTMLCanvasElement;
    if (graduationCtx && !graduationDistributionChartRef.current) {
      graduationDistributionChartRef.current = new window.Chart(graduationCtx, {
        type: 'bar',
        data: {
          labels: ['就业', '升学', '创业', '出国', '待业'],
          datasets: [{
            label: '人数',
            data: [85, 25, 5, 8, 3],
            backgroundColor: '#745ab8',
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: '#e5e7eb'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      });
    }

    // 课程成绩分布图表
    const courseCtx = document.querySelector('#course-grades-chart') as HTMLCanvasElement;
    if (courseCtx && !courseGradesChartRef.current) {
      courseGradesChartRef.current = new window.Chart(courseCtx, {
        type: 'radar',
        data: {
          labels: ['高等数学', '程序设计', '数据结构', '计算机网络', '数据库原理'],
          datasets: [{
            label: '平均分',
            data: [85, 88, 82, 86, 84],
            backgroundColor: 'rgba(116, 90, 184, 0.2)',
            borderColor: '#745ab8',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              angleLines: {
                color: '#e5e7eb'
              },
              grid: {
                color: '#e5e7eb'
              },
              pointLabels: {
                color: '#374151'
              },
              ticks: {
                backdropColor: 'transparent',
                color: '#6b7280'
              }
            }
          }
        }
      });
    }



    // 毕业去向类型分布
    const destCtx = document.querySelector('#destination-type-chart') as HTMLCanvasElement;
    if (destCtx && !destinationTypeChartRef.current) {
      destinationTypeChartRef.current = new window.Chart(destCtx, {
        type: 'pie',
        data: {
          labels: ['互联网企业', '金融行业', '教育机构', '政府机关', '继续深造'],
          datasets: [{
            data: [45, 20, 15, 10, 10],
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }

    // 就业薪资分布
    const salaryCtx = document.querySelector('#salary-distribution-chart') as HTMLCanvasElement;
    if (salaryCtx && !salaryDistributionChartRef.current) {
      salaryDistributionChartRef.current = new window.Chart(salaryCtx, {
        type: 'histogram',
        data: {
          labels: ['5k以下', '5k-8k', '8k-12k', '12k-15k', '15k以上'],
          datasets: [{
            label: '人数',
            data: [5, 15, 35, 20, 10],
            backgroundColor: '#745ab8',
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: '#e5e7eb'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      });
    }

    // 奖惩类型分布
    const rewardsCtx = document.querySelector('#rewards-types-chart') as HTMLCanvasElement;
    if (rewardsCtx && !rewardsTypesChartRef.current) {
      rewardsTypesChartRef.current = new window.Chart(rewardsCtx, {
        type: 'doughnut',
        data: {
          labels: ['奖学金', '优秀学生', '竞赛获奖', '荣誉称号', '处分'],
          datasets: [{
            data: [40, 25, 20, 10, 5],
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }

    // 班级奖惩统计
    const classRewardsCtx = document.querySelector('#class-rewards-chart') as HTMLCanvasElement;
    if (classRewardsCtx && !classRewardsChartRef.current) {
      classRewardsChartRef.current = new window.Chart(classRewardsCtx, {
        type: 'bar',
        data: {
          labels: ['计算机1班', '计算机2班', '计算机3班', '软件工程1班', '软件工程2班'],
          datasets: [{
            label: '奖励次数',
            data: [18, 15, 20, 12, 16],
            backgroundColor: '#10b981',
            borderRadius: 4
          }, {
            label: '处分次数',
            data: [2, 3, 1, 4, 2],
            backgroundColor: '#ef4444',
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: '#e5e7eb'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      });
    }
  };

  const handleTabChange = (tab: 'all' | 'grades' | 'graduation' | 'rewards') => {
    setActiveTab(tab);
    setStatDimension(tab);
  };

  const handleStatDimensionChange = (value: string) => {
    setStatDimension(value);
    if (value === 'all') setActiveTab('all');
    else if (value === 'grades') setActiveTab('grades');
    else if (value === 'graduation') setActiveTab('graduation');
    else if (value === 'rewards') setActiveTab('rewards');
  };

  const handleExportReport = () => {
    console.log('导出报表', {
      class: classFilter,
      timeRange: timeRange,
      dimension: statDimension
    });
    
    // 模拟下载
    const link = document.createElement('a');
    link.href = '#';
    link.download = `统计报表_${new Date().toLocaleDateString()}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 显示成功提示
    alert('报表导出成功！');
  };

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      navigate('/login');
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
            {/* 消息通知 */}
            <button className="relative p-2 text-text-secondary hover:text-secondary transition-colors">
              <i className="fas fa-bell text-lg"></i>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
            </button>
            
            {/* 用户信息 */}
            <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors">
              <img src="https://s.coze.cn/image/Vkzmt9HnqKw/" 
                   alt="教师头像" className="w-8 h-8 rounded-full" data-category="人物" />
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
          

          <Link to="/teacher-graduation-management" className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}>
            <i className="fas fa-rocket text-lg"></i>
            <span className="font-medium">毕业去向管理</span>
          </Link>
          
          <Link to="/teacher-report" className={`${styles.navItem} ${styles.navItemActive} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors`}>
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
              <h2 className="text-2xl font-bold text-text-primary mb-2">统计报表</h2>
              <nav className="text-sm text-text-secondary">
                <span>首页</span>
                <i className="fas fa-chevron-right mx-2"></i>
                <span>统计报表</span>
              </nav>
            </div>
          </div>
        </div>

        {/* 工具栏区域 */}
        <section className="mb-6">
          <div className="bg-white rounded-xl shadow-card p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                {/* 班级筛选 */}
                <div className="flex items-center space-x-2">
                  <label htmlFor="class-filter" className="text-sm font-medium text-text-primary">班级：</label>
                  <select 
                    id="class-filter" 
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                  >
                    <option value="">全部班级</option>
                    <option value="cs1">计算机科学与技术1班</option>
                    <option value="cs2">计算机科学与技术2班</option>
                    <option value="cs3">计算机科学与技术3班</option>
                    <option value="se1">软件工程1班</option>
                    <option value="se2">软件工程2班</option>
                  </select>
                </div>
                
                {/* 时间范围筛选 */}
                <div className="flex items-center space-x-2">
                  <label htmlFor="time-range" className="text-sm font-medium text-text-primary">时间范围：</label>
                  <select 
                    id="time-range" 
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                  >
                    <option value="current">本学期</option>
                    <option value="last">上学期</option>
                    <option value="year">本年度</option>
                    <option value="custom">自定义</option>
                  </select>
                </div>
                
                {/* 统计维度 */}
                <div className="flex items-center space-x-2">
                  <label htmlFor="stat-dimension" className="text-sm font-medium text-text-primary">统计维度：</label>
                  <select 
                    id="stat-dimension" 
                    value={statDimension}
                    onChange={(e) => handleStatDimensionChange(e.target.value)}
                    className="px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                  >
                    <option value="all">综合统计</option>
                    <option value="grades">成绩分析</option>
                    <option value="graduation">毕业去向</option>
                    <option value="rewards">奖惩情况</option>
                  </select>
                </div>
              </div>
              
              {/* 导出按钮 */}
              <button 
                onClick={handleExportReport}
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors flex items-center space-x-2"
              >
                <i className="fas fa-download"></i>
                <span>导出报表</span>
              </button>
            </div>
          </div>
        </section>

        {/* 统计维度标签页 */}
        <section className="mb-6">
          <div className="flex space-x-4" role="tablist">
            <button 
              onClick={() => handleTabChange('all')}
              className={`px-4 py-2 text-sm font-medium rounded-lg focus:outline-none ${activeTab === 'all' ? styles.tabActive : styles.tabInactive}`}
              role="tab" 
              aria-controls="all-content"
            >
              综合统计
            </button>
            <button 
              onClick={() => handleTabChange('grades')}
              className={`px-4 py-2 text-sm font-medium rounded-lg focus:outline-none ${activeTab === 'grades' ? styles.tabActive : styles.tabInactive}`}
              role="tab" 
              aria-controls="grades-content"
            >
              成绩分析
            </button>
            <button 
              onClick={() => handleTabChange('graduation')}
              className={`px-4 py-2 text-sm font-medium rounded-lg focus:outline-none ${activeTab === 'graduation' ? styles.tabActive : styles.tabInactive}`}
              role="tab" 
              aria-controls="graduation-content"
            >
              毕业去向
            </button>
            <button 
              onClick={() => handleTabChange('rewards')}
              className={`px-4 py-2 text-sm font-medium rounded-lg focus:outline-none ${activeTab === 'rewards' ? styles.tabActive : styles.tabInactive}`}
              role="tab" 
              aria-controls="rewards-content"
            >
              奖惩情况
            </button>
          </div>
        </section>

        {/* 综合统计内容 */}
        {activeTab === 'all' && (
          <section className="mb-8">
            {/* 关键指标卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className={`bg-white rounded-xl shadow-card p-6 transition-all duration-300 ${styles.cardHover}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm mb-1">学生总数</p>
                    <p className="text-3xl font-bold text-text-primary">126</p>
                    <p className="text-secondary text-sm mt-1">
                      <i className="fas fa-arrow-up mr-1"></i>
                      较上月 +8
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
                    <i className="fas fa-users text-white text-xl"></i>
                  </div>
                </div>
              </div>



              <div className={`bg-white rounded-xl shadow-card p-6 transition-all duration-300 ${styles.cardHover}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm mb-1">就业率</p>
                    <p className="text-3xl font-bold text-text-primary">85%</p>
                    <p className="text-blue-600 text-sm mt-1">
                      <i className="fas fa-arrow-up mr-1"></i>
                      较上周 +5%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                    <i className="fas fa-briefcase text-white text-xl"></i>
                  </div>
                </div>
              </div>

              <div className={`bg-white rounded-xl shadow-card p-6 transition-all duration-300 ${styles.cardHover}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm mb-1">获奖率</p>
                    <p className="text-3xl font-bold text-text-primary">32%</p>
                    <p className="text-orange-600 text-sm mt-1">
                      <i className="fas fa-arrow-up mr-1"></i>
                      较上月 +3%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                    <i className="fas fa-trophy text-white text-xl"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* 图表区域 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* 成绩分布饼图 */}
              <div className="bg-white rounded-xl shadow-card p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">成绩等级分布</h3>
                <div className={styles.chartContainer}>
                  <canvas id="grade-distribution-chart"></canvas>
                </div>
              </div>

              {/* 毕业去向柱状图 */}
              <div className="bg-white rounded-xl shadow-card p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">毕业去向分布</h3>
                <div className={styles.chartContainer}>
                  <canvas id="graduation-distribution-chart"></canvas>
                </div>
              </div>
            </div>

            {/* 详细数据表格 */}
            <div className="bg-white rounded-xl shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border-light">
                <h3 className="font-medium text-text-primary">班级统计详情</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">班级</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">学生数</th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">就业率</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">获奖率</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-border-light">
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">计算机科学与技术1班</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">42</td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">88%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">35%</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">计算机科学与技术2班</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">38</td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">82%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">30%</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">计算机科学与技术3班</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">46</td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">86%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">31%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* 成绩分析内容 */}
        {activeTab === 'grades' && (
          <section className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* 课程成绩分布 */}
              <div className="bg-white rounded-xl shadow-card p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">主要课程成绩分布</h3>
                <div className={styles.chartContainer}>
                  <canvas id="course-grades-chart"></canvas>
                </div>
              </div>


            </div>

            {/* 成绩排名表格 */}
            <div className="bg-white rounded-xl shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border-light">
                <h3 className="font-medium text-text-primary">成绩排名</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">排名</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">学号</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">姓名</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">班级</th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">平均分</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-border-light">
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary font-medium">1</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">2021001</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">李小明</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">计算机科学与技术1班</td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">92.5</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary font-medium">2</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">2021002</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">王小红</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">软件工程2班</td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">91.2</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary font-medium">3</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">2021003</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">张大力</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">计算机科学与技术1班</td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">90.1</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* 毕业去向内容 */}
        {activeTab === 'graduation' && (
          <section className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* 毕业去向饼图 */}
              <div className="bg-white rounded-xl shadow-card p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">毕业去向类型分布</h3>
                <div className={styles.chartContainer}>
                  <canvas id="destination-type-chart"></canvas>
                </div>
              </div>

              {/* 就业薪资分布 */}
              <div className="bg-white rounded-xl shadow-card p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">就业薪资分布</h3>
                <div className={styles.chartContainer}>
                  <canvas id="salary-distribution-chart"></canvas>
                </div>
              </div>
            </div>

            {/* 毕业去向详情表格 */}
            <div className="bg-white rounded-xl shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border-light">
                <h3 className="font-medium text-text-primary">毕业去向详情</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">学号</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">姓名</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">班级</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">去向类型</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">单位/学校</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">状态</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-border-light">
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">2021001</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">李小明</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">计算机科学与技术1班</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">就业</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">腾讯科技有限公司</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">已审核</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">2021002</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">王小红</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">软件工程2班</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">升学</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">清华大学计算机系</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">已审核</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">2021003</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">张大力</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">计算机科学与技术1班</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">就业</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">阿里巴巴集团</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">待审核</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* 奖惩情况内容 */}
        {activeTab === 'rewards' && (
          <section className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* 奖惩类型分布 */}
              <div className="bg-white rounded-xl shadow-card p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">奖惩类型分布</h3>
                <div className={styles.chartContainer}>
                  <canvas id="rewards-types-chart"></canvas>
                </div>
              </div>

              {/* 班级奖惩统计 */}
              <div className="bg-white rounded-xl shadow-card p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">班级奖惩统计</h3>
                <div className={styles.chartContainer}>
                  <canvas id="class-rewards-chart"></canvas>
                </div>
              </div>
            </div>

            {/* 奖惩记录表格 */}
            <div className="bg-white rounded-xl shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border-light">
                <h3 className="font-medium text-text-primary">奖惩记录</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">学号</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">姓名</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">班级</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">类型</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">奖惩名称</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">时间</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-border-light">
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">2021001</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">李小明</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">计算机科学与技术1班</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">奖励</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">国家奖学金</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">2024-01-10</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">2021002</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">王小红</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">软件工程2班</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">奖励</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">校级优秀学生</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">2024-01-08</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">2021003</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">张大力</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">计算机科学与技术1班</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">处分</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">迟到警告</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">2024-01-05</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default TeacherReportPage;

