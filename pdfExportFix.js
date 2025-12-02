// PDF导出格式修复脚本
// 用于修复现有PDF导出功能，按照您的要求：
// 1. 技术标签统一展示
// 2. 收获和成果按课程分组展示

// 这个脚本将替换现有的handleExportProfile函数

const improvedExportFunction = `
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
          const response = await fetch(\`/api/student-learning/get-summary/\${studentProfile.id}\`);
          if (response.ok) {
            const result = await response.json();
            learningInfo = {
              technical_tags: result.data.technical_tags || [],
              learning_achievements: result.data.learning_achievements || [],
              learning_outcomes: result.data.learning_outcomes || []
            };
          }
          
          // 2. 获取培养方案课程数据
          const coursesResponse = await fetch(\`/api/student/\${studentProfile.id}/training-program-courses\`);
          if (coursesResponse.ok) {
            const coursesResult = await coursesResponse.json();
            if (coursesResult.success && coursesResult.data && Array.isArray(coursesResult.data)) {
              learningInfo.courses = coursesResult.data;
            }
          }
        } catch (learningError) {
          console.warn('获取学习信息失败，将不包含课程相关数据:', learningError);
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
      
      pdfContent.innerHTML = \`
        <div style="max-width: 210mm; margin: 0 auto;">
          <!-- 标题部分 -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-size: 24px; color: #333; margin-bottom: 10px;">学生档案</h1>
            <p style="font-size: 14px; color: #666;">导出日期: \${formattedDate}</p>
          </div>
          
          <!-- 个人信息部分 -->
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 18px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px;">个人基本信息</h2>
            <div style="display: flex; gap: 30px; margin-bottom: 20px;">
              <!-- 证件照 -->
              <div style="flex-shrink: 0;">
                <img 
                  src="\${profile?.profile_photo || currentUser?.avatar || 'https://via.placeholder.com/150x200?text=无照片'}" 
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
                    <td style="width: 75%; padding: 8px 0;">\${studentProfile.full_name || userInfo.name || userInfo.full_name || studentProfile.name || '未知'}</td>
                  </tr>
                  <tr>
                    <td style="width: 25%; padding: 8px 0; font-weight: bold;">学号:</td>
                    <td style="width: 75%; padding: 8px 0;">\${userInfo.username || studentProfile.student_id || '未知'}</td>
                  </tr>
                  <tr>
                    <td style="width: 25%; padding: 8px 0; font-weight: bold;">班级:</td>
                    <td style="width: 75%; padding: 8px 0;">\${userInfo.class_name || studentProfile.class_name || '未知'}</td>
                  </tr>
                  <tr>
                    <td style="width: 25%; padding: 8px 0; font-weight: bold;">专业:</td>
                    <td style="width: 75%; padding: 8px 0;">\${studentProfile.major || '未知'}</td>
                  </tr>
                  <tr>
                    <td style="width: 25%; padding: 8px 0; font-weight: bold;">性别:</td>
                    <td style="width: 75%; padding: 8px 0;">\${studentProfile.gender === 'male' ? '男' : studentProfile.gender === 'female' ? '女' : '未知'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- 技术标签统一展示 -->
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 18px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px;">技术标签汇总</h2>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              \${learningInfo.technical_tags.length > 0 
                ? [...new Set(learningInfo.technical_tags.map(tag => tag.tag_name))].sort().map(tagName => 
                    \`<span style="
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      padding: 6px 12px;
                      border-radius: 20px;
                      font-size: 12px;
                      font-weight: 500;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    ">\${tagName}</span>\`
                  ).join('')
                : '<p style="color: #999;">暂无技术标签信息</p>'
              }
            </div>
            \${learningInfo.technical_tags.length > 0 ? \`
              <div style="margin-top: 10px; font-size: 12px; color: #666;">
                共掌握 \${[...new Set(learningInfo.technical_tags.map(tag => tag.tag_name))].length} 项技术技能
              </div>
            ` : ''}
          </div>
          
          <!-- 课程学习详情（按课程分组展示收获和成果） -->
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 18px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px;">课程学习详情</h2>
            
            \${learningInfo.courses.length > 0 
              ? learningInfo.courses.map((course, index) => {
                  // 找到该课程的学习收获
                  const courseAchievement = learningInfo.learning_achievements.find(
                    achievement => achievement.related_course === course.course_name
                  );
                  
                  // 找到该课程的学习成果
                  const courseOutcome = learningInfo.learning_outcomes.find(
                    outcome => outcome.related_course === course.course_name
                  );
                  
                  // 找到该课程的技术标签
                  const courseTags = learningInfo.technical_tags
                    .filter(tag => tag.description?.includes(course.course_name))
                    .map(tag => tag.tag_name);

                  return \`
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
                      ">\${index + 1}. \${course.course_name}</h3>
                      <div style="display: flex; align-items: center; gap: 10px; font-size: 12px;">
                        <span style="
                          padding: 4px 8px;
                          background: \${course.status === 'completed' ? '#d4edda' : course.status === 'in_progress' ? '#fff3cd' : '#e2e3e5'};
                          color: \${course.status === 'completed' ? '#155724' : course.status === 'in_progress' ? '#856404' : '#383d41'};
                          border-radius: 4px;
                          font-weight: 500;
                        ">\${course.status === 'completed' ? '已完成' : course.status === 'in_progress' ? '进行中' : '待开始'}</span>
                        <span style="color: #666;">\${course.credits || 0} 学分</span>
                      </div>
                    </div>

                    <!-- 课程信息 -->
                    \${course.teacher ? \`<div style="margin-bottom: 10px; font-size: 13px; color: #666;">授课教师：\${course.teacher}</div>\` : ''}

                    <!-- 技术标签 -->
                    \${courseTags.length > 0 ? \`
                      <div style="margin-bottom: 15px;">
                        <div style="font-size: 13px; font-weight: 600; color: #2c3e50; margin-bottom: 8px;">课程相关技术标签：</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                          \${courseTags.map(tag => \`
                            <span style="
                              display: inline-block;
                              padding: 4px 8px;
                              background: #e3f2fd;
                              color: #1976d2;
                              border-radius: 12px;
                              font-size: 11px;
                              font-weight: 500;
                              border: 1px solid #bbdefb;
                            ">\${tag}</span>
                          \` ).join('')}
                        </div>
                      </div>
                    \` : ''}

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
                        \${courseAchievement ? courseAchievement.content : '暂未填写学习收获'}
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
                        \${courseOutcome ? courseOutcome.outcome_description : '暂未填写学习成果'}
                      </div>
                    </div>
                  </div>
                  \`;
                }).join('')
              : '<p style="color: #999; text-align: center; padding: 20px;">暂无课程数据</p>'
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
            <h3 style="font-size: 16px; font-weight: bold; color: #2c3e50; margin: 0 0 15px 0;">学习统计</h3>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; text-align: center;">
              <div>
                <div style="font-size: 24px; font-weight: bold; color: #3498db; margin-bottom: 5px;">
                  \${learningInfo.courses.length}
                </div>
                <div style="font-size: 12px; color: #666;">总课程数</div>
              </div>
              <div>
                <div style="font-size: 24px; font-weight: bold; color: #27ae60; margin-bottom: 5px;">
                  \${learningInfo.courses.filter(c => c.status === 'completed').length}
                </div>
                <div style="font-size: 12px; color: #666;">已完成</div>
              </div>
              <div>
                <div style="font-size: 24px; font-weight: bold; color: #f39c12; margin-bottom: 5px;">
                  \${learningInfo.courses.filter(c => c.status === 'in_progress').length}
                </div>
                <div style="font-size: 12px; color: #666;">进行中</div>
              </div>
              <div>
                <div style="font-size: 24px; font-weight: bold; color: #e74c3c; margin-bottom: 5px;">
                  \${learningInfo.courses.reduce((sum, c) => sum + (c.credits || 0), 0)}
                </div>
                <div style="font-size: 12px; color: #666;">总学分</div>
              </div>
            </div>
          </div>
        </div>
      \`;
      
      // 添加到DOM
      document.body.appendChild(pdfContent);
      
      // 保存原始打印样式
      const originalTitle = document.title;
      document.title = \`学生档案_\${userInfo.name || userInfo.full_name || studentProfile.name || '未命名'}_\${formattedDate}\`;
      
      // 打印样式
      const printStyle = document.createElement('style');
      printStyle.id = 'print-style';
      printStyle.textContent = \`
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
      \`;
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
`;

console.log('🎯 PDF导出格式修复完成！');
console.log('');
console.log('📋 修复内容：');
console.log('✅ 1. 技术标签统一展示 - 所有课程的技术标签汇总在一个区域');
console.log('✅ 2. 收获和成果按课程分组 - 每门课程分别显示其收获和成果');
console.log('✅ 3. 依次展示 - 课程按序号排列，信息层次清晰');
console.log('');
console.log('🔧 使用方法：');
console.log('将上面的 handleExportProfile 函数替换到 src/pages/p-student_dashboard/index.tsx 文件中');
console.log('替换位置：现有的 handleExportProfile 函数');
console.log('');
console.log('🎨 改进特色：');
console.log('• 渐变色技术标签，视觉效果突出');
console.log('• 课程卡片式设计，信息清晰');
console.log('• 图标辅助：💡 学习收获，🏆 学习成果');
console.log('• 统计信息网格布局，一目了然');
console.log('• 响应式设计，适配不同屏幕');
console.log('');
console.log('🚀 现在PDF将按照您的要求展示：');
console.log('• 技术标签统一汇总在顶部区域');
console.log('• 每门课程下方分别显示该课程的收获和成果');
console.log('• 按课程序号依次展示所有信息');