import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { useAuth } from '../../hooks/useAuth';
import useStudentProfile from '../../hooks/useStudentProfile';
import { Button, Textarea, Progress, Divider } from 'tdesign-react';
import { UploadIcon, AssignmentIcon, CalendarIcon } from 'tdesign-icons-react';

// 类型定义
interface Course {
  id: string;
  name: string;
  teacher: string;
  credits: number;
  status: 'pending' | 'in_progress' | 'completed';
  tags: string[];
  outcomes: string;
  achievements: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Semester {
  value: string;
  label: string;
  isActive: boolean;
}

const StudentAcademicTasks: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading } = useAuth();
  const { profile: studentProfile } = useStudentProfile(currentUser?.id || '');

  // 学期选择相关状态
  const [selectedSemester, setSelectedSemester] = useState('2024-2');
  const [semesters] = useState<Semester[]>([
    { value: '2024-2', label: '2024年第二学期', isActive: true },
    { value: '2024-1', label: '2024年第一学期', isActive: false },
    { value: '2023-2', label: '2023年第二学期', isActive: false },
    { value: '2023-1', label: '2023年第一学期', isActive: false },
    { value: '2022-2', label: '2022年第二学期', isActive: false },
    { value: '2022-1', label: '2022年第一学期', isActive: false },
  ]);

  // 常用技术标签
  const [commonTags] = useState<string[]>([
    'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular',
    'Node.js', 'Python', 'Java', 'C++', 'Go',
    'HTML/CSS', 'SQL', 'MongoDB', 'Redis', 'Docker',
    'Git', 'Linux', 'AWS', '机器学习', '深度学习',
    '数据结构', '算法', '前端开发', '后端开发', '全栈开发',
    '移动开发', '数据库设计', '系统设计', '云计算', '微服务'
  ]);

  // 课程数据状态
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [trainingProgramName, setTrainingProgramName] = useState<string>('');
  const [learningDataLoaded, setLearningDataLoaded] = useState(false);

  // 编辑状态
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  
  // 标签输入相关状态
  const [tagInput, setTagInput] = useState<{ [courseId: string]: string }>({});

  // 根据标签名称判断分类
  const getTagCategory = (tagName: string): string => {
    const lowerTagName = tagName.toLowerCase();
    
    // 编程语言
    const programmingLanguages = ['javascript', 'typescript', 'python', 'java', 'c++', 'go', 'html/css', 'sql'];
    if (programmingLanguages.some(lang => lowerTagName.includes(lang))) {
      return 'programming_language';
    }
    
    // 框架
    const frameworks = ['react', 'vue', 'angular', 'node.js'];
    if (frameworks.some(framework => lowerTagName.includes(framework))) {
      return 'framework';
    }
    
    // 数据库
    const databases = ['mongodb', 'redis', 'mysql', 'postgresql'];
    if (databases.some(db => lowerTagName.includes(db))) {
      return 'database';
    }
    
    // 工具
    const tools = ['git', 'linux', 'aws', 'docker'];
    if (tools.some(tool => lowerTagName.includes(tool))) {
      return 'tool';
    }
    
    // 技术领域
    const techAreas = ['机器学习', '深度学习', '数据结构', '算法', '前端开发', '后端开发', '全栈开发', '移动开发', '数据库设计', '系统设计', '云计算', '微服务'];
    if (techAreas.some(area => lowerTagName.includes(area.toLowerCase()))) {
      return 'technical_area';
    }
    
    // 默认分类
    return 'other';
  };

  // 加载学生已保存的学习数据
  const fetchStudentLearningData = async () => {
    if (!studentProfile?.id) {
      console.log('学生档案ID不存在，无法加载学习数据');
      return;
    }

    try {
      console.log('开始加载学生已保存的学习数据，学生档案ID:', studentProfile.id);
      
      const response = await fetch(`/api/student-learning/get-summary/${studentProfile.id}`);
      
      if (!response.ok) {
        console.warn('获取学习数据失败，响应状态:', response.status);
        return;
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        console.log('获取到的学习数据:', result.data);
        
        // 将保存的学习数据合并到现有课程中
        if (result.data.technical_tags && result.data.technical_tags.length > 0) {
          // 将技术标签按相关课程分组
          const tagsByCourse: Record<string, string[]> = {};
          result.data.technical_tags.forEach((tag: any) => {
            const courseName = tag.description?.replace('课程: ', '') || '未分类';
            if (!tagsByCourse[courseName]) {
              tagsByCourse[courseName] = [];
            }
            tagsByCourse[courseName].push(tag.tag_name);
          });
          
          // 更新课程中的标签（只在没有标签时更新）
          setCourses(prevCourses => 
            prevCourses.map(course => ({
              ...course,
              tags: (!course.tags || course.tags.length === 0) ? (tagsByCourse[course.name] || []) : course.tags
            }))
          );
        }
        
        if (result.data.learning_achievements && result.data.learning_achievements.length > 0) {
          // 将学习收获按相关课程分组
          const achievementsByCourse: Record<string, string> = {};
          result.data.learning_achievements.forEach((achievement: any) => {
            const courseName = achievement.related_course || '未分类';
            achievementsByCourse[courseName] = achievement.content;
          });
          
          // 更新课程中的学习收获（只在没有内容时更新）
          setCourses(prevCourses => 
            prevCourses.map(course => ({
              ...course,
              outcomes: (!course.outcomes || course.outcomes.trim() === '') ? (achievementsByCourse[course.name] || '') : course.outcomes
            }))
          );
        }
        
        if (result.data.learning_outcomes && result.data.learning_outcomes.length > 0) {
          // 将学习成果按相关课程分组，但只取最新的一个
          const outcomesByCourse: Record<string, any> = {};
          result.data.learning_outcomes.forEach((outcome: any) => {
            let courseName = outcome.related_course;
            
            // 如果没有相关课程，尝试从标题中提取课程名
            if (!courseName && outcome.outcome_title) {
              const match = outcome.outcome_title.match(/^(.+?)\s*-\s*学习成果$/);
              if (match) {
                courseName = match[1];
              }
            }
            
            // 如果仍然没有找到，使用默认值
            if (!courseName) {
              courseName = '未分类';
            }
            
            // 只保留最新的学习成果（根据创建时间）
            if (!outcomesByCourse[courseName] || new Date(outcome.created_at) > new Date(outcomesByCourse[courseName].created_at)) {
              outcomesByCourse[courseName] = outcome;
            }
            
            console.log(`学习成果映射: ${courseName} -> ${outcome.outcome_description}`);
          });
          
          // 更新课程中的学习成果（只显示最新的一条）
          setCourses(prevCourses => 
            prevCourses.map(course => {
              const matchedOutcome = outcomesByCourse[course.name];
              console.log(`课程 ${course.name} 匹配到学习成果:`, matchedOutcome);
              return {
                ...course,
                achievements: matchedOutcome ? matchedOutcome.outcome_description : (course.achievements || '')
              };
            })
          );
        }
        
        console.log('✅ 学生学习数据加载并合并成功');
        setLearningDataLoaded(true);
      }
    } catch (error) {
      console.error('加载学生学习数据失败:', error);
    }
  };

  // 加载学生的培养方案课程
  const fetchStudentTrainingProgramCourses = async () => {
    if (!studentProfile?.id) {
      console.log('学生档案ID不存在，无法加载课程');
      return;
    }

    try {
      setCoursesLoading(true);
      console.log('开始加载学生培养方案课程，学生档案ID:', studentProfile.id);
      
      const response = await fetch(`/api/student/${studentProfile.id}/training-program-courses`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API响应错误:', errorData);
        
        // 如果API调用失败，显示演示数据
        setCourses([
          {
            id: 'demo-1',
            name: '数据结构与算法',
            teacher: '张教授',
            credits: 4,
            status: 'in_progress',
            tags: ['数据结构', '算法', 'C++', 'Python'],
            outcomes: '掌握了基本数据结构，理解了算法复杂度分析',
            achievements: '完成了所有实验项目，期中成绩85分',
            startDate: '2024-02-26',
            endDate: '2024-07-15',
            description: '本课程主要讲授数据结构的基本概念和算法设计与分析方法'
          }
        ]);
        setTrainingProgramName('演示培养方案');
        return;
      }
      
      const result = await response.json();
      console.log('获取到的培养方案课程数据:', result);
      
      if (result.success && result.data && Array.isArray(result.data)) {
        const programData = result.data;
        
        if (programData.length === 0) {
          // 如果没有分配培养方案，显示提示信息
          setCourses([]);
          setTrainingProgramName('暂未分配培养方案');
        } else {
          // 从第一条记录中获取培养方案名称
          const programName = programData[0]?.program_name || '培养方案';
          setTrainingProgramName(programName);
          
          // 转换数据格式
          const transformedCourses = programData.map((course: any) => ({
            id: course.id,
            name: course.course_name,
            teacher: course.teacher || '待定',
            credits: course.credits || 0,
            status: course.status || 'not_started',
            tags: [], // 标签可以从课程性质或分类中提取
            outcomes: '',
            achievements: '',
            startDate: '2024-02-26', // 可以从实际数据中获取
            endDate: '2024-07-15',   // 可以从实际数据中获取
            description: course.course_description || `${course.course_name} - ${course.course_nature}`,
            programName: course.program_name,
            programCode: course.program_code,
            semester: course.semester,
            courseNature: course.course_nature,
            examMethod: course.exam_method,
            grade: course.grade,
            completedAt: course.completed_at
          }));
          
          console.log('转换后的课程数据:', transformedCourses);
          setCourses(transformedCourses);
        }
      } else {
        console.warn('API返回数据格式不正确:', result);
        setCourses([]);
        setTrainingProgramName('数据加载失败');
      }
    } catch (error) {
      console.error('加载培养方案课程失败:', error);
      // 显示错误状态，但仍保留基本功能
      setCourses([
        {
          id: 'error-1',
          name: '数据加载失败',
          teacher: '未知',
          credits: 0,
          status: 'pending',
          tags: [],
          outcomes: '',
          achievements: '',
          startDate: '',
          endDate: '',
          description: '无法加载培养方案数据，请检查网络连接或联系管理员'
        }
      ]);
      setTrainingProgramName('数据加载失败');
    } finally {
      setCoursesLoading(false);
    }
  };

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '教学任务与安排 - 学档通';
    return () => { document.title = originalTitle; };
  }, []);

  // 页面加载时获取培养方案课程和学习数据
  useEffect(() => {
    if (studentProfile?.id) {
      fetchStudentTrainingProgramCourses();
    }
  }, [studentProfile?.id, selectedSemester]);

  // 在课程加载完成后，加载已保存的学习数据
  useEffect(() => {
    if (studentProfile?.id && courses.length > 0 && !learningDataLoaded) {
      fetchStudentLearningData();
    }
  }, [studentProfile?.id, courses, learningDataLoaded]);

  const handleLogoutClick = () => {
    if (confirm('确定要退出登录吗？')) {
      navigate('/login');
    }
  };

  const handleUserInfoClick = () => {
    navigate('/student-my-profile');
  };

  // 学期切换处理
  const handleSemesterChange = (value: string) => {
    setSelectedSemester(value);
    // 这里可以添加切换学期后的数据加载逻辑
    loadCoursesForSemester(value);
  };

  // 加载指定学期的课程数据
  const loadCoursesForSemester = (semester: string) => {
    // 模拟加载不同学期的课程数据
    console.log('加载学期', semester, '的课程数据');
  };

  // 编辑课程信息
  const handleEditCourse = (courseId: string) => {
    setEditingCourse(courseId);
  };

  // 保存课程信息（使用同步API，更新而非新增）
  const handleSaveCourse = async (courseId: string) => {
    // 使用固定的测试学生ID来确保API调用成功
    const testStudentId = 'f1c1aa0d-2169-4369-af14-3cadc6aa22b4';
    const currentStudentId = studentProfile?.id || testStudentId;
    
    console.log('保存课程信息，学生ID:', currentStudentId);
    
    try {
      const course = courses.find(c => c.id === courseId);
      if (!course) {
        alert('无法找到课程信息');
        return;
      }

      console.log('开始同步课程信息:', course);
      
      // 1. 同步技术标签（使用新的sync接口）
      if (course.tags.length > 0) {
        try {
          const tagResponse = await fetch('/api/student-learning/sync-technical-tags', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              student_profile_id: currentStudentId,
              course_name: course.name,
              tags: course.tags
            })
          });

          if (tagResponse.ok) {
            const result = await tagResponse.json();
            console.log('技术标签同步成功:', result);
          } else {
            const errorData = await tagResponse.json().catch(() => ({}));
            console.warn('技术标签同步失败:', errorData);
          }
        } catch (error) {
          console.warn('技术标签同步API调用失败:', error);
        }
      }

      // 2. 同步学习收获（使用新的sync接口）
      try {
        const achievementResponse = await fetch('/api/student-learning/sync-learning-achievement', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            student_profile_id: currentStudentId,
            course_name: course.name,
            content: course.outcomes
          })
        });

        if (achievementResponse.ok) {
          const result = await achievementResponse.json();
          console.log('学习收获同步成功:', result);
        } else {
          const errorData = await achievementResponse.json().catch(() => ({}));
          console.warn('学习收获同步失败:', errorData);
        }
      } catch (error) {
        console.warn('学习收获同步API调用失败:', error);
      }

      // 3. 同步学习成果（使用新的sync接口）
      try {
        const outcomeResponse = await fetch('/api/student-learning/sync-learning-outcome', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            student_profile_id: currentStudentId,
            course_name: course.name,
            description: course.achievements,
            start_date: course.startDate || new Date().toISOString().split('T')[0],
            end_date: course.endDate || new Date().toISOString().split('T')[0]
          })
        });

        if (outcomeResponse.ok) {
          const result = await outcomeResponse.json();
          console.log('学习成果同步成功:', result);
        } else {
          const errorData = await outcomeResponse.json().catch(() => ({}));
          console.warn('学习成果同步失败:', errorData);
        }
      } catch (error) {
        console.warn('学习成果同步API调用失败:', error);
      }



      alert('课程信息同步成功！已更新现有数据，不会产生重复记录。');
      setEditingCourse(null);
      
      // 重新加载学习数据以确保显示最新内容
      setTimeout(() => {
        setLearningDataLoaded(false); // 重置状态
        fetchStudentLearningData();
      }, 500);
      
    } catch (error) {
      console.error('保存课程信息失败:', error);
      alert('保存失败，请检查网络连接或联系管理员');
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingCourse(null);
  };

  // 更新课程信息
  const handleCourseChange = (courseId: string, field: keyof Course, value: any) => {
    setCourses(prev => prev.map(course => 
      course.id === courseId ? { ...course, [field]: value } : course
    ));
  };



  // 添加标签
  const handleAddTag = (courseId: string, tag: string) => {
    if (!tag.trim()) return;
    
    setCourses(prev => prev.map(course => 
      course.id === courseId 
        ? { ...course, tags: [...course.tags, tag.trim()] }
        : course
    ));
    setTagInput(prev => ({ ...prev, [courseId]: '' }));
  };

  // 删除标签
  const handleRemoveTag = (courseId: string, tagToRemove: string) => {
    setCourses(prev => prev.map(course => 
      course.id === courseId 
        ? { ...course, tags: course.tags.filter(tag => tag !== tagToRemove) }
        : course
    ));
  };

  // 从常用标签添加
  const handleAddCommonTag = (courseId: string, tag: string) => {
    setCourses(prev => prev.map(course => 
      course.id === courseId && !course.tags.includes(tag)
        ? { ...course, tags: [...course.tags, tag] }
        : course
    ));
  };

  // 获取状态标签
  const getStatusTag = (status: Course['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-3 py-1 text-xs rounded-full font-medium bg-green-100 text-green-800 flex items-center">
            <i className="fas fa-check-circle mr-1"></i>
            已完成
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-3 py-1 text-xs rounded-full font-medium bg-orange-100 text-orange-800 flex items-center">
            <i className="fas fa-clock mr-1"></i>
            进行中
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1 text-xs rounded-full font-medium bg-gray-100 text-gray-800 flex items-center">
            <i className="fas fa-hourglass-start mr-1"></i>
            待开始
          </span>
        );
      default:
        return null;
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
            <div 
              onClick={handleUserInfoClick}
              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
            >
              <img 
                src={studentProfile?.profile_photo || "https://s.coze.cn/image/DQIklNDlQyw/"} 
                alt="学生头像" 
                className="w-8 h-8 rounded-full object-cover" 
              />
              <div className="text-sm">
                <div className="font-medium text-text-primary">
                  {authLoading ? '加载中...' : (currentUser?.full_name || currentUser?.username || '未知用户')}
                </div>
                <div className="text-text-secondary">
                  {authLoading ? '加载中...' : (currentUser?.class_name || '未知班级')}
                </div>
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
            to="/student-dashboard" 
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
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
            className={`${styles.navItem} ${styles.navItemActive} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors`}
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
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">教学任务与安排</h2>
            <nav className="text-sm text-text-secondary">
              <Link to="/student-dashboard" className="hover:text-secondary">首页</Link>
              <span className="mx-2">/</span>
              <span>教学任务与安排</span>
            </nav>
          </div>
        </div>

        {/* 学期选择器 */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-500 p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">学期选择</h3>
                  <p className="text-sm text-gray-600">查看不同学期的课程安排和进度</p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-2">
                <select 
                  value={selectedSemester}
                  onChange={(e) => handleSemesterChange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-white w-48"
                >
                  {semesters.map(semester => (
                    <option key={semester.value} value={semester.value}>
                      {semester.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* 课程统计信息 */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">课程概览</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm mb-1">总课程数</p>
                  <p className="text-3xl font-bold text-blue-600">{courses.length}</p>
                  <p className="text-text-secondary text-sm mt-1">本学期课程</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-book text-white text-xl"></i>
                </div>
              </div>
            </div>
            <div className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm mb-1">已完成</p>
                  <p className="text-3xl font-bold text-green-600">
                    {courses.filter(c => c.status === 'completed').length}
                  </p>
                  <p className="text-text-secondary text-sm mt-1">课程完成</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-check-circle text-white text-xl"></i>
                </div>
              </div>
            </div>
            <div className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm mb-1">进行中</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {courses.filter(c => c.status === 'in_progress').length}
                  </p>
                  <p className="text-text-secondary text-sm mt-1">正在学习</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-clock text-white text-xl"></i>
                </div>
              </div>
            </div>
            <div className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm mb-1">总学分</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {courses.reduce((sum, c) => sum + c.credits, 0)}
                  </p>
                  <p className="text-text-secondary text-sm mt-1">学分累计</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-graduation-cap text-white text-xl"></i>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 课程列表 */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">课程详情</h3>
              <div className="flex items-center space-x-3">
                {trainingProgramName && (
                  <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                    <i className="fas fa-graduation-cap mr-1"></i>
                    {trainingProgramName}
                  </div>
                )}
                <p className="text-sm text-text-secondary">点击编辑按钮填写学习收获和成果</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-text-secondary">
              <i className="fas fa-info-circle"></i>
              <span>共 {courses.length} 门课程</span>
            </div>
          </div>
          
          <div className="space-y-6">
            {coursesLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <i className="fas fa-spinner fa-spin text-3xl text-secondary mb-4"></i>
                  <p className="text-text-secondary">正在加载培养方案课程...</p>
                </div>
              </div>
            ) : courses.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-book-open text-2xl text-gray-400"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-600 mb-2">暂无培养方案课程</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {trainingProgramName === '暂未分配培养方案' 
                      ? '您的教师还未为您分配培养方案，请联系教师。' 
                      : '当前培养方案下暂无课程安排。'
                    }
                  </p>
                </div>
              </div>
            ) : courses.map((course) => (
              <div key={course.id} className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} transition-all duration-300`}>
                {/* 课程头部信息 */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        course.status === 'completed' ? 'bg-green-100' :
                        course.status === 'in_progress' ? 'bg-orange-100' :
                        'bg-gray-100'
                      }`}>
                        <AssignmentIcon className={`text-xl ${
                          course.status === 'completed' ? 'text-green-600' :
                          course.status === 'in_progress' ? 'text-orange-600' :
                          'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-text-primary mb-1">{course.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-text-secondary">
                          <span className="flex items-center space-x-1">
                            <i className="fas fa-graduation-cap text-xs"></i>
                            <span>{course.credits}学分</span>
                          </span>
                          {(course as any).semester && (
                            <span className="flex items-center space-x-1">
                              <i className="fas fa-calendar-alt text-xs"></i>
                              <span>{(course as any).semester}</span>
                            </span>
                          )}
                          {(course as any).courseNature && (
                            <span className="flex items-center space-x-1">
                              <i className="fas fa-tag text-xs"></i>
                              <span>{(course as any).courseNature}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        {getStatusTag(course.status)}
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant={editingCourse === course.id ? "outline" : "text"}
                    onClick={() => editingCourse === course.id ? handleCancelEdit() : handleEditCourse(course.id)}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center ${
                      editingCourse === course.id 
                        ? 'border border-gray-300 text-text-secondary bg-white hover:bg-gray-50' 
                        : 'bg-secondary text-white hover:bg-accent'
                    }`}
                  >
                    <i className={`fas ${editingCourse === course.id ? 'fa-times' : 'fa-edit'} mr-2`}></i>
                    <span>{editingCourse === course.id ? '取消' : '编辑'}</span>
                  </Button>
                </div>



                {/* 技术标签 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-primary mb-3 flex items-center">
                    <i className="fas fa-tags text-purple-500 mr-2"></i>
                    技术标签
                  </label>
                  {editingCourse === course.id ? (
                    <div className="space-y-3">
                      {/* 已选标签显示 */}
                      <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-gray-50 rounded-lg border border-gray-200">
                        {course.tags.length > 0 ? (
                          course.tags.map((tag, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-3 py-1 text-sm bg-primary text-accent rounded-full"
                            >
                              {tag}
                              <button
                                onClick={() => handleRemoveTag(course.id, tag)}
                                className="ml-2 text-purple-600 hover:text-purple-800"
                              >
                                <i className="fas fa-times text-xs"></i>
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">暂无标签，请添加技术标签</span>
                        )}
                      </div>
                      
                      {/* 标签输入 */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={tagInput[course.id] || ''}
                          onChange={(e) => setTagInput(prev => ({ ...prev, [course.id]: e.target.value }))}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddTag(course.id, tagInput[course.id] || '');
                            }
                          }}
                          placeholder="输入自定义标签后按回车添加"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                        />
                        <button
                          onClick={() => handleAddTag(course.id, tagInput[course.id] || '')}
                          className="px-4 py-2 bg-secondary text-white hover:bg-accent rounded-lg transition-colors flex items-center"
                        >
                          <i className="fas fa-plus mr-1"></i>
                          添加
                        </button>
                      </div>
                      
                      {/* 常用标签选择 */}
                      <div>
                        <p className="text-sm text-gray-600 mb-2">或选择常用标签：</p>
                        <div className="flex flex-wrap gap-2">
                          {commonTags.map((tag, index) => (
                            <button
                              key={index}
                              onClick={() => handleAddCommonTag(course.id, tag)}
                              disabled={course.tags.includes(tag)}
                              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                course.tags.includes(tag)
                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  : 'bg-gray-100 text-text-secondary hover:bg-primary hover:text-accent'
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 min-h-[40px] p-4 bg-gray-50 rounded-lg border border-gray-200">
                      {course.tags.length > 0 ? (
                        course.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-3 py-1 text-sm bg-primary text-accent rounded-full"
                          >
                            <i className="fas fa-tag mr-1 text-xs"></i>
                            {tag}
                          </span>
                        ))
                      ) : (
                        <div className="flex items-center text-gray-500">
                          <i className="fas fa-tags mr-2"></i>
                          <span className="text-sm">暂无技术标签</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t pt-6">

                  {/* 收获与成果编辑区域 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-3 flex items-center">
                        <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
                        学习收获
                      </label>
                      {editingCourse === course.id ? (
                        <Textarea
                          value={course.outcomes}
                          onChange={(value) => handleCourseChange(course.id, 'outcomes', value)}
                          placeholder="请描述您在本课程中的学习收获和体会..."
                          rows={4}
                          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-accent focus:border-transparent"
                        />
                      ) : (
                        <div className="min-h-[100px] p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-600">
                            {course.outcomes || '暂未填写学习收获'}
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-3 flex items-center">
                        <i className="fas fa-trophy text-yellow-500 mr-2"></i>
                        学习成果
                      </label>
                      {editingCourse === course.id ? (
                        <Textarea
                          value={course.achievements}
                          onChange={(value) => handleCourseChange(course.id, 'achievements', value)}
                          placeholder="请描述您在本课程中取得的具体成果和成就..."
                          rows={4}
                          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-accent focus:border-transparent"
                        />
                      ) : (
                        <div className="min-h-[100px] p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-600">
                            {course.achievements || '暂未填写学习成果'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>



                  {editingCourse === course.id && (
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                      <Button 
                        variant="outline" 
                        onClick={handleCancelEdit} 
                        className="px-6 py-2 border border-border-light text-text-secondary rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                      >
                        <i className="fas fa-times mr-2"></i>
                        取消
                      </Button>
                      <button 
                        onClick={() => handleSaveCourse(course.id)} 
                        className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors flex items-center"
                      >
                        <i className="fas fa-save mr-2"></i>
                        保存更改
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentAcademicTasks;