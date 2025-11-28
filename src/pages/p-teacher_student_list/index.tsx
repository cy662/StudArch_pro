import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { UserService } from '../../services/userService';
import { TrainingProgramService } from '../../services/trainingProgramService';
import { UserWithRole } from '../../types/user';
import { TrainingProgramCourse, TrainingProgramImportResult } from '../../types/trainingProgram';

const TeacherStudentList: React.FC = () => {
  const navigate = useNavigate();
  
  // 教师管理的学生数据
  const [studentsData, setStudentsData] = useState<UserWithRole[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsTotal, setStudentsTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<UserWithRole | null>(null);
  
  // 导入相关状态
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [availableStudents, setAvailableStudents] = useState<UserWithRole[]>([]);
  const [selectedAvailableStudents, setSelectedAvailableStudents] = useState<Set<string>>(new Set());
  const [importLoading, setImportLoading] = useState(false);
  const [importSearchTerm, setImportSearchTerm] = useState('');
  const [importPage, setImportPage] = useState(1);
  const [importTotalCount, setImportTotalCount] = useState(0);

  // 培养方案导入相关状态
  const [isTrainingProgramModalOpen, setIsTrainingProgramModalOpen] = useState(false);
  const [trainingProgramFile, setTrainingProgramFile] = useState<File | null>(null);
  const [trainingProgramCourses, setTrainingProgramCourses] = useState<TrainingProgramCourse[]>([]);
  const [trainingProgramImporting, setTrainingProgramImporting] = useState(false);
  const [trainingProgramImportResult, setTrainingProgramImportResult] = useState<TrainingProgramImportResult | null>(null);

  // 培养方案分配相关状态
  const [isAssignProgramModalOpen, setIsAssignProgramModalOpen] = useState(false);
  const [availablePrograms, setAvailablePrograms] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [assigningProgram, setAssigningProgram] = useState(false);
  const [programsLoading, setProgramsLoading] = useState(false);

  // 将档案ID映射回用户ID（因为前端显示使用档案ID，但后端API需要用户ID）
  const mapProfileIdsToUserIds = async (profileIds: string[]): Promise<string[]> => {
    try {
      if (!profileIds || profileIds.length === 0) {
        return [];
      }

      // 使用现有的UserService来获取映射
      const result = await UserService.getProfileUserMapping(profileIds);
      
      if (!result.success || !result.data) {
        console.error('查询档案映射失败:', result.message);
        return profileIds; // 返回原始ID作为后备
      }

      const idMap: Record<string, string> = {};
      result.data.forEach((profile: any) => {
        idMap[profile.id] = profile.user_id;
      });

      return profileIds.map(profileId => idMap[profileId] || profileId);
    } catch (error) {
      console.error('映射档案ID到用户ID失败:', error);
      return profileIds; // 返回原始ID作为后备
    }
  };

  // 获取教师管理的学生列表
  const fetchTeacherStudents = async () => {
    try {
      setStudentsLoading(true);
      // 这里应该从认证状态中获取当前教师的ID，暂时使用固定的UUID
      const currentTeacherId = '00000000-0000-0000-0000-000000000001';
      
      const result = await UserService.getTeacherStudents(currentTeacherId, {
        keyword: searchTerm,
        page: currentPage,
        limit: pageSize
      });
      
      setStudentsData(result.students);
      setStudentsTotal(result.total);
    } catch (error) {
      console.error('获取教师学生列表失败:', error);
      setStudentsData([]);
      setStudentsTotal(0);
    } finally {
      setStudentsLoading(false);
    }
  };

  // 获取可导入的学生列表（未导入的学生）
  const fetchAvailableStudents = async () => {
    try {
      setImportLoading(true);
      // 假设当前教师的ID是固定的，实际应用中应该从认证状态中获取
      const teacherId = '00000000-0000-0000-0000-000000000001';
      
      const result = await UserService.getAvailableStudentsForImport(teacherId, {
        keyword: importSearchTerm,
        page: importPage,
        limit: 20
      });
      setAvailableStudents(result.students);
      setImportTotalCount(result.total);
    } catch (error) {
      console.error('获取可导入学生失败:', error);
      // 如果数据库函数调用失败，使用备用方案获取所有学生
      try {
        const teacherId = '00000000-0000-0000-0000-000000000001'; // 重新定义teacherId
        const allStudents = await UserService.getUsers({
          role_id: '3', // 学生角色
          keyword: importSearchTerm,
          page: importPage,
          limit: 20
        });
        
        // 过滤掉已经关联的学生
        const teacherStudents = await UserService.getTeacherStudents(teacherId);
        const importedStudentIds = new Set(teacherStudents.students.map(s => s.id));
        const availableStudents = allStudents.users.filter(student => !importedStudentIds.has(student.id));
        
        setAvailableStudents(availableStudents);
        setImportTotalCount(allStudents.total);
      } catch (fallbackError) {
        console.error('备用方案也失败了:', fallbackError);
        setAvailableStudents([]);
        setImportTotalCount(0);
      }
    } finally {
      setImportLoading(false);
    }
  };

  // 当导入模态框打开时获取可用学生
  useEffect(() => {
    if (isImportModalOpen) {
      fetchAvailableStudents();
    }
  }, [isImportModalOpen, importSearchTerm, importPage]);

  // 页面加载时获取教师学生数据
  useEffect(() => {
    fetchTeacherStudents();
  }, [searchTerm, currentPage, pageSize]);

  // 当筛选条件改变时，重新获取数据
  useEffect(() => {
    fetchTeacherStudents();
  }, [searchTerm, classFilter, statusFilter]);

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '我的学生 - 学档通';
    return () => { document.title = originalTitle; };
  }, []);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = new Set(selectedStudents);
      studentsData.forEach(student => newSelected.add(student.id));
      setSelectedStudents(newSelected);
    } else {
      setSelectedStudents(new Set());
    }
  };

  const handleStudentSelect = (studentId: string, checked: boolean) => {
    const newSelected = new Set(selectedStudents);
    if (checked) {
      newSelected.add(studentId);
    } else {
      newSelected.delete(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const isAllSelected = (): boolean => {
    return studentsData.length > 0 && studentsData.every(student => selectedStudents.has(student.id));
  };

  const isIndeterminate = (): boolean => {
    const selectedCount = studentsData.filter(student => selectedStudents.has(student.id)).length;
    return selectedCount > 0 && selectedCount < studentsData.length;
  };

  const handlePageChange = (page: number) => {
    const totalPages = Math.ceil(studentsTotal / pageSize);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setIsStudentModalOpen(true);
  };

  const handleEditStudent = (student: UserWithRole) => {
    setEditingStudent(student);
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = (formData: Partial<UserWithRole>) => {
    if (editingStudent) {
      // 编辑学生
      setStudentsData(prev => prev.map(student => 
        student.id === editingStudent.id ? { ...student, ...formData } : student
      ));
    } else {
      // 新增学生
      const newStudent: UserWithRole = {
        id: Date.now().toString(),
        username: formData.username || '',
        email: formData.email || '',
        user_number: formData.user_number || '',
        full_name: formData.full_name || '',
        role_id: '3',
        status: 'active',
        phone: formData.phone,
        department: formData.department,
        grade: formData.grade,
        class_name: formData.class_name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        role: {
          id: '3',
          role_name: 'student',
          role_description: '学生',
          permissions: {},
          is_system_default: true,
          created_at: '2021-01-01',
          updated_at: '2021-01-01'
        }
      };
      setStudentsData(prev => [...prev, newStudent]);
    }

    setIsStudentModalOpen(false);
    setEditingStudent(null);
  };



  const handleBatchDelete = async () => {
    if (selectedStudents.size === 0) {
      alert('请选择要删除的学生');
      return;
    }

    const selectedCount = selectedStudents.size;
    const confirmMessage = `确定要删除选中的 ${selectedCount} 个学生吗？

此操作将从系统中完全删除这些学生的所有信息，包括：
• 学生基本信息
• 档案信息
• 毕业去向信息
• 关联数据

此操作不可恢复！`;

    if (!confirm(confirmMessage)) {
      return;
    }

    // 二次确认
    const finalConfirm = prompt('请输入 "DELETE" 来确认删除操作：');
    if (finalConfirm !== 'DELETE') {
      alert('确认输入不正确，操作已取消');
      return;
    }

    try {
      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      for (const studentId of selectedStudents) {
        try {
          // 首先从教师管理列表中移除
          const currentTeacherId = '00000000-0000-0000-0000-000000000001';
          await UserService.removeStudentFromTeacher(currentTeacherId, studentId);
          
          // 然后完全删除学生数据
          await UserService.deleteUser(studentId);
          successCount++;
        } catch (error) {
          failedCount++;
          const errorMsg = error instanceof Error ? error.message : '未知错误';
          errors.push(`学生ID ${studentId}: ${errorMsg}`);
          console.error(`删除学生 ${studentId} 失败:`, error);
        }
      }

      setSelectedStudents(new Set());
      fetchTeacherStudents(); // 重新获取数据

      // 显示详细的结果
      if (successCount > 0 && failedCount === 0) {
        alert(`✅ 成功删除 ${successCount} 个学生`);
      } else if (successCount > 0 && failedCount > 0) {
        const errorDetails = errors.slice(0, 3).join('\n');
        const moreErrors = errors.length > 3 ? `\n...还有 ${errors.length - 3} 个错误` : '';
        alert(`⚠️ 部分删除完成

✅ 成功删除: ${successCount} 个
❌ 删除失败: ${failedCount} 个

失败详情:
${errorDetails}${moreErrors}`);
      } else {
        alert(`❌ 删除失败，共 ${failedCount} 个学生删除失败\n\n${errors.slice(0, 2).join('\n')}`);
      }
    } catch (error) {
      console.error('批量删除学生失败:', error);
      alert('批量删除操作失败，请稍后重试');
    }
  };

  const handleBatchResetPassword = () => {
    // 批量重置密码功能已移除
  };

  const handleAvailableStudentSelect = (studentId: string, checked: boolean) => {
    const newSelected = new Set(selectedAvailableStudents);
    if (checked) {
      newSelected.add(studentId);
    } else {
      newSelected.delete(studentId);
    }
    setSelectedAvailableStudents(newSelected);
  };

  const handleSelectAllAvailable = (checked: boolean) => {
    if (checked) {
      const newSelected = new Set(selectedAvailableStudents);
      availableStudents.forEach(student => newSelected.add(student.id));
      setSelectedAvailableStudents(newSelected);
    } else {
      setSelectedAvailableStudents(new Set());
    }
  };

  const handleConfirmImport = async () => {
    if (selectedAvailableStudents.size === 0) {
      alert('请选择要导入的学生');
      return;
    }

    try {
      setImportLoading(true);
      // 假设当前教师的ID是固定的，实际应用中应该从认证状态中获取
      const teacherId = '00000000-0000-0000-0000-000000000001';
      
      console.log('开始导入学生:', Array.from(selectedAvailableStudents));
      const result = await UserService.teacherAddStudents(
        Array.from(selectedAvailableStudents),
        teacherId
      );
      
      if (result.success > 0) {
        alert(`成功导入 ${result.success} 个学生${result.failed > 0 ? `，失败 ${result.failed} 个` : ''}`);
        
        // 重新刷新当前学生列表
        fetchTeacherStudents();
        
        // 关闭模态框并重置状态
        setIsImportModalOpen(false);
        setSelectedAvailableStudents(new Set());
        setImportSearchTerm('');
        setImportPage(1);
      } else {
        alert(`导入失败：${result.error || '未知错误'}`);
      }
    } catch (error) {
      console.error('批量导入失败:', error);
      alert(`导入失败：${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setImportLoading(false);
    }
  };

  // 培养方案导入处理函数
  const handleDownloadTrainingProgramTemplate = async () => {
    try {
      await TrainingProgramService.generateAndDownloadTemplate();
    } catch (error) {
      console.error('下载模板失败:', error);
      alert('下载模板失败，请重试');
    }
  };

  // 获取可用的培养方案列表
  const fetchAvailablePrograms = async () => {
    try {
      setProgramsLoading(true);
      const response = await fetch('/api/training-programs');
      const result = await response.json();
      
      if (result.success) {
        setAvailablePrograms(result.data);
      } else {
        console.error('获取培养方案失败:', result.message);
        alert('获取培养方案失败');
      }
    } catch (error) {
      console.error('获取培养方案失败:', error);
      alert('获取培养方案失败，请检查API服务器');
    } finally {
      setProgramsLoading(false);
    }
  };

  // 批量分配培养方案给选中的学生
  const handleAssignTrainingProgram = async () => {
    if (selectedStudents.size === 0) {
      alert('请先选择要分配培养方案的学生');
      return;
    }

    if (!selectedProgram) {
      alert('请选择要分配的培养方案');
      return;
    }

    const confirmMessage = `确定要将培养方案分配给 ${selectedStudents.size} 名学生吗？`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setAssigningProgram(true);
      // 假设当前教师的ID是固定的，实际应用中应该从认证状态中获取
      const teacherId = '00000000-0000-0000-0000-000000000001';
      // 修复：selectedStudents中已经是档案ID，直接使用不需要映射
      const studentIds = Array.from(selectedStudents);

      const response = await fetch(`/api/teacher/${teacherId}/batch-assign-training-program`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          programId: selectedProgram,
          studentIds: studentIds,
          notes: '批量分配培养方案'
        }),
      });

      const result = await response.json();

      if (result.success) {
        const { success_count, failure_count, total_count } = result.data;
        
        if (failure_count === 0) {
          alert(`✅ 成功为 ${success_count} 名学生分配培养方案！\
\
💡 学生可以在"教学任务与安排"页面查看分配的课程。`);
        } else {
          const details = result.data.details || [];
          let detailsMessage = '';
          
          if (details.length > 0) {
            detailsMessage = '\
\
失败详情:\
' + details.slice(0, 3).map((d: any) => 
              `• 学生ID ${d.student_id}: ${d.error}`
            ).join('\
');
            
            if (details.length > 3) {
              detailsMessage += `\
...还有 ${details.length - 3} 个错误`;
            }
          }
          
          alert(`⚠️ 培养方案分配完成\
\
✅ 成功分配: ${success_count} 名学生\
❌ 分配失败: ${failure_count} 名学生${detailsMessage}`);
          console.log('分配详情:', result.data.details);
        }
        
        // 关闭模态框并重置状态
        setIsAssignProgramModalOpen(false);
        setSelectedProgram('');
        setSelectedStudents(new Set());
        
        // 刷新学生列表数据
        await fetchTeacherStudents();
        
        // 如果有成功的分配，显示额外提示
        if (success_count > 0) {
          setTimeout(() => {
            alert(`📚 培养方案分配成功！\
\
分配的 ${success_count} 名学生现在可以在他们的"教学任务与安排"页面中看到相关课程。\
\
请通知学生登录系统查看。`);
          }, 1000);
        }
      } else {
        alert(`❌ 分配失败: ${result.message}`);
      }
    } catch (error) {
      console.error('分配培养方案失败:', error);
      alert('分配培养方案失败，请检查网络连接');
    } finally {
      setAssigningProgram(false);
    }
  };

  // 打开分配培养方案模态框
  const handleOpenAssignProgramModal = () => {
    if (selectedStudents.size === 0) {
      alert('请先选择要分配培养方案的学生');
      return;
    }
    setIsAssignProgramModalOpen(true);
    fetchAvailablePrograms();
  };

  const handleTrainingProgramFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 验证文件类型
      const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
        'application/csv'
      ];
      
      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx?|csv)$/i)) {
        alert('请选择Excel文件(.xlsx, .xls)或CSV文件');
        return;
      }

      setTrainingProgramFile(file);
      setTrainingProgramImportResult(null);
      
      // 解析文件
      TrainingProgramService.parseExcelFile(file)
        .then(courses => {
          setTrainingProgramCourses(courses);
          alert(`成功解析 ${courses.length} 条课程记录`);
        })
        .catch(error => {
          console.error('文件解析失败:', error);
          alert(`文件解析失败: ${error instanceof Error ? error.message : '未知错误'}`);
          setTrainingProgramFile(null);
          setTrainingProgramCourses([]);
        });
    }
  };

  const handleTrainingProgramImport = async () => {
    if (trainingProgramCourses.length === 0) {
      alert('没有可导入的课程数据');
      return;
    }

    const confirmMessage = `确定要导入 ${trainingProgramCourses.length} 条课程记录吗？`;
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setTrainingProgramImporting(true);
      const result = await TrainingProgramService.importTrainingProgram(trainingProgramCourses);
      setTrainingProgramImportResult(result);
      
      if (result.success > 0) {
        alert(`✅ 成功导入 ${result.success} 条课程记录${result.failed > 0 ? `，失败 ${result.failed} 条` : ''}`);
        // 重置状态
        setTrainingProgramFile(null);
        setTrainingProgramCourses([]);
        setTrainingProgramImportResult(null);
      } else {
        alert('❌ 导入失败，请检查数据格式');
      }
    } catch (error) {
      console.error('导入失败:', error);
      alert(`导入失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setTrainingProgramImporting(false);
    }
  };

  const handleTrainingProgramModalClose = () => {
    setIsTrainingProgramModalOpen(false);
    setTrainingProgramFile(null);
    setTrainingProgramCourses([]);
    setTrainingProgramImportResult(null);
  };

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      navigate('/login');
    }
  };

  const renderPaginationNumbers = () => {
    const totalPages = Math.ceil(studentsTotal / pageSize);
    const pages = [];
    
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(
          <button
            key={i}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              i === currentPage 
                ? 'bg-secondary text-white' 
                : 'border border-border-light hover:bg-gray-50'
            }`}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </button>
        );
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push(
          <span key={`ellipsis-${i}`} className="px-2 text-text-secondary">
            ...
          </span>
        );
      }
    }
    
    return pages;
  };

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, studentsTotal);

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
              <img 
                src="https://s.coze.cn/image/hatzc53pi4k/" 
                alt="教师头像" 
                className="w-8 h-8 rounded-full" 
              />
              <div className="text-sm">
                <div className="font-medium text-text-primary">张老师</div>
                <div className="text-text-secondary">辅导员</div>
              </div>
              <i className="fas fa-chevron-down text-xs text-text-secondary"></i>
            </div>
            
            {/* 退出登录 */}
            <button 
              onClick={handleLogout}
              className="text-text-secondary hover:text-red-500 transition-colors"
            >
              <i className="fas fa-sign-out-alt text-lg"></i>
            </button>
          </div>
        </div>
      </header>

      {/* 左侧菜单 */}
      <aside className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-border-light z-40 ${styles.sidebarTransition}`}>
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
            className={`${styles.navItem} ${styles.navItemActive} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors`}
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
            to="/teacher-report" 
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
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
              <h2 className="text-2xl font-bold text-text-primary mb-2">我的学生</h2>
              <nav className="text-sm text-text-secondary">
                <span>首页</span>
                <i className="fas fa-chevron-right mx-2"></i>
                <span>我的学生</span>
              </nav>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => setIsImportModalOpen(true)}
                className="px-4 py-2 bg-white border border-border-light rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <i className="fas fa-upload text-secondary"></i>
                <span className="text-text-primary">批量导入</span>
              </button>
              <button 
                onClick={handleAddStudent}
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors flex items-center space-x-2"
              >
                <i className="fas fa-plus"></i>
                <span>新增学生</span>
              </button>
            </div>
          </div>
        </div>

        {/* 工具栏区域 */}
        <div className="bg-white rounded-xl shadow-card p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* 搜索框 */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"></i>
                <input 
                  type="text" 
                  placeholder="搜索学号或姓名" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 pr-4 py-2 border border-border-light rounded-lg w-64 ${styles.searchInput}`}
                />
              </div>
              
              {/* 筛选条件 */}
              <select 
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className={`px-4 py-2 border border-border-light rounded-lg ${styles.filterSelect}`}
              >
                <option value="">全部班级</option>
                <option value="cs1">计算机科学与技术1班</option>
                <option value="cs2">计算机科学与技术2班</option>
                <option value="cs3">计算机科学与技术3班</option>
                <option value="se1">软件工程1班</option>
                <option value="se2">软件工程2班</option>
              </select>
              
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`px-4 py-2 border border-border-light rounded-lg ${styles.filterSelect}`}
              >
                <option value="">全部状态</option>
                <option value="enrolled">在读</option>
                <option value="suspended">休学</option>
                <option value="withdrawn">退学</option>
                <option value="graduated">毕业</option>
                <option value="completed">结业</option>
              </select>
            </div>
            
            {/* 批量操作 */}
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setIsTrainingProgramModalOpen(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                title="导入培养方案"
              >
                <i className="fas fa-file-excel"></i>
                <span>导入培养方案</span>
              </button>
              
              <button 
                onClick={handleOpenAssignProgramModal}
                disabled={selectedStudents.size === 0}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                  selectedStudents.size > 0 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                title={selectedStudents.size > 0 ? `为${selectedStudents.size}名学生分配培养方案` : '请先选择学生'}
              >
                <i className="fas fa-graduation-cap"></i>
                <span>分配培养方案</span>
                {selectedStudents.size > 0 && (
                  <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
                    {selectedStudents.size}
                  </span>
                )}
              </button>
              <button 
                onClick={handleBatchDelete}
                disabled={selectedStudents.size === 0}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:bg-gray-300"
                title="删除选中的学生及其所有相关数据（不可恢复）"
              >
                <i className="fas fa-exclamation-triangle"></i>
                <span>批量删除学生</span>
              </button>
            </div>
          </div>
        </div>

        {/* 学生列表 */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    <input 
                      type="checkbox" 
                      checked={isAllSelected()}
                      ref={(input) => {
                        if (input) input.indeterminate = isIndeterminate();
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-border-light"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">学号</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">姓名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">班级</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">学籍状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">联系方式</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border-light">
                {studentsLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <i className="fas fa-spinner fa-spin text-2xl text-secondary mb-4"></i>
                      <p className="text-text-secondary">加载中...</p>
                    </td>
                  </tr>
                ) : studentsData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <i className="fas fa-users text-4xl text-gray-300 mb-4"></i>
                      <p className="text-text-secondary mb-4">暂无管理的学生</p>
                      <button 
                        onClick={() => setIsImportModalOpen(true)}
                        className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors"
                      >
                        批量导入学生
                      </button>
                    </td>
                  </tr>
                ) : studentsData.map(student => (
                  <tr key={student.id} className={styles.tableRow}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        checked={selectedStudents.has(student.id)}
                        onChange={(e) => handleStudentSelect(student.id, e.target.checked)}
                        className="rounded border-border-light"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{student.user_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img 
                          className="h-8 w-8 rounded-full mr-3" 
                          src="https://s.coze.cn/image/zycTkZ9PWs0/" 
                          alt={`${student.full_name}头像`}
                        />
                        <Link 
                          to={`/teacher-student-detail?studentId=${student.id}`}
                          className="text-secondary hover:text-accent font-medium"
                        >
                          {student.full_name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{student.class_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        {student.status === 'active' ? '在读' : '其他'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{student.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <Link 
                        to={`/teacher-student-detail?studentId=${student.id}`}
                        className="text-secondary hover:text-accent transition-colors" 
                        title="查看档案"
                      >
                        <i className="fas fa-eye"></i>
                      </Link>
                      <Link 
                        to={`/teacher-student-detail?studentId=${student.id}#rewards`}
                        className="text-orange-500 hover:text-orange-700 transition-colors" 
                        title="奖惩记录"
                      >
                        <i className="fas fa-trophy"></i>
                      </Link>
                      <button 
                        onClick={() => handleEditStudent(student)}
                        className="text-text-secondary hover:text-secondary transition-colors" 
                        title="编辑信息"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* 分页 */}
          <div className="px-6 py-4 border-t border-border-light flex items-center justify-between">
            <div className="text-sm text-text-secondary">
              显示 <span>{studentsData.length > 0 ? startIndex : 0}</span>-<span>{Math.min(currentPage * pageSize, studentsTotal)}</span> 条，共 <span>{studentsTotal}</span> 条记录
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-border-light rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <div className="flex space-x-1">
                {renderPaginationNumbers()}
              </div>
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= Math.ceil(studentsTotal / pageSize)}
                className="px-3 py-1 text-sm border border-border-light rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 新增/编辑学生模态弹窗 */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-border-light">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-text-primary">
                    {editingStudent ? '编辑学生' : '新增学生'}
                  </h3>
                  <button 
                    onClick={() => {
                      setIsStudentModalOpen(false);
                      setEditingStudent(null);
                    }}
                    className="text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>
              <StudentForm 
                student={editingStudent}
                onSave={handleSaveStudent}
                onCancel={() => {
                  setIsStudentModalOpen(false);
                  setEditingStudent(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 批量导入模态弹窗 */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-border-light">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">批量导入学生</h3>
                    <p className="text-sm text-text-secondary mt-1">以下列表仅显示尚未导入到您管理名单中的学生</p>
                  </div>
                  <button 
                    onClick={() => {
                      setIsImportModalOpen(false);
                      setSelectedAvailableStudents(new Set());
                      setImportSearchTerm('');
                      setImportPage(1);
                    }}
                    className="text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>
              
              <div className="p-6 flex-1 overflow-hidden flex flex-col">
                {/* 搜索和筛选 */}
                <div className="mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative flex-1">
                      <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"></i>
                      <input 
                        type="text" 
                        placeholder="搜索学号、姓名或邮箱" 
                        value={importSearchTerm}
                        onChange={(e) => setImportSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-border-light rounded-lg w-full"
                      />
                    </div>
                    <button 
                      onClick={fetchAvailableStudents}
                      disabled={importLoading}
                      className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
                    >
                      {importLoading ? '搜索中...' : '搜索'}
                    </button>
                  </div>
                </div>

                {/* 选中数量显示 */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm text-text-secondary">
                    已选择 <span className="font-semibold text-secondary">{selectedAvailableStudents.size}</span> 个学生
                  </div>
                  <div className="text-sm text-text-secondary">
                    共找到 <span className="font-semibold text-green-600">{importTotalCount}</span> 个可导入学生
                  </div>
                </div>

                {/* 学生列表 */}
                <div className="flex-1 overflow-y-auto border border-border-light rounded-lg">
                  {importLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <i className="fas fa-spinner fa-spin text-3xl text-secondary mb-4"></i>
                        <p className="text-text-secondary">加载中...</p>
                      </div>
                    </div>
                  ) : availableStudents.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <i className="fas fa-check-circle text-5xl text-green-500 mb-4"></i>
                        <p className="text-text-secondary mb-2">暂无可导入的学生</p>
                        <p className="text-sm text-text-secondary">所有学生都已在您的管理名单中</p>
                      </div>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                            <input 
                              type="checkbox" 
                              checked={availableStudents.length > 0 && availableStudents.every(s => selectedAvailableStudents.has(s.id))}
                              onChange={(e) => handleSelectAllAvailable(e.target.checked)}
                              className="rounded border-border-light"
                            />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">学号</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">姓名</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">邮箱</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">院系</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">年级</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">班级</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-border-light">
                        {availableStudents.map(student => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input 
                                type="checkbox" 
                                checked={selectedAvailableStudents.has(student.id)}
                                onChange={(e) => handleAvailableStudentSelect(student.id, e.target.checked)}
                                className="rounded border-border-light"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{student.user_number}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{student.full_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{student.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{student.department}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{student.grade}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{student.class_name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* 分页 */}
                {availableStudents.length > 0 && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-text-secondary">
                      显示第 {Math.min((importPage - 1) * 20 + 1, importTotalCount)} - {Math.min(importPage * 20, importTotalCount)} 条，共 {importTotalCount} 条
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setImportPage(prev => Math.max(1, prev - 1))}
                        disabled={importPage === 1}
                        className="px-3 py-1 text-sm border border-border-light rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <i className="fas fa-chevron-left"></i>
                      </button>
                      <span className="px-3 py-1 text-sm text-text-primary">
                        第 {importPage} 页
                      </span>
                      <button 
                        onClick={() => setImportPage(prev => Math.min(Math.ceil(importTotalCount / 20), prev + 1))}
                        disabled={importPage >= Math.ceil(importTotalCount / 20)}
                        className="px-3 py-1 text-sm border border-border-light rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-border-light flex justify-end space-x-3">
                <button 
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setSelectedAvailableStudents(new Set());
                    setImportSearchTerm('');
                    setImportPage(1);
                  }}
                  className="px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={handleConfirmImport}
                  disabled={selectedAvailableStudents.size === 0 || importLoading}
                  className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
                >
                  {importLoading ? '导入中...' : `确认导入 (${selectedAvailableStudents.size})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 导入培养方案模态弹窗 */}
      {isTrainingProgramModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-border-light">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">导入培养方案</h3>
                    <p className="text-sm text-text-secondary mt-1">支持Excel(.xlsx, .xls)和CSV格式文件</p>
                  </div>
                  <button 
                    onClick={handleTrainingProgramModalClose}
                    className="text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>
              
              <div className="p-6 flex-1 overflow-hidden flex flex-col">
                {/* 下载模板区域 */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">第一步：下载模板</h4>
                      <p className="text-sm text-blue-700">请先下载官方模板，按照模板格式填写数据</p>
                    </div>
                    <button 
                      onClick={handleDownloadTrainingProgramTemplate}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <i className="fas fa-download"></i>
                      <span>下载模板</span>
                    </button>
                  </div>
                </div>

                {/* 文件上传区域 */}
                <div className="mb-6">
                  <h4 className="font-medium text-text-primary mb-3">第二步：上传文件</h4>
                  <div className="border-2 border-dashed border-border-light rounded-lg p-6 text-center hover:border-secondary transition-colors">
                    <input 
                      type="file"
                      id="training-program-file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleTrainingProgramFileSelect}
                      className="hidden"
                    />
                    <label 
                      htmlFor="training-program-file"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <i className="fas fa-cloud-upload-alt text-4xl text-text-secondary mb-3"></i>
                      <span className="text-text-primary font-medium">点击选择文件或拖拽到此处</span>
                      <span className="text-sm text-text-secondary mt-1">支持 .xlsx, .xls, .csv 格式</span>
                    </label>
                  </div>
                </div>

                {/* 文件信息显示 */}
                {trainingProgramFile && (
                  <div className="mb-6 p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <i className="fas fa-file-excel text-green-600 text-xl"></i>
                        <div>
                          <p className="font-medium text-green-900">{trainingProgramFile.name}</p>
                          <p className="text-sm text-green-700">
                            {trainingProgramCourses.length} 条课程记录
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setTrainingProgramFile(null);
                          setTrainingProgramCourses([]);
                          setTrainingProgramImportResult(null);
                        }}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <i className="fas fa-times-circle text-xl"></i>
                      </button>
                    </div>
                  </div>
                )}

                {/* 数据预览区域 */}
                {trainingProgramCourses.length > 0 && (
                  <div className="flex-1 overflow-hidden flex flex-col">
                    <h4 className="font-medium text-text-primary mb-3">数据预览</h4>
                    <div className="flex-1 overflow-auto border border-border-light rounded-lg">
                      <table className="w-full">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase">课程号</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase">课程名称</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase">学分</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase">建议修读年级</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase">学期</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase">考试方式</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase">课程性质</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-border-light">
                          {trainingProgramCourses.slice(0, 10).map((course, index) => (
                            <tr key={course.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm text-text-primary">{course.course_number}</td>
                              <td className="px-4 py-2 text-sm text-text-primary">{course.course_name}</td>
                              <td className="px-4 py-2 text-sm text-text-primary">{course.credits}</td>
                              <td className="px-4 py-2 text-sm text-text-primary">{course.recommended_grade}</td>
                              <td className="px-4 py-2 text-sm text-text-primary">{course.semester}</td>
                              <td className="px-4 py-2 text-sm text-text-primary">{course.exam_method}</td>
                              <td className="px-4 py-2 text-sm text-text-primary">{course.course_nature}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {trainingProgramCourses.length > 10 && (
                        <div className="p-3 text-center text-sm text-text-secondary bg-gray-50">
                          显示前 10 条，共 {trainingProgramCourses.length} 条记录
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 导入结果显示 */}
                {trainingProgramImportResult && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">导入结果</h4>
                    <div className="text-sm text-green-700">
                      <p>✅ 成功导入: {trainingProgramImportResult.success} 条</p>
                      {trainingProgramImportResult.failed > 0 && (
                        <p>❌ 导入失败: {trainingProgramImportResult.failed} 条</p>
                      )}
                      <p>📊 总计: {trainingProgramImportResult.total} 条</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-border-light flex justify-end space-x-3">
                <button 
                  onClick={handleTrainingProgramModalClose}
                  className="px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={handleTrainingProgramImport}
                  disabled={trainingProgramCourses.length === 0 || trainingProgramImporting}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:bg-gray-300"
                >
                  {trainingProgramImporting ? '导入中...' : `确认导入 (${trainingProgramCourses.length})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 分配培养方案模态弹窗 */}
      {isAssignProgramModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-border-light">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">分配培养方案</h3>
                    <p className="text-sm text-text-secondary mt-1">
                      为选中的 {selectedStudents.size} 名学生分配培养方案
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setIsAssignProgramModalOpen(false);
                      setSelectedProgram('');
                    }}
                    className="text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>
              
              <div className="p-6 flex-1 overflow-hidden flex flex-col">
                {/* 选中学生显示 */}
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">已选择的学生</h4>
                  <div className="text-sm text-blue-700">
                    共选择了 <span className="font-semibold">{selectedStudents.size}</span> 名学生
                  </div>
                </div>

                {/* 培养方案选择 */}
                <div className="mb-4">
                  <h4 className="font-medium text-text-primary mb-2">选择培养方案</h4>
                  <div className="relative">
                    <select 
                      value={selectedProgram}
                      onChange={(e) => setSelectedProgram(e.target.value)}
                      className="w-full px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:border-secondary"
                      disabled={programsLoading}
                    >
                      <option value="">请选择培养方案</option>
                      {programsLoading ? (
                        <option value="">加载中...</option>
                      ) : availablePrograms.length === 0 ? (
                        <option value="">暂无可用培养方案</option>
                      ) : (
                        availablePrograms.map(program => (
                          <option key={program.id} value={program.id}>
                            {program.program_name} ({program.program_code})
                          </option>
                        ))
                      )}
                    </select>
                    {programsLoading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <i className="fas fa-spinner fa-spin text-secondary"></i>
                      </div>
                    )}
                  </div>
                </div>

                {/* 培养方案详情显示 */}
                {selectedProgram && availablePrograms.length > 0 && (
                  <div className="flex-1 overflow-hidden flex flex-col">
                    <h4 className="font-medium text-text-primary mb-2">培养方案详情</h4>
                    {(() => {
                      const selected = availablePrograms.find(p => p.id === selectedProgram);
                      return selected ? (
                        <div className="flex-1 overflow-auto p-4 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-text-primary">方案名称：</span>
                              <span className="text-text-secondary ml-2">{selected.program_name}</span>
                            </div>
                            <div>
                              <span className="font-medium text-text-primary">方案代码：</span>
                              <span className="text-text-secondary ml-2">{selected.program_code}</span>
                            </div>
                            <div>
                              <span className="font-medium text-text-primary">专业：</span>
                              <span className="text-text-secondary ml-2">{selected.major}</span>
                            </div>
                            <div>
                              <span className="font-medium text-text-primary">院系：</span>
                              <span className="text-text-secondary ml-2">{selected.department}</span>
                            </div>
                            <div>
                              <span className="font-medium text-text-primary">总学分：</span>
                              <span className="text-text-secondary ml-2">{selected.total_credits}学分</span>
                            </div>
                            <div>
                              <span className="font-medium text-text-primary">学制：</span>
                              <span className="text-text-secondary ml-2">{selected.duration_years}年</span>
                            </div>
                          </div>
                          {selected.description && (
                            <div className="mt-4">
                              <span className="font-medium text-text-primary">描述：</span>
                              <p className="text-text-secondary mt-1 text-sm">{selected.description}</p>
                            </div>
                          )}
                          <div className="mt-4">
                            <span className="font-medium text-text-primary">课程数量：</span>
                            <span className="text-text-secondary ml-2">{selected.course_count || 0}门课程</span>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-border-light flex justify-end space-x-3">
                <button 
                  onClick={() => {
                    setIsAssignProgramModalOpen(false);
                    setSelectedProgram('');
                  }}
                  className="px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={assigningProgram}
                >
                  取消
                </button>
                <button 
                  onClick={handleAssignTrainingProgram}
                  disabled={!selectedProgram || assigningProgram}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:bg-gray-300"
                >
                  {assigningProgram ? '分配中...' : `确认分配 (${selectedStudents.size}名学生)`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 学生表单组件
interface StudentFormProps {
  student: UserWithRole | null;
  onSave: (data: Partial<UserWithRole>) => void;
  onCancel: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ student, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    username: student?.username || '',
    email: student?.email || '',
    user_number: student?.user_number || '',
    full_name: student?.full_name || '',
    phone: student?.phone || '',
    department: student?.department || '',
    grade: student?.grade || '',
    class_name: student?.class_name || '',
    status: student?.status || 'active'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="student-number" className="block text-sm font-medium text-text-primary mb-2">学号 *</label>
          <input 
            type="text" 
            id="student-number" 
            value={formData.user_number}
            onChange={(e) => setFormData(prev => ({ ...prev, user_number: e.target.value }))}
            required
            className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:border-secondary"
          />
        </div>
        <div>
          <label htmlFor="student-name" className="block text-sm font-medium text-text-primary mb-2">姓名 *</label>
          <input 
            type="text" 
            id="student-name" 
            value={formData.full_name}
            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
            required
            className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:border-secondary"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="student-email" className="block text-sm font-medium text-text-primary mb-2">邮箱 *</label>
          <input 
            type="email" 
            id="student-email" 
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
            className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:border-secondary"
          />
        </div>
        <div>
          <label htmlFor="student-department" className="block text-sm font-medium text-text-primary mb-2">院系</label>
          <input 
            type="text" 
            id="student-department" 
            value={formData.department}
            onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
            className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:border-secondary"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="student-grade" className="block text-sm font-medium text-text-primary mb-2">年级</label>
          <input 
            type="text" 
            id="student-grade" 
            value={formData.grade}
            onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
            className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:border-secondary"
          />
        </div>
        <div>
          <label htmlFor="student-class" className="block text-sm font-medium text-text-primary mb-2">班级</label>
          <input 
            type="text" 
            id="student-class" 
            value={formData.class_name}
            onChange={(e) => setFormData(prev => ({ ...prev, class_name: e.target.value }))}
            className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:border-secondary"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="student-phone" className="block text-sm font-medium text-text-primary mb-2">联系方式</label>
          <input 
            type="tel" 
            id="student-phone" 
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:border-secondary"
          />
        </div>
        <div>
          <label htmlFor="student-status" className="block text-sm font-medium text-text-primary mb-2">状态</label>
          <select 
            id="student-status" 
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as UserWithRole['status'] }))}
            className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:border-secondary"
          >
            <option value="active">在读</option>
            <option value="inactive">离校</option>
          </select>
        </div>
      </div>
      <div className="p-6 border-t border-border-light flex justify-end space-x-3">
        <button 
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50 transition-colors"
        >
          取消
        </button>
        <button 
          type="submit"
          className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors"
        >
          保存
        </button>
      </div>
    </form>
  );
};

export default TeacherStudentList;



