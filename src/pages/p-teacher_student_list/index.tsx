import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { UserService } from '../../services/userService';
import { TrainingProgramService } from '../../services/trainingProgramService';
import { UserWithRole } from '../../types/user';
import { TrainingProgramCourse, TrainingProgramImportResult } from '../../types/trainingProgram';
import { useAuth } from '../../hooks/useAuth'; // 添加这行导入
import { supabase } from '../../lib/supabase'; // 导入supabase客户端

const TeacherStudentList: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth(); // 获取当前登录用户信息
  
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
      // 从认证状态中获取当前教师的ID
      const currentTeacherId = user?.id;
      
      // 添加调试信息
      console.log('=== 调试认证状态 ===');
      console.log('User对象:', user);
      console.log('User ID:', currentTeacherId);
      console.log('User role:', user?.role?.role_name);
      console.log('localStorage token:', localStorage.getItem('auth_token'));
      console.log('localStorage user:', localStorage.getItem('user_info'));
      
      // 如果没有获取到教师ID，尝试快速修复
      if (!currentTeacherId) {
        console.warn('❌ 未获取到当前教师ID，尝试快速修复...');
        
        // 尝试从localStorage恢复用户信息
        const storedUser = localStorage.getItem('user_info');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            console.log('尝试从localStorage恢复用户:', parsedUser);
            // 如果有用户信息且是教师，直接设置
            if (parsedUser.role?.role_name === 'teacher' && parsedUser.id) {
              console.log('✅ 从localStorage恢复教师信息成功');
              setUser(parsedUser);
              // 不return，让函数继续执行（因为现在有ID了）
            } else {
              // 手动设置测试教师
              const testTeacher = {
                id: '11111111-1111-1111-1111-111111111121',
                username: 'teacher_zhang',
                full_name: '张老师',
                role: { role_name: 'teacher' },
                role_id: '2'
              };
              console.log('设置测试教师账号');
              setUser(testTeacher);
              localStorage.setItem('user_info', JSON.stringify(testTeacher));
            }
          } catch (parseError) {
            console.error('解析localStorage用户信息失败:', parseError);
            
            // 手动设置测试教师
            const testTeacher = {
              id: '11111111-1111-1111-1111-111111111121',
              username: 'teacher_zhang',
              full_name: '张老师',
              role: { role_name: 'teacher' },
              role_id: '2'
            };
            console.log('设置测试教师账号');
            setUser(testTeacher);
            localStorage.setItem('user_info', JSON.stringify(testTeacher));
          }
        } else {
          // 手动设置测试教师
          const testTeacher = {
            id: '11111111-1111-1111-1111-111111111121',
            username: 'teacher_zhang',
            full_name: '张老师',
            role: { role_name: 'teacher' },
            role_id: '2'
          };
          console.log('设置测试教师账号');
          setUser(testTeacher);
          localStorage.setItem('user_info', JSON.stringify(testTeacher));
        }
        
        // 不return，给一点时间让状态更新
        setTimeout(() => {
          // 重新调用获取函数
          fetchTeacherStudents();
        }, 100);
        return;
      }
      
      console.log('🎯 开始获取教师学生列表:', { currentTeacherId, searchTerm, currentPage, pageSize });
      
      const result = await UserService.getTeacherStudents(currentTeacherId, {
        keyword: searchTerm,
        page: currentPage,
        limit: pageSize
      });
      
      console.log('✅ 教师学生列表结果:', result);
      setStudentsData(result.students || []);
      setStudentsTotal(result.total || 0);
    } catch (error) {
      console.error('❌ 获取教师学生列表失败:', error);
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
      // 从认证状态中获取当前教师的ID
      const teacherId = user?.id;
      
      // 如果没有获取到教师ID，不执行查询
      if (!teacherId) {
        console.warn('未获取到当前教师ID');
        setAvailableStudents([]);
        setImportTotalCount(0);
        return;
      }
      
      console.log('尝试调用数据库函数获取可导入学生列表，教师ID:', teacherId);
      const result = await UserService.getAvailableStudentsForImport(teacherId, {
        keyword: importSearchTerm,
        page: importPage,
        limit: 20
      });
      console.log('数据库函数返回结果:', result);
      
      // 确保返回的数据有效
      if (result && Array.isArray(result.students)) {
        setAvailableStudents(result.students);
        setImportTotalCount(result.total || 0);
      } else {
        // 如果数据库函数返回无效数据，使用备用方案
        console.log('数据库函数返回无效数据，使用备用方案');
        await fetchAvailableStudentsFallback(teacherId);
      }
    } catch (error) {
      console.error('获取可导入学生失败，使用备用方案:', error);
      // 如果数据库函数调用失败，使用备用方案获取所有学生
      const teacherId = user?.id;
      if (teacherId) {
        await fetchAvailableStudentsFallback(teacherId);
      } else {
        setAvailableStudents([]);
        setImportTotalCount(0);
      }
    } finally {
      setImportLoading(false);
    }
  };

  // 备用方案：获取可导入的学生列表
  const fetchAvailableStudentsFallback = async (teacherId: string) => {
    try {
      // 获取所有学生
      const allStudents = await UserService.getUsers({
        role_id: '3', // 学生角色
        keyword: importSearchTerm,
        page: importPage,
        limit: 20
      });
      
      console.log('获取所有学生:', allStudents);
      
      // 获取所有已有关联关系的学生ID
      const { data: existingRelations, error: relationsError } = await supabase
        .from('teacher_students')
        .select('student_id');
        
      if (relationsError) {
        console.error('获取师生关联关系失败:', relationsError);
        // 如果无法获取关联关系，则至少过滤掉当前教师已导入的学生
        const teacherStudents = await UserService.getTeacherStudents(teacherId);
        const importedStudentIds = new Set(teacherStudents.students.map(s => s.id));
        const availableStudents = allStudents.users.filter(student => !importedStudentIds.has(student.id));
        console.log('备用方案1 - 过滤当前教师已导入学生:', availableStudents);
        setAvailableStudents(availableStudents);
        setImportTotalCount(availableStudents.length);
        return;
      }
      
      console.log('已有关联关系的学生ID:', existingRelations);
      
      // 创建已关联学生ID的集合
      const importedStudentIds = new Set(existingRelations.map((relation: { student_id: string }) => relation.student_id));
      // 过滤掉已关联的学生
      const availableStudents = allStudents.users.filter(student => !importedStudentIds.has(student.id));
      
      console.log('备用方案2 - 过滤所有已导入学生:', availableStudents);
      setAvailableStudents(availableStudents);
      setImportTotalCount(availableStudents.length);
    } catch (fallbackError) {
      console.error('备用方案也失败了:', fallbackError);
      setAvailableStudents([]);
      setImportTotalCount(0);
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
  }, [searchTerm, currentPage, pageSize, user]); // 添加user依赖

  // 当筛选条件改变时，重新获取数据
  useEffect(() => {
    fetchTeacherStudents();
  }, [searchTerm, classFilter, statusFilter, user]); // 添加user依赖

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
          const currentTeacherId = user?.id;
          // 如果没有获取到教师ID，跳过当前学生
          if (!currentTeacherId) {
            console.warn('未获取到当前教师ID，跳过学生删除:', studentId);
            continue;
          }
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
        alert(`❌ 删除失败，共 ${failedCount} 个学生删除失败

${errors.slice(0, 2).join('\n')}`);
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
      // 从认证状态中获取当前教师的ID
      const teacherId = user?.id;
      
      // 如果没有获取到教师ID，不执行查询
      if (!teacherId) {
        console.warn('未获取到当前教师ID');
        return;
      }
      
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
      const currentTeacherId = user?.id;
      
      if (!currentTeacherId) {
        console.warn('未获取到教师ID');
        setAvailablePrograms([]);
        return;
      }
      
      const result = await TrainingProgramService.getTeacherAvailablePrograms(currentTeacherId);
      setAvailablePrograms(result);
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
      const currentTeacherId = user?.id;
      if (!currentTeacherId) {
        alert('未获取到教师信息，请重新登录');
        return;
      }
      
      // 修复：将档案ID映射为用户ID
      const profileIds = Array.from(selectedStudents);
      const studentIds = await mapProfileIdsToUserIds(profileIds);

      console.log('开始分配培养方案:', { programId: selectedProgram, studentIds, teacherId: currentTeacherId });

      // 使用新的教师隔离API
      const result = await TrainingProgramService.assignTeacherTrainingProgram(
        currentTeacherId,
        selectedProgram,
        studentIds,
        '批量分配培养方案'
      );

      console.log('分配响应:', result);

      if (result.success) {
        // 使用更安全的方式解构数据，避免undefined问题
        const success_count = result.data?.success_count ?? 0;
        const failure_count = result.data?.failure_count ?? 0;
        const total_count = result.data?.total_count ?? 0;
        
        if (failure_count === 0) {
          alert(`✅ 成功为 ${success_count} 名学生分配培养方案！\n\n💡 学生可以在"教学任务与安排"页面查看分配的课程。`);
        } else {
          const details = result.data?.details || [];
          let detailsMessage = '';
          
          if (details.length > 0) {
            detailsMessage = '\n\n失败详情:\n' + details.slice(0, 3).map((d: any) => 
              `• 学生ID ${d.student_id}: ${d.error}`
            ).join('\n');
            
            if (details.length > 3) {
              detailsMessage += `\n...还有 ${details.length - 3} 个错误`;
            }
          }
          
          alert(`⚠️ 培养方案分配完成\n\n✅ 成功分配: ${success_count} 名学生\n❌ 分配失败: ${failure_count} 名学生${detailsMessage}`);
          console.log('分配详情:', result.data?.details);
        }
        
        // 关闭模态框并重置状态
        setIsAssignProgramModalOpen(false);
        setSelectedProgram('');
        setSelectedStudents(new Set());
        
        // 刷新学生列表数据
        console.log('开始刷新学生列表...');
        await fetchTeacherStudents();
        console.log('学生列表刷新完成');
        
        // 如果有成功的分配，显示额外提示
        if (success_count > 0) {
          setTimeout(() => {
            alert(`📚 培养方案分配成功！

分配的 ${success_count} 名学生现在可以在他们的"教学任务与安排"页面中看到相关课程。

请通知学生登录系统查看。`);
          }, 1000);
        }
      } else {
        // 修复：添加更详细的错误信息显示
        const errorMessage = result.message || '未知错误';
        console.error('分配失败详情:', result);
        alert(`❌ 分配失败: ${errorMessage}`);
      }
    } catch (error) {
      console.error('分配培养方案失败:', error);
      alert(`分配培养方案失败: ${error instanceof Error ? error.message : '网络连接异常'}`);
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
      const currentTeacherId = user?.id;
      if (!currentTeacherId) {
        alert('未获取到教师信息，请重新登录');
        return;
      }
      
      const result = await TrainingProgramService.importTrainingProgram(trainingProgramCourses, {
        teacherId: currentTeacherId,
        programName: `培养方案_${new Date().toLocaleString('zh-CN')}`,
        programCode: `PROGRAM_${Date.now()}`,
        major: '未指定专业',
        department: '未指定院系'
      });
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

            
            {/* 用户信息 */}
            <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors">
              <img 
                src="https://s.coze.cn/image/hatzc53pi4k/" 
                alt="教师头像" 
                className="w-8 h-8 rounded-full" 
              />
              <div className="text-sm">
                <div className="font-medium text-text-primary">{user?.full_name || '教师'}</div>
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
                  
                  <button 
                    onClick={handleConfirmImport}
                    disabled={selectedAvailableStudents.size === 0 || importLoading}
                    className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    <i className={`fas ${importLoading ? 'fa-spinner fa-spin' : 'fa-check'}`}></i>
                    <span>{importLoading ? '导入中...' : '确认导入'}</span>
                  </button>
                </div>
                
                {/* 学生列表 */}
                <div className="flex-1 overflow-y-auto border border-border-light rounded-lg">
                  {importLoading ? (
                    <div className="py-12 text-center">
                      <i className="fas fa-spinner fa-spin text-2xl text-secondary mb-4"></i>
                      <p className="text-text-secondary">加载中...</p>
                    </div>
                  ) : availableStudents.length === 0 ? (
                    <div className="py-12 text-center">
                      <i className="fas fa-user-plus text-4xl text-gray-300 mb-4"></i>
                      <p className="text-text-secondary">暂无可导入的学生</p>
                      <p className="text-sm text-text-secondary mt-2">请确保系统中已存在学生账户</p>
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-border-light">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                            <input 
                              type="checkbox" 
                              checked={isAllSelected()}
                              ref={(input) => {
                                if (input) input.indeterminate = isIndeterminate();
                              }}
                              onChange={(e) => handleSelectAllAvailable(e.target.checked)}
                              className="rounded border-border-light"
                            />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">学号</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">姓名</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">班级</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">联系方式</th>
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{student.class_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{student.phone}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                
                {/* 分页 */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-text-secondary">
                    共 {importTotalCount} 条记录
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setImportPage(prev => Math.max(1, prev - 1))}
                      disabled={importPage === 1}
                      className="px-3 py-1 text-sm border border-border-light rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    <span className="text-sm text-text-primary">
                      第 {importPage} 页
                    </span>
                    <button 
                      onClick={() => setImportPage(prev => prev + 1)}
                      disabled={importPage * 20 >= importTotalCount}
                      className="px-3 py-1 text-sm border border-border-light rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 培养方案导入模态框 */}
      {isTrainingProgramModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
            <div className="p-6 border-b border-border-light">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary">导入培养方案</h3>
                <button 
                  onClick={handleTrainingProgramModalClose}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">
                    <i className="fas fa-info-circle mr-2"></i>使用说明
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• 请下载最新的Excel模板并按照格式填写培养方案信息</li>
                    <li>• 支持.xls和.xlsx格式的Excel文件</li>
                    <li>• 文件大小不能超过10MB</li>
                    <li>• 导入前请仔细检查数据准确性</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <button 
                    onClick={handleDownloadTrainingProgramTemplate}
                    className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <i className="fas fa-download"></i>
                    <span>下载模板</span>
                  </button>
                  
                  <div className="border-2 border-dashed border-border-light rounded-lg p-6 text-center hover:border-secondary transition-colors">
                    <input 
                      type="file" 
                      accept=".xlsx,.xls,.csv" 
                      onChange={handleTrainingProgramFileSelect}
                      className="hidden" 
                      id="training-program-file"
                    />
                    <label htmlFor="training-program-file" className="cursor-pointer">
                      <i className="fas fa-cloud-upload-alt text-3xl text-secondary mb-3"></i>
                      <p className="font-medium text-text-primary">点击选择文件或拖拽文件到这里</p>
                      <p className="text-sm text-text-secondary mt-1">支持 Excel 文件 (.xlsx, .xls)</p>
                    </label>
                  </div>
                  
                  {trainingProgramFile && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <i className="fas fa-file-excel text-green-500 text-xl"></i>
                          <div>
                            <p className="font-medium text-text-primary">{trainingProgramFile.name}</p>
                            <p className="text-sm text-text-secondary">
                              {(trainingProgramFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setTrainingProgramFile(null)}
                          className="text-text-secondary hover:text-red-500 transition-colors"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                      
                      {trainingProgramCourses.length > 0 && (
                        <div className="mt-3 p-3 bg-white rounded border">
                          <p className="text-sm text-text-primary">
                            已解析 <span className="font-semibold">{trainingProgramCourses.length}</span> 条课程记录
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {trainingProgramImportResult && (
                    <div className={`p-4 rounded-lg ${trainingProgramImportResult.success > 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                      <div className="flex items-start space-x-3">
                        <i className={`fas ${trainingProgramImportResult.success > 0 ? 'fa-check-circle text-green-500' : 'fa-exclamation-circle text-red-500'} text-xl`}></i>
                        <div>
                          <h4 className={`font-medium ${trainingProgramImportResult.success > 0 ? 'text-green-800' : 'text-red-800'}`}>
                            {trainingProgramImportResult.success > 0 ? '导入成功' : '导入失败'}
                          </h4>
                          <p className={`text-sm mt-1 ${trainingProgramImportResult.success > 0 ? 'text-green-700' : 'text-red-700'}`}>
                            成功导入 {trainingProgramImportResult.success} 条记录
                            {trainingProgramImportResult.failed > 0 && (
                              <span>，失败 {trainingProgramImportResult.failed} 条</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  <button 
                    onClick={handleTrainingProgramModalClose}
                    className="flex-1 px-4 py-2 border border-border-light rounded-lg text-text-primary hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button 
                    onClick={handleTrainingProgramImport}
                    disabled={!trainingProgramFile || trainingProgramImporting}
                    className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <i className={`fas ${trainingProgramImporting ? 'fa-spinner fa-spin' : 'fa-upload'}`}></i>
                    <span>{trainingProgramImporting ? '导入中...' : '开始导入'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 分配培养方案模态框 */}
      {isAssignProgramModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-border-light">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary">分配培养方案</h3>
                <button 
                  onClick={() => setIsAssignProgramModalOpen(false)}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    将为 <span className="font-semibold">{selectedStudents.size}</span> 名学生分配培养方案
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    选择培养方案
                  </label>
                  {programsLoading ? (
                    <div className="py-4 text-center">
                      <i className="fas fa-spinner fa-spin text-secondary"></i>
                      <p className="text-sm text-text-secondary mt-2">加载中...</p>
                    </div>
                  ) : (
                    <select 
                      value={selectedProgram}
                      onChange={(e) => setSelectedProgram(e.target.value)}
                      className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                    >
                      <option value="">请选择培养方案</option>
                      {availablePrograms.map(program => (
                        <option key={program.id} value={program.id}>
                          {program.program_name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setIsAssignProgramModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-border-light rounded-lg text-text-primary hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button 
                    onClick={handleAssignTrainingProgram}
                    disabled={!selectedProgram || assigningProgram}
                    className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <i className={`fas ${assigningProgram ? 'fa-spinner fa-spin' : 'fa-check'}`}></i>
                    <span>{assigningProgram ? '分配中...' : '确认分配'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 编辑学生模态框 */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-border-light">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary">
                  {editingStudent ? '编辑学生信息' : '新增学生'}
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
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const data = Object.fromEntries(formData.entries());
                handleSaveStudent(data);
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  姓名
                </label>
                <input 
                  type="text" 
                  name="full_name"
                  defaultValue={editingStudent?.full_name || ''}
                  className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  学号
                </label>
                <input 
                  type="text" 
                  name="user_number"
                  defaultValue={editingStudent?.user_number || ''}
                  className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  邮箱
                </label>
                <input 
                  type="email" 
                  name="email"
                  defaultValue={editingStudent?.email || ''}
                  className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  联系电话
                </label>
                <input 
                  type="tel" 
                  name="phone"
                  defaultValue={editingStudent?.phone || ''}
                  className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  班级
                </label>
                <input 
                  type="text" 
                  name="class_name"
                  defaultValue={editingStudent?.class_name || ''}
                  className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => {
                    setIsStudentModalOpen(false);
                    setEditingStudent(null);
                  }}
                  className="flex-1 px-4 py-2 border border-border-light rounded-lg text-text-primary hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherStudentList;



















