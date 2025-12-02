// 修复后的PDF内容生成函数
// 实现技术标签统一展示，收获和成果按课程分组

export const generateFixedPdfContent = (learningInfo: any, studentProfile: any) => {
  // 1. 统一技术标签（去重）
  const allTechnicalTags = [...new Set(learningInfo.technical_tags.map((tag: any) => tag.tag_name))].sort();
  
  // 2. 按课程分组收获和成果
  const courseGroups: Record<string, {
    achievements: any[],
    outcomes: any[]
  }> = {};
  
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
  
  // 3. 生成PDF内容
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>学生学习档案</title>
      <style>
        body { 
          font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif; 
          margin: 40px; 
          line-height: 1.6; 
          color: #333;
          font-size: 14px;
        }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #3498db; padding-bottom: 20px; }
        .header h1 { color: #2c3e50; font-size: 28px; margin: 0; }
        .header p { color: #7f8c8d; margin: 5px 0; }
        
        .section { margin-bottom: 30px; }
        .section-title { 
          font-size: 18px; 
          color: #2c3e50; 
          border-bottom: 2px solid #3498db; 
          padding-bottom: 8px; 
          margin-bottom: 15px; 
          display: flex;
          align-items: center;
        }
        .section-title .icon { margin-right: 8px; }
        
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
        .info-item { padding: 8px; background: #f8f9fa; border-radius: 6px; }
        .info-label { font-weight: bold; color: #2c3e50; margin-bottom: 4px; }
        .info-value { color: #555; }
        
        .tags-container { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
        .tag { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .tag-count { font-size: 12px; color: #666; margin-top: 5px; }
        
        .course-card {
          margin-bottom: 25px;
          padding: 20px;
          background: white;
          border: 1px solid #e1e8ed;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .course-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 15px;
        }
        .course-title {
          font-size: 16px;
          font-weight: bold;
          color: #2c3e50;
          margin: 0;
        }
        .course-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
        }
        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 500;
        }
        
        .content-section {
          margin-bottom: 15px;
        }
        .content-title {
          font-size: 13px;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
        }
        .content-title .icon { margin-right: 5px; }
        .content-box {
          padding: 12px;
          background: #fefefe;
          border: 1px solid #f0f0f0;
          border-radius: 6px;
          font-size: 13px;
          line-height: 1.6;
          color: #555;
          min-height: 40px;
        }
        
        .empty-content { color: #999; font-style: italic; }
        
        .stats-box {
          padding: 20px;
          background: #f0f8ff;
          border-radius: 8px;
          border-left: 4px solid #4299e1;
          margin-bottom: 30px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          text-align: center;
        }
        .stat-item div:first-child {
          font-size: 24px;
          font-weight: bold;
          color: #3498db;
          margin-bottom: 5px;
        }
        .stat-item div:last-child {
          font-size: 12px;
          color: #666;
        }
        
        @media print {
          body { margin: 20px; }
          .course-card { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <!-- 页面头部 -->
      <div class="header">
        <h1>学生学习档案</h1>
        <p>生成时间：${new Date().toLocaleString('zh-CN')}</p>
      </div>
      
      <!-- 基本信息 -->
      <div class="section">
        <h2 class="section-title">
          <span class="icon">👤</span>基本信息
        </h2>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">姓名</div>
            <div class="info-value">${studentProfile?.full_name || '暂无'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">学号</div>
            <div class="info-value">${studentProfile?.student_number || '暂无'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">班级</div>
            <div class="info-value">${studentProfile?.class_name || '暂无'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">专业</div>
            <div class="info-value">${studentProfile?.major || '暂无'}</div>
          </div>
        </div>
      </div>
      
      <!-- 统一技术标签展示 -->
      <div class="section">
        <h2 class="section-title">
          <span class="icon">🏷️</span>技术标签汇总
        </h2>
        <div class="tags-container">
          ${allTechnicalTags.length > 0 
            ? allTechnicalTags.map(tagName => `<span class="tag">${tagName}</span>`).join('')
            : '<span class="empty-content">暂无技术标签信息</span>'
          }
        </div>
        ${allTechnicalTags.length > 0 ? 
          `<div class="tag-count">共掌握 ${allTechnicalTags.length} 项技术技能</div>` : ''
        }
      </div>
      
      <!-- 课程学习详情（按课程分组） -->
      <div class="section">
        <h2 class="section-title">
          <span class="icon">📚</span>课程学习详情
        </h2>
        
        ${Object.keys(courseGroups).length > 0 
          ? Object.entries(courseGroups).map(([courseName, data], index) => `
            <div class="course-card">
              <div class="course-header">
                <h3 class="course-title">${index + 1}. ${courseName}</h3>
                <div class="course-meta">
                  <span class="status-badge" style="background: #d4edda; color: #155724;">
                    已录入
                  </span>
                </div>
              </div>
              
              <!-- 学习收获 -->
              <div class="content-section">
                <div class="content-title">
                  <span class="icon">💡</span>学习收获
                </div>
                <div class="content-box">
                  ${data.achievements.length > 0 
                    ? data.achievements.map(achievement => 
                        achievement.content || achievement.description || '暂无详细描述'
                      ).join('<br><br>')
                    : '<span class="empty-content">暂未填写学习收获</span>'
                  }
                </div>
              </div>
              
              <!-- 学习成果 -->
              <div class="content-section">
                <div class="content-title">
                  <span class="icon">🏆</span>学习成果
                </div>
                <div class="content-box">
                  ${data.outcomes.length > 0 
                    ? data.outcomes.map(outcome => 
                        outcome.outcome_description || outcome.description || '暂无详细描述'
                      ).join('<br><br>')
                    : '<span class="empty-content">暂未填写学习成果</span>'
                  }
                </div>
              </div>
            </div>
          `).join('')
          : '<div class="empty-content" style="text-align: center; padding: 20px;">暂无课程学习数据</div>'
        }
      </div>
      
      <!-- 学习统计 -->
      <div class="stats-box">
        <h3 style="font-size: 16px; font-weight: bold; color: #2c3e50; margin: 0 0 15px 0;">
          <span style="margin-right: 5px;">📊</span>学习统计
        </h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div>${Object.keys(courseGroups).length}</div>
            <div>涉及课程数</div>
          </div>
          <div class="stat-item">
            <div>${learningInfo.learning_achievements.length}</div>
            <div>收获记录</div>
          </div>
          <div class="stat-item">
            <div>${learningInfo.learning_outcomes.length}</div>
            <div>成果记录</div>
          </div>
          <div class="stat-item">
            <div>${allTechnicalTags.length}</div>
            <div>技术技能</div>
          </div>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 40px; color: #999; font-size: 12px;">
        <p>此档案由学生服务平台自动生成</p>
      </div>
    </body>
    </html>
  `;
};