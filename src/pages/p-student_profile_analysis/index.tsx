import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import useStudentProfile from '../../hooks/useStudentProfile';
import { generateStudentProfile } from '../../services/n8nService';
import styles from './styles.module.css';

// 定义工作流分析结果的类型
interface AnalysisResult {
  summary: string;
  strengths: string[];
  achievements: string[];
  developmentSuggestions: string;
}

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
  developmentSuggestions: "建议继续巩固和提升Java语言能力，同时扩展其他编程语言和机器学习相关技术栈，如Python及其机器学习库。可以加强数据预处理和特征工程技能，提升模型泛化能力和准确率。此外，建议多参与实际项目，积累更多实战经验，逐步向高级机器学习工程师方向发展。"
};

const StudentProfileAnalysis: React.FC = () => {
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

      // 准备n8n工作流调用
      console.log('准备调用n8n工作流，学生ID:', studentId);

      // 直接调用n8n工作流生成个性化分析结果和画像
      try {
        // 使用用户提供的实际n8n工作流webhook URL
        console.log('调用n8n工作流前的参数检查:', {
          studentId: studentId,
          webhookUrl: 'https://cy2005.app.n8n.cloud/webhook/student-profile-analysis'
        });
        
        const n8nResult = await generateStudentProfile(
          studentId,
          'https://cy2005.app.n8n.cloud/webhook/student-profile-analysis',
          ''
        );
        
        console.log('n8n工作流调用结果:', n8nResult);
        
        if (n8nResult.success) {
          // 处理n8n返回的数据
          const workflowData = n8nResult.data;
          
          console.log('n8n返回的工作流数据:', workflowData);
          
          // 检查工作流数据是否包含必要的字段
          if (workflowData) {
            // 检查是否包含所有必要的字段
            const hasSummary = workflowData?.summary || workflowData?.output?.summary;
            const hasStrengths = workflowData?.strengths || workflowData?.output?.strengths;
            const hasAchievements = workflowData?.achievements || workflowData?.output?.achievements;
            const hasSuggestions = workflowData?.developmentSuggestions || workflowData?.output?.developmentSuggestions;
            
            console.log('工作流数据字段检查:', {
              hasSummary,
              hasStrengths,
              hasAchievements,
              hasSuggestions
            });
            
            // 设置分析结果
            if (workflowData?.output) {
              setAnalysisResult(workflowData.output);
            } else if (workflowData) {
              // 兼容不同的返回格式
              setAnalysisResult(workflowData);
            } else {
              throw new Error('工作流未返回分析结果');
            }
            
            // 不再设置画像URL，因为不需要显示图片
            
            setPortraitStatus('success');
            setError(null);
            console.log('画像和分析结果生成成功:', studentId, n8nResult.data);
          } else {
            console.warn('n8n工作流返回成功但数据为空:', n8nResult);
            // 如果工作流返回空数据，使用模拟数据作为备选
            setAnalysisResult(mockAnalysisResult);
            setPortraitStatus('success');
            setError('当前工作流返回数据为空，使用模拟数据展示');
          }
        } else {
          console.error('获取n8n工作流结果失败:', n8nResult.error);
          setError('生成分析结果失败: ' + (n8nResult.error || '未知错误'));
          setPortraitStatus('error');
        }
      } catch (n8nError) {
        console.error('调用n8n工作流时发生异常:', n8nError);
        setError('调用分析服务时发生异常: ' + (n8nError instanceof Error ? n8nError.message : '未知错误'));
        setPortraitStatus('error');
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
                <p className={styles.generatingSubtext}>这可能需要几秒钟时间</p>
              </div>
            )}
            
            {portraitStatus === 'success' && (
              <>
                {/* 分析结果展示 - 不显示图片 */}
                {analysisResult && (
                  <div className={styles.analysisResultWrapper}>
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