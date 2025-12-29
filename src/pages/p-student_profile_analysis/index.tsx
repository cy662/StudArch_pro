import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import useStudentProfile from '../../hooks/useStudentProfile';
import { generateStudentProfile } from '../../services/n8nService';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import styles from './styles.module.css';

// 注册雷达图所需的组件，避免Chart.js未注册报错
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);
// 定义工作流分析结果的类型
interface AnalysisResult {
  summary: string;
  strengths: string[];
  achievements: string[];
  developmentSuggestions: string;
  radarChart?: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth: number;
    }[];
  };
}

// 生成画像等待的最长时间（毫秒）
// 注意：524错误是CDN层面的超时，需要更长时间或考虑其他实现方式
const WORKFLOW_TIMEOUT_MS = 3600000 * 2; // 120分钟，进一步延长超时时间

// 定义雷达图组件
interface RadarChartProps {
  chartData: AnalysisResult['radarChart'];
}

const RadarChart: React.FC<RadarChartProps> = ({ chartData }) => {
  const chartRef = useRef<ChartJS<'radar'>>(null);

  if (!chartData) return null;

  // 每次数据变化时销毁旧的Chart实例，避免“Canvas is already in use”错误
  useEffect(() => {
    const chartInstance = chartRef.current;
    return () => {
      chartInstance?.destroy();
    };
  }, [chartData]);

  const options: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20
        },
        pointLabels: {
          font: {
            size: 12
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.r}`;
          }
        }
      }
    }
  };

  return (
    <div className={styles.radarChartContainer}>
      <Radar
        key={(chartData.labels || []).join('|')} // 强制不同数据时重建canvas
        ref={chartRef}
        data={chartData}
        options={options}
      />
    </div>
  );
};

// 模拟的个人画像分析数据
const mockAnalysisResult: AnalysisResult = {
  summary: "该学生于2023年9月入学软件工程专业，目前掌握了Java编程语言并具备中级水平。学生已完成基于机器学习技术的应用项目，展示了良好的数据分析和模型构建能力。",
  strengths: [
    "具备Java编程基础，能够进行中等复杂度的软件开发。",
    "能够应用线性回归和决策树算法，构建实用的机器学习模型。",
    "具备将理论知识应用于实际问题（学生成绩预测）的能力。"
  ],
  achievements: [
    "成功构建了基于历史成绩和考勤数据的学生成绩预测模型，模型准确率达到85%。",
    "完成相关分析报告，展示了良好的科研和总结能力。"
  ],
  developmentSuggestions: "建议继续巩固和提升Java语言能力，同时扩展其他编程语言和机器学习相关技术栈，如Python及其机器学习库。可以加强数据预处理和特征工程技能，提升模型泛化能力和准确率。此外，建议多参与实际项目，积累更多实战经验，逐步向高级机器学习工程师方向发展。",
  radarChart: {
    labels: ['编程能力', '算法基础', '数据结构', '项目实践', '团队协作', '学习能力'],
    datasets: [
      {
        label: '能力评分',
        data: [78, 65, 70, 85, 60, 90],
        backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'],
        borderWidth: 1
      }
    ]
  }
};

const StudentProfileAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [generatingPortrait, setGeneratingPortrait] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [portraitStatus, setPortraitStatus] = useState<string>('none'); // none, generating, success, error

  // 使用useStudentProfile hook获取个人信息
  const { 
    profile: studentProfile, 
    loading: profileLoading, 
  } = useStudentProfile(currentUser?.id || '');

  // 返回上一页功能
  const goBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '个人画像分析 - 学档通';
    
    // 当个人信息和用户信息加载完成后，设置loading状态
    if (!authLoading && !profileLoading) {
      setLoading(false);
    }
    
    return () => { document.title = originalTitle; };
  }, [authLoading, profileLoading]);

  // 生成个人画像和分析结果
  const generatePortrait = async () => {
    console.log('=== 开始生成学生画像和分析结果 ===');
    console.log('当前用户信息:', currentUser);
    console.log('学生档案信息:', studentProfile);
    
    // 检查学生档案ID是否存在
    let studentId = studentProfile?.id;
    
    // 如果没有studentProfile.id，尝试使用currentUser.id
    if (!studentId && currentUser?.id) {
      console.log('使用用户ID作为备选:', currentUser.id);
      studentId = currentUser.id;
    }
    
    // 如果仍然没有ID或ID无效，生成一个mock ID用于测试
    if (!studentId || studentId === 'null' || studentId === 'undefined' || studentId.startsWith('mock-')) {
      console.warn('学生ID无效或为模拟ID，生成测试ID:', {
        studentProfileId: studentProfile?.id,
        userId: currentUser?.id
      });
      
      // 生成一个基于用户ID或时间戳的测试ID
      const timestamp = Date.now();
      studentId = currentUser?.id ? `test-${currentUser.id}` : `test-${timestamp}`;
      
      console.log('使用测试学生ID:', studentId);
      // 显示提示信息而不是错误
      setError('使用测试模式生成画像（学生档案不存在）');
      setPortraitStatus('generating');
    }

    console.log('使用的学生ID:', studentId);

    try {
      setGeneratingPortrait(true);
      setPortraitStatus('generating');
      setError(null);

      // 1. 调用n8n工作流但不等待其完成
      console.log('调用n8n工作流生成画像...');
      try {
        // 使用用户提供的实际n8n工作流webhook URL
        generateStudentProfile(
          studentId,
          'https://cy2005.app.n8n.cloud/webhook/student-profile-analysis',
          '',
          WORKFLOW_TIMEOUT_MS
        ).then(n8nResult => {
          console.log('n8n工作流调用结果（异步）:', n8nResult);
        }).catch(n8nError => {
          console.error('调用n8n工作流时发生异常（异步）:', n8nError);
        });
      } catch (n8nError) {
        console.error('调用n8n工作流时发生异常:', n8nError);
        // 继续执行，不中断流程
      }

      // 2. 直接查询数据库获取最新的个人画像记录
      console.log('查询数据库获取最新个人画像记录...');
      try {
        const response = await fetch(`/api/student-learning/get-latest-profile-job/${studentId}`);
        const result = await response.json();
        console.log('数据库查询结果:', result);

        if (result.success) {
          // 处理数据库返回的数据
          const profileData = result.data;
          
          // 提取分析结果数据
          const analysisData = profileData.analysis_result || {};
          
          // 提取雷达图数据并转换为前端期望的格式
          let radarChartData: AnalysisResult['radarChart'] | undefined = undefined;
          if (analysisData.radarChart) {
            radarChartData = analysisData.radarChart;
          } else if (analysisData.roseChartData) {
            radarChartData = {
              labels: analysisData.roseChartData.dimensions || [],
              datasets: [{
                label: '能力评分',
                data: analysisData.roseChartData.values || [],
                backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)'],
                borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)'],
                borderWidth: 1
              }]
            };
          }
          
          // 构建前端需要的AnalysisResult对象
          const resultData: AnalysisResult = {
            summary: analysisData.summary || '',
            strengths: analysisData.strengths || [],
            achievements: analysisData.achievements || [],
            developmentSuggestions: analysisData.developmentSuggestions || '',
            radarChart: radarChartData
          };
          
          setAnalysisResult(resultData);
          setPortraitStatus('success');
          setError(null);
          console.log('画像和分析结果查询成功:', studentId, resultData);
        } else {
          console.error('获取个人画像分析记录失败:', result.message);
          // 如果没有找到记录，使用模拟数据作为备选
          setAnalysisResult(mockAnalysisResult);
          setPortraitStatus('success');
          setError(result.message || '未找到个人画像分析记录，使用模拟数据展示');
        }
      } catch (dbError) {
        console.error('查询数据库时发生异常:', dbError);
        // 如果数据库查询失败，使用模拟数据作为备选
        setAnalysisResult(mockAnalysisResult);
        setPortraitStatus('success');
        setError('查询数据库失败，使用模拟数据展示');
      }
    } catch (err) {
      console.error('生成画像时发生错误:', err);
      setError('生成画像时发生网络错误，请稍后重试');
      setPortraitStatus('error');
    } finally {
      setGeneratingPortrait(false);
      console.log('=== 学生画像生成流程结束 ===');
    }
  };

  // 清除画像和分析结果
  const clearPortrait = () => {
    setAnalysisResult(null);
    setPortraitStatus('none');
    setError(null);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      {/* 顶部导航栏 - 从学生仪表盘页面复制并添加返回按钮 */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-border-light h-16 z-50">
        <div className="flex items-center justify-between h-full px-6">
          {/* Logo和系统名称 - 添加返回按钮 */}
          <div className="flex items-center space-x-3">
            <button onClick={goBack} className="mr-2 text-text-primary hover:text-blue-500">
              <i className="fas fa-arrow-left text-lg"></i>
            </button>
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
                src={studentProfile?.profile_photo || currentUser?.avatar || "https://s.coze.cn/image/DQIklNDlQyw/"} 
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
              onClick={() => navigate('/login')}
              className="text-text-secondary hover:text-red-500 transition-colors"
            >
              <i className="fas fa-sign-out-alt text-lg"></i>
            </button>
          </div>
        </div>
      </header>

      <div className={styles.contentContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>个人画像分析</h1>
          <p className={styles.subtitle}>基于您的学习数据生成个性化AI画像</p>
        </div>

        <div className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <h2 className={styles.profileTitle}>{currentUser?.full_name || '学生'}</h2>
            <p className={styles.profileInfo}>{currentUser?.class_name || '班级'}</p>
          </div>
          
          <div className={styles.imageContainer}>
            {portraitStatus === 'none' && (
              <div className={styles.placeholderContainer}>
                <div className={styles.placeholderIcon}>🎨</div>
                <p className={styles.placeholderText}>点击下方按钮生成您的个人画像</p>
              </div>
            )}
            
            {portraitStatus === 'generating' && (
              <div className={styles.generatingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p className={styles.generatingText}>正在生成个人画像...</p>
                <p className={styles.generatingSubtext}>可能需要较长时间处理，最长等待约120分钟</p>
              </div>
            )}
            
            {portraitStatus === 'success' && (
              <>
                {/* 分析结果展示 - 包含雷达图 */}
                {analysisResult && (
                  <div className={styles.analysisResultWrapper}>
                    {/* 雷达图展示 */}
                    {analysisResult.radarChart && (
                      <div className={styles.analysisSection}>
                        <h3 className={styles.analysisSectionTitle}>📊 能力雷达图</h3>
                        <RadarChart chartData={analysisResult.radarChart} />
                      </div>
                    )}
                    
                    <div className={styles.analysisSection}>
                      <h3 className={styles.analysisSectionTitle}>📝 个人总结</h3>
                      <p className={styles.analysisText}>{analysisResult.summary}</p>
                    </div>
                    
                    <div className={styles.analysisSection}>
                      <h3 className={styles.analysisSectionTitle}>🌟 优势能力</h3>
                      <ul className={styles.analysisList}>
                        {analysisResult.strengths.map((strength, index) => (
                          <li key={index} className={styles.analysisListItem}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className={styles.analysisSection}>
                      <h3 className={styles.analysisSectionTitle}>🏆 主要成就</h3>
                      <ul className={styles.analysisList}>
                        {analysisResult.achievements.map((achievement, index) => (
                          <li key={index} className={styles.analysisListItem}>{achievement}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className={styles.analysisSection}>
                      <h3 className={styles.analysisSectionTitle}>📈 发展建议</h3>
                      <p className={styles.analysisText}>{analysisResult.developmentSuggestions}</p>
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={clearPortrait}
                  className={styles.clearButton}
                >
                  重新生成
                </button>
              </>
            )}
            
            {portraitStatus === 'error' && (
              <div className={styles.errorContainer}>
                <div className={styles.errorIcon}>❌</div>
                <p className={styles.errorText}>{error || '生成失败'}</p>
                <button 
                  onClick={generatePortrait}
                  className={styles.retryButton}
                >
                  重试
                </button>
              </div>
            )}
          </div>

          <div className={styles.buttonContainer}>
            <button
              onClick={generatePortrait}
              disabled={generatingPortrait || portraitStatus === 'generating'}
              className={`${styles.generateButton} ${generatingPortrait ? styles.generateButtonDisabled : ''}`}
            >
              {generatingPortrait ? (
                <>
                  <div className={styles.buttonSpinner}></div>
                  生成中...
                </>
              ) : (
                '生成个人画像'
              )}
            </button>
          </div>
        </div>

        <div className={styles.infoSection}>
          <h3 className={styles.sectionTitle}>画像说明</h3>
          <div className={styles.infoCard}>
            <p className={styles.infoText}>
              个人画像是基于您的学习数据、技术标签、学习收获等信息，通过AI智能分析生成的可视化展示。
            </p>
            <ul className={styles.infoList}>
              <li>📊 基于您的技术技能标签</li>
              <li>🎓 结合您的学习收获和成果</li>
              <li>✨ 使用AI技术智能生成</li>
              <li>📈 直观展示您的学习特点</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileAnalysis;