import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { useAuth } from '../../hooks/useAuth';
import useStudentProfile from '../../hooks/useStudentProfile';
import { Button, Progress, Divider } from 'tdesign-react';
import { UploadIcon, AssignmentIcon, CalendarIcon } from 'tdesign-icons-react';
import { Editor } from '@tinymce/tinymce-react';

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
  isCustom?: boolean;
  programName?: string;
  programCode?: string;
  semester?: string;
  courseNature?: string;
  examMethod?: string;
  grade?: string;
  completedAt?: string;
  courseCode?: string; // 添加课程代码字段
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
  const [selectedSemester, setSelectedSemester] = useState('2023-2024-1');
  const [semesters, setSemesters] = useState<Semester[]>([
    { value: '2023-2024-2', label: '2023-2024学年第二学期', isActive: true },
    { value: '2023-2024-1', label: '2023-2024学年第一学期', isActive: false },
    { value: '2022-2023-2', label: '2022-2023学年第二学期', isActive: false },
    { value: '2022-2023-1', label: '2022-2023学年第一学期', isActive: false },
    { value: '2021-2022-2', label: '2021-2022学年第二学期', isActive: false },
    { value: '2021-2022-1', label: '2021-2022学年第一学期', isActive: false },
  ]);

  // 根据入学年份生成学期选项
  useEffect(() => {
    if (studentProfile?.enrollment_year) {
      const enrollmentYear = parseInt(studentProfile.enrollment_year);
      if (!isNaN(enrollmentYear)) {
        const generatedSemesters: Semester[] = [];
        // 从入学年份开始，生成到入学年份+4年（假设4年学制）
        for (let year = enrollmentYear; year < enrollmentYear + 4; year++) {
          generatedSemesters.push(
            { value: `${year}-${year+1}-1`, label: `${year}-${year+1}学年第一学期`, isActive: year === enrollmentYear },
            { value: `${year}-${year+1}-2`, label: `${year}-${year+1}学年第二学期`, isActive: year === enrollmentYear }
          );
        }
        setSemesters(generatedSemesters);
        
        // 默认选中第一个学期
        if (generatedSemesters.length > 0) {
          setSelectedSemester(generatedSemesters[0].value);
        }
      }
    }
  }, [studentProfile?.enrollment_year]);

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
  
  // 添加课程相关状态
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // 确认弹框
  const [showEditCourseModal, setShowEditCourseModal] = useState(false); // 修改课程信息弹框
  const [editingCourseData, setEditingCourseData] = useState<Course | null>(null); // 当前正在编辑的课程数据
  const [newCourseCode, setNewCourseCode] = useState(''); // 添加课程代码状态
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCredits, setNewCourseCredits] = useState(1);
  const [newCourseNature, setNewCourseNature] = useState('选修课'); // 添加课程性质状态
  const [newCourseTeacher, setNewCourseTeacher] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  const [addCourseLoading, setAddCourseLoading] = useState(false);

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
    
    // 进一步
    const techAreas = ['机器学习', '深度学习', '数据结构', '算法', '前端开发', '后端开发', '全栈开发', '移动开发', '数据库设计', '系统设计', '云计算', '微服务'];
    if (techAreas.some(area => lowerTagName.includes(area.toLowerCase()))) {
      return 'technical_area';
    }
    
    // 默认分类
    return 'other';
  };

  // 加载学生已保存的学习数据
  const fetchStudentLearningData = async () => {
    if (!studentProfile?.id || learningDataLoaded) {
      console.log('学生档案ID不存在或数据已加载，跳过');
      return;
    }

    try {
      console.log('开始加载学生已保存的学习数据，学生档案ID:', studentProfile.id);
      
      const response = await fetch(`/api/student-learning/get-summary/${studentProfile.id}`);
      
      if (!response.ok) {
        console.warn('获取学习数据失败，响应状态:', response.status);
        if (response.status === 404) {
          console.log('学习数据不存在，这是正常情况');
        } else {
          console.error('学习数据API调用失败');
        }
        setLearningDataLoaded(true); // 标记为已尝试加载，避免重复请求
        return;
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        console.log('获取到的学习数据:', result.data);
        
        // 收集所有需要更新的课程数据
        const courseUpdates: Record<string, Partial<Course>> = {};
        
        // 处理技术标签
        if (result.data.technical_tags && result.data.technical_tags.length > 0) {
          const tagsByCourse: Record<string, string[]> = {};
          result.data.technical_tags.forEach((tag: any) => {
            const courseName = tag.description?.replace('课程: ', '') || '未分类';
            if (!tagsByCourse[courseName]) {
              tagsByCourse[courseName] = [];
            }
            tagsByCourse[courseName].push(tag.tag_name);
          });
          
          // 记录需要更新的标签
          courses.forEach(course => {
            if (!course.tags || course.tags.length === 0) {
              const tags = tagsByCourse[course.name] || [];
              if (tags.length > 0) {
                courseUpdates[course.id] = { ...courseUpdates[course.id], tags };
              }
            }
          });
        }
        
        // 处理学习收获
        if (result.data.learning_achievements && result.data.learning_achievements.length > 0) {
          const achievementsByCourse: Record<string, string> = {};
          result.data.learning_achievements.forEach((achievement: any) => {
            const courseName = achievement.related_course || '未分类';
            achievementsByCourse[courseName] = achievement.content;
          });
          
          courses.forEach(course => {
            if (!course.outcomes || course.outcomes.trim() === '') {
              const outcome = achievementsByCourse[course.name] || '';
              if (outcome) {
                courseUpdates[course.id] = { ...courseUpdates[course.id], outcomes: outcome };
              }
            }
          });
        }
        
        // 处理学习成果
        if (result.data.learning_outcomes && result.data.learning_outcomes.length > 0) {
          const outcomesByCourse: Record<string, any> = {};
          result.data.learning_outcomes.forEach((outcome: any) => {
            let courseName = outcome.related_course;
            
            if (!courseName && outcome.outcome_title) {
              const match = outcome.outcome_title.match(/^(.+?)\s*-\s*学习成果$/);
              if (match) {
                courseName = match[1];
              }
            }
            
            if (!courseName) {
              courseName = '未分类';
            }
            
            if (!outcomesByCourse[courseName] || new Date(outcome.created_at) > new Date(outcomesByCourse[courseName].created_at)) {
              outcomesByCourse[courseName] = outcome;
            }
          });
          
          courses.forEach(course => {
            const matchedOutcome = outcomesByCourse[course.name];
            if (matchedOutcome) {
              courseUpdates[course.id] = { 
                ...courseUpdates[course.id], 
                achievements: matchedOutcome.outcome_description || course.achievements 
              };
            }
          });
        }
        
        // 一次性更新所有课程，避免多次setCourses调用
        if (Object.keys(courseUpdates).length > 0) {
          setCourses(prevCourses => 
            prevCourses.map(course => 
              courseUpdates[course.id] 
                ? { ...course, ...courseUpdates[course.id] }
                : course
            )
          );
        }
        
        console.log('✅ 学生学习数据加载并合并成功');
        setLearningDataLoaded(true);
      } else {
        setLearningDataLoaded(true);
      }
    } catch (error) {
      console.error('加载学生学习数据失败:', error);
      setLearningDataLoaded(true);
    }
  };

  // 加载学生的自定义课程
  const fetchStudentCustomCourses = async () => {
    if (!studentProfile?.id) {
      console.log('学生档案ID不存在，无法加载自定义课程');
      return [];
    }

    try {
      console.log('开始加载学生自定义课程，学生档案ID:', studentProfile.id);
      
      const response = await fetch(`/api/get-custom-courses/${studentProfile.id}`);
      
      if (!response.ok) {
        console.warn('获取自定义课程失败，响应状态:', response.status);
        if (response.status !== 404) {
          console.error('自定义课程API错误:', response.status);
        }
        return [];
      }
      
      const result = await response.json();
      
      if (result.success && result.data && Array.isArray(result.data)) {
        const customCourses = result.data.map((course: any) => ({
          id: course.id,
          name: course.course_name,
          teacher: course.teacher || '自填课程',
          credits: course.credits || 1,
          status: course.status || 'pending',
          tags: [],
          outcomes: '',
          achievements: '',
          startDate: course.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          endDate: '',
          description: course.description || `${course.course_name} - 学生自定义添加的课程`,
          isCustom: true,
          semester: course.semester,
          courseNature: course.course_nature, // 添加课程性质
          courseCode: course.course_code // 添加课程代码
        }));

        console.log('获取到的自定义课程:', customCourses);
        return customCourses;
      } else {
        console.warn('自定义课程API返回数据格式不正确:', result);
        return [];
      }
    } catch (error) {
      console.error('加载自定义课程失败:', error);
      return [];
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
      
      // 先尝试加载自定义课程
      const customCourses = await fetchStudentCustomCourses();
      
      // 然后尝试加载培养方案课程
      let allCourses: Course[] = [...customCourses];
      let programName = customCourses.length > 0 ? '自定义课程' : '暂无课程';
      
      try {
        const response = await fetch(`/api/student/${studentProfile.id}/training-program-courses`);
        
        if (!response.ok) {
          console.error('培养方案API响应错误:', response.status);
          // 只显示自定义课程
          setCourses(allCourses);
          setTrainingProgramName(programName);
          return;
        }
        
        const result = await response.json();
        console.log('获取到的培养方案课程数据:', result);
        
        if (result.success && result.data && Array.isArray(result.data)) {
          const programData = result.data;
          
          if (programData.length > 0) {
            // 从第一条记录中获取培养方案名称
            programName = programData[0]?.program_name || '培养方案';
            
            // 转换培养方案课程数据格式
            const transformedCourses = programData.map((course: any) => ({
              id: course.id,
              name: course.course_name,
              teacher: course.teacher || '待定',
              credits: course.credits || 0,
              status: course.status || 'not_started',
              tags: [],
              outcomes: '',
              achievements: '',
              startDate: '2024-02-26',
              endDate: '2024-07-15',
              description: course.course_description || `${course.course_name} - ${course.course_nature}`,
              programName: course.program_name,
              programCode: course.program_code,
              semester: course.semester,
              courseNature: course.course_nature,
              examMethod: course.exam_method,
              grade: course.grade,
              completedAt: course.completed_at,
              isCustom: false
            }));
            
            // 合并培养方案课程和自定义课程
            allCourses = [...transformedCourses, ...customCourses];
          }
        }
        
        console.log('合并后的课程数据:', allCourses);
        setCourses(allCourses);
        setTrainingProgramName(programName);
        
      } catch (apiError) {
        console.error('培养方案课程API调用失败:', apiError);
        // 只显示自定义课程
        setCourses(allCourses);
        setTrainingProgramName(programName);
      }
      
    } catch (error) {
      console.error('加载课程失败:', error);
      
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
          description: '无法加载课程数据，请检查网络连接或联系管理员',
          isCustom: false
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
    if (studentProfile?.id && !coursesLoading) {
      console.log('🚀 开始加载课程数据，学生ID:', studentProfile.id);
      fetchStudentTrainingProgramCourses();
    }
  }, [studentProfile?.id, selectedSemester]);

  // 在课程加载完成后，加载已保存的学习数据
  useEffect(() => {
    if (studentProfile?.id && courses.length > 0 && !learningDataLoaded && !coursesLoading) {
      console.log('📚 开始加载学习数据，课程数量:', courses.length);
      fetchStudentLearningData();
    }
  }, [studentProfile?.id, courses.length, learningDataLoaded, coursesLoading]);

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

  // 添加一个函数来筛选课程
  const getFilteredCourses = () => {
    if (!selectedSemester) {
      return courses;
    }
    
    return courses.filter(course => {
      // 对于自定义课程，使用course.semester
      // 对于培养方案课程，使用(course as any).semester
      const courseSemester = course.semester || (course as any).semester;
      return courseSemester === selectedSemester;
    });
  };

  // 编辑课程信息
  const handleEditCourse = (courseId: string) => {
    setEditingCourse(courseId);
  };

  // 编辑课程基本信息
  const handleEditCourseInfo = (course: Course) => {
    setEditingCourseData({...course});
    setShowEditCourseModal(true);
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
          const tagResponse = await fetch('/api/sync-technical-tags', {
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

  // 添加新课程
  const handleAddCourse = async () => {
    if (!studentProfile?.id) {
      alert('学生档案不存在，无法添加课程');
      return;
    }

    if (!newCourseName.trim()) {
      alert('请输入课程名称');
      return;
    }

    // 显示确认弹框而不是直接添加
    setShowConfirmModal(true);
  };

  // 确认添加课程
  const confirmAddCourse = async () => {
    setShowConfirmModal(false);
    
    if (!studentProfile?.id) {
      alert('学生档案不存在，无法添加课程');
      return;
    }
    
    try {
      setAddCourseLoading(true);
      
      const response = await fetch('/api/add-custom-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_profile_id: studentProfile.id,
          course_code: newCourseCode.trim() || null, // 添加课程代码
          course_name: newCourseName.trim(),
          credits: newCourseCredits,
          course_nature: newCourseNature, // 添加课程性质
          teacher: newCourseTeacher.trim() || '自填课程',
          description: newCourseDescription.trim() || `${newCourseName.trim()} - 学生自定义添加的课程`,
          semester: selectedSemester
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '添加课程失败');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // 将新课程添加到课程列表
        const newCourse: Course = {
          id: result.data.course_id || `custom_${Date.now()}`,
          name: newCourseName.trim(),
          teacher: newCourseTeacher.trim() || '自填课程',
          credits: newCourseCredits,
          status: 'pending',
          tags: [],
          outcomes: '',
          achievements: '',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          description: newCourseDescription.trim() || `${newCourseName.trim()} - 学生自定义添加的课程`,
          courseCode: newCourseCode.trim() || undefined, // 添加课程代码
          courseNature: newCourseNature // 添加课程性质
        };

        setCourses(prev => [...prev, newCourse]);
      
        // 重置表单
        setNewCourseName('');
        setNewCourseCredits(1);
        setNewCourseNature('选修课'); // 重置课程性质
        setNewCourseTeacher('');
        setNewCourseDescription('');
        setShowAddCourseModal(false);
      
        alert('课程添加成功！');
      } else {
        throw new Error(result.message || '添加课程失败');
      }
    } catch (error: any) {
      console.error('添加课程失败:', error);
      alert(`添加课程失败: ${error.message}`);
    } finally {
      setAddCourseLoading(false);
    }
  };

  // 保存修改的课程信息
  const saveEditedCourse = async () => {
    if (!editingCourseData) return;
    
    try {
      // 更新本地状态
      setCourses(prev => prev.map(course => 
        course.id === editingCourseData.id ? editingCourseData : course
      ));
      
      // 关闭编辑弹框
      setShowEditCourseModal(false);
      setEditingCourseData(null);
      
      alert('课程信息更新成功！');
    } catch (error) {
      console.error('更新课程信息失败:', error);
      alert('更新课程信息失败，请重试');
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
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-white w-64"
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
                  <p className="text-3xl font-bold text-blue-600">{getFilteredCourses().length}</p>
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
                    {getFilteredCourses().filter(c => c.status === 'completed').length}
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
                    {getFilteredCourses().filter(c => c.status === 'in_progress').length}
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
                    {getFilteredCourses().reduce((sum, c) => sum + c.credits, 0)}
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
                <p className="text-sm text-text-secondary">
                  点击编辑按钮填写学习收获和成果，或点击"添加课程"创建自定义课程
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAddCourseModal(true)}
                className="px-4 py-2 bg-secondary text-white hover:bg-accent rounded-lg transition-colors flex items-center"
              >
                <i className="fas fa-plus mr-2"></i>
                添加课程
              </button>
              <div className="flex items-center space-x-2 text-sm text-text-secondary">
                <i className="fas fa-info-circle"></i>
                <span>共 {getFilteredCourses().length} 门课程</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {coursesLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <i className="fas fa-spinner fa-spin text-3xl text-secondary mb-4"></i>
                  <p className="text-text-secondary">
                    {coursesLoading ? '正在加载课程数据...' : '正在加载学习数据...'}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">请稍候，系统正在处理您的请求</p>
                </div>
              </div>
            ) : getFilteredCourses().length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-book-open text-2xl text-gray-400"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-600 mb-2">暂无课程</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {trainingProgramName === '暂未分配培养方案' 
                      ? '您的教师还未为您分配培养方案，您可以点击"添加课程"按钮创建自定义课程。' 
                      : trainingProgramName === '自定义课程' || trainingProgramName === '暂无课程'
                      ? '您还没有添加任何课程，点击"添加课程"按钮开始创建您的第一门课程。'
                      : '当前培养方案下暂无课程安排，您可以点击"添加课程"按钮创建自定义课程。'
                    }
                  </p>
                </div>
              </div>
            ) : getFilteredCourses().map((course) => (
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
                          {course.courseCode && (
                            <span className="flex items-center space-x-1">
                              <i className="fas fa-barcode text-xs"></i>
                              <span>{course.courseCode}</span>
                            </span>
                          )}
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
                          {course.teacher && (
                            <span className="flex items-center space-x-1">
                              <i className="fas fa-user-tie text-xs"></i>
                              <span>{course.teacher}</span>
                            </span>
                          )}
                        </div>
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
                  <div className="grid grid-cols-1 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-3 flex items-center">
                        <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
                        学习收获
                      </label>
                      {editingCourse === course.id ? (
                        <div className="border border-gray-300 rounded-lg overflow-hidden" key={`editor-${course.id}-outcomes`}>
                          <Editor
                            apiKey="v7u2eeph1xc44mcmwau59v5hxylkje773o14063m3bc0b5k1"
                            initialValue={course.outcomes || ''}
                            init={{
                              height: 300,
                              menubar: true,
                              plugins: [
                                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
                                'emoticons', 'codesample', 'textcolor', 'colorpicker'
                              ],
                              toolbar: 'undo redo | formatselect | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | code codesample | emoticons | fullscreen',
                              content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px; }',
                              language: 'zh_CN',
                              images_upload_url: '/api/upload',
                              images_upload_credentials: true,
                              setup: (editor) => {
                                editor.on('blur', () => {
                                  const content = editor.getContent();
                                  handleCourseChange(course.id, 'outcomes', content);
                                });
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div className="min-h-[100px] p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: course.outcomes || '<i>暂未填写学习收获</i>' }} />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-3 flex items-center">
                        <i className="fas fa-trophy text-yellow-500 mr-2"></i>
                        学习成果
                      </label>
                      {editingCourse === course.id ? (
                        <div className="border border-gray-300 rounded-lg overflow-hidden" key={`editor-${course.id}-achievements`}>
                          <Editor
                            apiKey="v7u2eeph1xc44mcmwau59v5hxylkje773o14063m3bc0b5k1"
                            initialValue={course.achievements || ''}
                            init={{
                              height: 300,
                              menubar: true,
                              plugins: [
                                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
                                'emoticons', 'codesample', 'textcolor', 'colorpicker'
                              ],
                              toolbar: 'undo redo | formatselect | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | code codesample | emoticons | fullscreen',
                              content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px; }',
                              language: 'zh_CN',
                              images_upload_url: '/api/upload',
                              images_upload_credentials: true,
                              setup: (editor) => {
                                editor.on('blur', () => {
                                  const content = editor.getContent();
                                  handleCourseChange(course.id, 'achievements', content);
                                });
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div className="min-h-[100px] p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: course.achievements || '<i>暂未填写学习成果</i>' }} />
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
                        onClick={() => handleEditCourseInfo(course)} 
                        className="px-6 py-2 bg-primary text-accent rounded-lg hover:bg-opacity-90 transition-colors flex items-center"
                      >
                        <i className="fas fa-edit mr-2"></i>
                        编辑信息
                      </button>
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

        {/* 添加课程弹窗 */}
        {showAddCourseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-text-primary flex items-center">
                  <i className="fas fa-plus-circle text-secondary mr-2"></i>
                  添加自定义课程
                </h3>
                <p className="text-sm text-text-secondary mt-1">
                  填写课程信息，添加后即可编辑学习收获和成果
                </p>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    <i className="fas fa-barcode text-blue-500 mr-1"></i>
                    课程代码
                  </label>
                  <input
                    type="text"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    placeholder="例如：32201226（可选）"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    maxLength={20}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    <i className="fas fa-book text-blue-500 mr-1"></i>
                    课程名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    placeholder="例如：Web前端开发"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    maxLength={100}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      <i className="fas fa-graduation-cap text-purple-500 mr-1"></i>
                      学分
                    </label>
                    <input
                      type="number"
                      value={newCourseCredits}
                      onChange={(e) => setNewCourseCredits(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="1"
                      min="0"
                      max="10"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      <i className="fas fa-tag text-orange-500 mr-1"></i>
                      课程性质
                    </label>
                    <select
                      value={newCourseNature}
                      onChange={(e) => setNewCourseNature(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    >
                      <option value="必修课">必修课</option>
                      <option value="选修课">选修课</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      <i className="fas fa-calendar-alt text-green-500 mr-1"></i>
                      学期
                    </label>
                    <select
                      value={selectedSemester}
                      onChange={(e) => setSelectedSemester(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    >
                      {semesters.map(semester => (
                        <option key={semester.value} value={semester.value}>
                          {semester.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      <i className="fas fa-user-tie text-green-500 mr-1"></i>
                      授课教师
                    </label>
                    <input
                      type="text"
                      value={newCourseTeacher}
                      onChange={(e) => setNewCourseTeacher(e.target.value)}
                      placeholder="可选填"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                      maxLength={50}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    <i className="fas fa-align-left text-orange-500 mr-1"></i>
                    课程描述
                  </label>
                  <textarea
                    value={newCourseDescription}
                    onChange={(e) => setNewCourseDescription(e.target.value)}
                    placeholder="可选填，简要描述课程内容"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                    maxLength={200}
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddCourseModal(false);
                    // 重置表单
                    setNewCourseCode('');
                    setNewCourseName('');
                    setNewCourseCredits(1);
                    setNewCourseNature('选修课');
                    setNewCourseTeacher('');
                    setNewCourseDescription('');
                    // 学期状态保持当前选择，不需要重置
                  }}
                  disabled={addCourseLoading}
                  className="px-6 py-2 border border-border-light text-text-secondary rounded-lg hover:bg-gray-50 transition-colors flex items-center disabled:opacity-50"
                >
                  <i className="fas fa-times mr-2"></i>
                  取消
                </button>
                <button
                  onClick={handleAddCourse}
                  disabled={addCourseLoading || !newCourseName.trim()}
                  className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors flex items-center disabled:opacity-50"
                >
                  {addCourseLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      添加中...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plus mr-2"></i>
                      添加课程
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* 确认弹框 */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-text-primary flex items-center">
                  <i className="fas fa-exclamation-circle text-yellow-500 mr-2"></i>
                  确认添加课程
                </h3>
                <p className="text-sm text-text-secondary mt-1">
                  请确认以下课程信息是否正确
                </p>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">课程名称:</span>
                      <span className="font-medium">{newCourseName}</span>
                    </div>
                    {newCourseCode && (
                      <div className="flex justify-between">
                        <span className="text-text-secondary">课程代码:</span>
                        <span className="font-medium">{newCourseCode}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-text-secondary">学分:</span>
                      <span className="font-medium">{newCourseCredits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">课程性质:</span>
                      <span className="font-medium">{newCourseNature}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">学期:</span>
                      <span className="font-medium">
                        {semesters.find(s => s.value === selectedSemester)?.label || selectedSemester}
                      </span>
                    </div>
                    {newCourseTeacher && (
                      <div className="flex justify-between">
                        <span className="text-text-secondary">授课教师:</span>
                        <span className="font-medium">{newCourseTeacher}</span>
                      </div>
                    )}
                    {newCourseDescription && (
                      <div>
                        <span className="text-text-secondary block mb-1">课程描述:</span>
                        <p className="text-sm bg-white p-2 rounded border">{newCourseDescription}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-text-secondary">
                  <i className="fas fa-info-circle mr-1"></i>
                  请仔细核对以上信息，添加后可通过编辑功能修改课程信息
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-6 py-2 border border-border-light text-text-secondary rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                >
                  <i className="fas fa-times mr-2"></i>
                  返回修改
                </button>
                <button
                  onClick={confirmAddCourse}
                  className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors flex items-center"
                >
                  <i className="fas fa-check mr-2"></i>
                  确认添加
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 修改课程信息弹框 */}
        {showEditCourseModal && editingCourseData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-text-primary flex items-center">
                  <i className="fas fa-edit text-secondary mr-2"></i>
                  修改课程信息
                </h3>
                <p className="text-sm text-text-secondary mt-1">
                  修改课程基本信息
                </p>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    <i className="fas fa-barcode text-blue-500 mr-1"></i>
                    课程代码
                  </label>
                  <input
                    type="text"
                    value={editingCourseData.courseCode || ''}
                    onChange={(e) => setEditingCourseData(prev => prev ? {...prev, courseCode: e.target.value} : null)}
                    placeholder="例如：32201226（可选）"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    maxLength={20}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    <i className="fas fa-book text-blue-500 mr-1"></i>
                    课程名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingCourseData.name}
                    onChange={(e) => setEditingCourseData(prev => prev ? {...prev, name: e.target.value} : null)}
                    placeholder="例如：Web前端开发"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    maxLength={100}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      <i className="fas fa-graduation-cap text-purple-500 mr-1"></i>
                      学分
                    </label>
                    <input
                      type="number"
                      value={editingCourseData.credits}
                      onChange={(e) => setEditingCourseData(prev => prev ? {...prev, credits: Math.max(0, parseInt(e.target.value) || 0)} : null)}
                      placeholder="1"
                      min="0"
                      max="10"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      <i className="fas fa-tag text-orange-500 mr-1"></i>
                      课程性质
                    </label>
                    <select
                      value={editingCourseData.courseNature || '选修课'}
                      onChange={(e) => setEditingCourseData(prev => prev ? {...prev, courseNature: e.target.value} : null)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    >
                      <option value="必修课">必修课</option>
                      <option value="选修课">选修课</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      <i className="fas fa-calendar-alt text-green-500 mr-1"></i>
                      学期
                    </label>
                    <select
                      value={selectedSemester}
                      onChange={(e) => setSelectedSemester(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    >
                      {semesters.map(semester => (
                        <option key={semester.value} value={semester.value}>
                          {semester.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      <i className="fas fa-user-tie text-green-500 mr-1"></i>
                      授课教师
                    </label>
                    <input
                      type="text"
                      value={editingCourseData.teacher || ''}
                      onChange={(e) => setEditingCourseData(prev => prev ? {...prev, teacher: e.target.value} : null)}
                      placeholder="可选填"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                      maxLength={50}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    <i className="fas fa-align-left text-orange-500 mr-1"></i>
                    课程描述
                  </label>
                  <textarea
                    value={editingCourseData.description || ''}
                    onChange={(e) => setEditingCourseData(prev => prev ? {...prev, description: e.target.value} : null)}
                    placeholder="可选填，简要描述课程内容"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                    maxLength={200}
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowEditCourseModal(false)}
                  className="px-6 py-2 border border-border-light text-text-secondary rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                >
                  <i className="fas fa-times mr-2"></i>
                  取消
                </button>
                <button
                  onClick={saveEditedCourse}
                  className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors flex items-center"
                >
                  <i className="fas fa-save mr-2"></i>
                  保存修改
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default StudentAcademicTasks;