import { TrainingProgramCourse, TrainingProgramImportResult } from '../types/trainingProgram';
import * as XLSX from 'xlsx';

export class TrainingProgramService {
  // 修改BASE_URL以明确指向API服务器
  private static readonly BASE_URL = 'http://localhost:3001/api';

  /**
   * 下载培养方案Excel模板
   */
  static async downloadTemplate(): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/training-program/template`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });

      if (!response.ok) {
        throw new Error('下载模板失败');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = '培养方案导入模板.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载模板失败:', error);
      throw error;
    }
  }

  /**
   * 解析本地Excel文件获取模板数据
   */
  static generateTemplateData(): Array<{
    课程号: string;
    课程名称: string;
    学分: number;
    建议修读年级: string;
    学期: string;
    考试方式: string;
    课程性质: string;
  }> {
    return [
      {
        课程号: 'CS101',
        课程名称: '计算机基础',
        学分: 3,
        建议修读年级: '大一',
        学期: '第一学期',
        考试方式: '笔试',
        课程性质: '必修课'
      },
      {
        课程号: 'CS102',
        课程名称: '程序设计基础',
        学分: 4,
        建议修读年级: '大一',
        学期: '第一学期',
        考试方式: '上机考试',
        课程性质: '必修课'
      },
      {
        课程号: 'MATH101',
        课程名称: '高等数学',
        学分: 4,
        建议修读年级: '大一',
        学期: '第一学期',
        考试方式: '笔试',
        课程性质: '必修课'
      }
    ];
  }

  /**
   * 生成Excel模板文件并下载
   */
  static async generateAndDownloadTemplate(): Promise<void> {
    try {
      const templateData = this.generateTemplateData();
      
      // 创建工作簿
      const wb = XLSX.utils.book_new();
      
      // 创建工作表数据
      const wsData = [
        ['课程号', '课程名称', '学分', '建议修读年级', '学期', '考试方式', '课程性质'],
        ...templateData.map(row => [
          row.课程号,
          row.课程名称,
          row.学分,
          row.建议修读年级,
          row.学期,
          row.考试方式,
          row.课程性质
        ])
      ];
      
      // 创建工作表
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      
      // 设置列宽
      const colWidths = [
        { wch: 15 }, // 课程号
        { wch: 25 }, // 课程名称
        { wch: 10 }, // 学分
        { wch: 15 }, // 建议修读年级
        { wch: 15 }, // 学期
        { wch: 15 }, // 考试方式
        { wch: 15 }  // 课程性质
      ];
      ws['!cols'] = colWidths;
      
      // 将工作表添加到工作簿
      XLSX.utils.book_append_sheet(wb, ws, '培养方案模板');
      
      // 生成Excel文件并下载
      XLSX.writeFile(wb, '培养方案导入模板.xlsx');
    } catch (error) {
      console.error('生成Excel模板失败:', error);
      throw error;
    }
  }

  /**
   * 解析上传的Excel/CSV文件
   */
  static async parseExcelFile(file: File): Promise<TrainingProgramCourse[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          let courses: TrainingProgramCourse[] = [];
          
          if (file.name.endsWith('.csv')) {
            // 处理CSV文件
            const content = data as string;
            courses = this.parseCSVContent(content);
          } else {
            // 处理Excel文件
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            courses = this.parseExcelContent(jsonData as any[][]);
          }
          
          resolve(courses);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };
      
      // 根据文件类型选择读取方式
      if (file.name.endsWith('.csv')) {
        reader.readAsText(file, 'UTF-8');
      } else {
        reader.readAsBinaryString(file);
      }
    });
  }

  /**
   * 解析Excel内容
   */
  private static parseExcelContent(data: any[][]): TrainingProgramCourse[] {
    if (data.length < 2) {
      throw new Error('文件内容为空或格式不正确');
    }

    const headers = data[0];
    const expectedHeaders = ['课程号', '课程名称', '学分', '建议修读年级', '学期', '考试方式', '课程性质'];
    
    // 验证表头
    for (let i = 0; i < expectedHeaders.length; i++) {
      if (!headers[i] || !String(headers[i]).includes(expectedHeaders[i])) {
        throw new Error('表头格式不正确，请下载官方模板');
      }
    }

    const courses: TrainingProgramCourse[] = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      if (row.length < 7 || !row[0]) {
        continue; // 跳过空行或格式不正确的行
      }

      const course: TrainingProgramCourse = {
        id: `temp_${Date.now()}_${i}`,
        course_number: String(row[0] || '').trim(),
        course_name: String(row[1] || '').trim(),
        credits: parseFloat(row[2]) || 0,
        recommended_grade: String(row[3] || '').trim(),
        semester: String(row[4] || '').trim(),
        exam_method: String(row[5] || '').trim(),
        course_nature: String(row[6] || '').trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // 验证必填字段
      if (!course.course_number || !course.course_name || course.credits <= 0) {
        throw new Error(`第${i + 1}行：课程号、课程名称和学分为必填项`);
      }

      courses.push(course);
    }

    if (courses.length === 0) {
      throw new Error('未找到有效的课程数据');
    }

    return courses;
  }

  /**
   * 解析CSV内容
   */
  private static parseCSVContent(content: string): TrainingProgramCourse[] {
    // 移除BOM
    content = content.replace(/^\uFEFF/, '');
    
    const lines = content.split(/\r?\n/).filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('文件内容为空或格式不正确');
    }

    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const expectedHeaders = ['课程号', '课程名称', '学分', '建议修读年级', '学期', '考试方式', '课程性质'];
    
    // 验证表头
    for (let i = 0; i < expectedHeaders.length; i++) {
      if (!headers[i] || !headers[i].includes(expectedHeaders[i])) {
        throw new Error('表头格式不正确，请下载官方模板');
      }
    }

    const courses: TrainingProgramCourse[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
      
      if (values.length < 7) {
        continue; // 跳过格式不正确的行
      }

      const course: TrainingProgramCourse = {
        id: `temp_${Date.now()}_${i}`,
        course_number: values[0],
        course_name: values[1],
        credits: parseFloat(values[2]) || 0,
        recommended_grade: values[3],
        semester: values[4],
        exam_method: values[5],
        course_nature: values[6],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // 验证必填字段
      if (!course.course_number || !course.course_name || course.credits <= 0) {
        throw new Error(`第${i + 1}行：课程号、课程名称和学分为必填项`);
      }

      courses.push(course);
    }

    if (courses.length === 0) {
      throw new Error('未找到有效的课程数据');
    }

    return courses;
  }

  /**
   * 批量导入培养方案课程（支持教师隔离）
   */
  static async importTrainingProgram(
    courses: TrainingProgramCourse[], 
    options?: {
      programName?: string;
      programCode?: string;
      teacherId?: string;
      major?: string;
      department?: string;
    }
  ): Promise<TrainingProgramImportResult> {
    try {
      // 准备API数据格式
      const apiCourses = courses.map(course => ({
        course_number: course.course_number,
        course_name: course.course_name,
        credits: course.credits,
        recommended_grade: course.recommended_grade,
        semester: course.semester,
        exam_method: course.exam_method,
        course_nature: course.course_nature
      }));

      const response = await fetch(`${this.BASE_URL}/training-program/import-with-teacher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': options?.teacherId || '', // 添加用户ID到请求头
        },
        body: JSON.stringify({ 
          courses: apiCourses,
          programName: options?.programName || `培养方案_${new Date().toLocaleString('zh-CN')}`,
          programCode: options?.programCode || 'CUSTOM_PROGRAM',
          teacherId: options?.teacherId,
          major: options?.major || '未指定专业',
          department: options?.department || '未指定院系',
          batchName: `${options?.programName || '培养方案'}_导入_${new Date().toLocaleString('zh-CN')}`,
          importedBy: options?.teacherId // 使用教师ID作为导入者
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '导入失败');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || '导入失败');
      }

      return {
        success: result.data?.success || 0,
        failed: result.data?.failed || 0,
        total: result.data?.total || 0,
        errors: result.data?.failed > 0 ? [] : undefined // 可以从失败记录中获取详细错误
      };
    } catch (error) {
      console.error('导入培养方案失败:', error);
      
      // 如果是网络错误或API不可用，抛出错误让用户知道
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('无法连接到服务器，请确保API服务器已启动');
      }
      
      throw error;
    }
  }

  /**
   * 获取教师的培养方案列表
   */
  static async getTeacherTrainingPrograms(
    teacherId: string,
    options?: {
      programName?: string;
      programCode?: string;
      status?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{
    programs: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const params = new URLSearchParams();
      params.append('teacher_id', teacherId);
      if (options?.programName) params.append('program_name', options.programName);
      if (options?.programCode) params.append('program_code', options.programCode);
      if (options?.status) params.append('status', options.status);
      if (options?.page) params.append('page', options.page.toString());
      if (options?.limit) params.append('limit', options.limit.toString());

      const response = await fetch(`${this.BASE_URL}/training-programs/teacher-list?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': teacherId, // 添加用户ID到请求头
        },
      });

      if (!response.ok) {
        throw new Error('获取教师培养方案失败');
      }

      const result = await response.json();
      return result.data || { programs: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
    } catch (error) {
      console.error('获取教师培养方案失败:', error);
      throw error;
    }
  }

  /**
   * 获取教师可用的培养方案（用于分配）
   */
  static async getTeacherAvailablePrograms(teacherId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/training-programs/teacher-available?teacher_id=${teacherId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': teacherId, // 添加用户ID到请求头
        },
      });

      if (!response.ok) {
        throw new Error('获取可用培养方案失败');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('获取可用培养方案失败:', error);
      throw error;
    }
  }

  /**
   * 分配教师培养方案给学生
   */
  static async assignTeacherTrainingProgram(
    teacherId: string,
    programId: string,
    studentIds: string[],
    notes?: string
  ): Promise<{
    success: boolean;
    message: string;
    data: {
      success_count: number;
      failure_count: number;
      total_count: number;
      details: any[];
    };
  }> {
    try {
      const response = await fetch(`${this.BASE_URL}/training-programs/teacher-assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': teacherId, // 添加用户ID到请求头
        },
        body: JSON.stringify({
          teacher_id: teacherId,
          program_id: programId,
          student_ids: studentIds,
          notes: notes
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '分配培养方案失败');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || '分配培养方案失败');
      }

      return result;
    } catch (error) {
      console.error('分配培养方案失败:', error);
      throw error;
    }
  }
}