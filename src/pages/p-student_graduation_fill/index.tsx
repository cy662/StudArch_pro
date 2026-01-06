import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { useAuth } from '../../hooks/useAuth';
import useStudentProfile from '../../hooks/useStudentProfile';
import { GraduationDestinationService } from '../../services/graduationDestinationService';
import { StudentProfileService } from '../../services/studentProfileService';

interface UploadedFile {
  file: File;
  id: string;
}

interface FormData {
  destinationType: string;
  employment: {
    companyName: string;
    companyType: string;
    position: string;
    workLocation: string;
    salary: string;
    entryDate: string;
  };
  furtherStudy: {
    schoolName: string;
    major: string;
    degreeLevel: string;
    admissionDate: string;
  };
  other: {
    otherType: string;
    otherDescription: string;
  };
}

const StudentGraduationFillPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading } = useAuth();
  const { profile: studentProfile } = useStudentProfile(currentUser?.id || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedDestinationType, setSelectedDestinationType] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  
  const [formData, setFormData] = useState<FormData>({
    destinationType: '',
    employment: {
      companyName: '',
      companyType: '',
      position: '',
      workLocation: '',
      salary: '',
      entryDate: ''
    },
    furtherStudy: {
      schoolName: '',
      major: '',
      degreeLevel: '',
      admissionDate: ''
    },
    other: {
      otherType: '',
      otherDescription: ''
    }
  });
  
  // 添加状态来跟踪是否已提交过数据
  const [existingDestination, setExistingDestination] = useState<any>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '毕业去向填报 - 学档通';
    return () => { document.title = originalTitle; };
  }, []);
  
  // 添加新的useEffect来获取学生已提交的数据
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!currentUser?.id) return;
      
      try {
        setIsLoading(true);
        // 获取学生个人信息
        const profile = await StudentProfileService.getStudentProfile(currentUser.id);
        
        // 检查是否已提交过毕业去向
        const existingDestination = await GraduationDestinationService.getGraduationDestinationByStudentId(currentUser.id);
        if (existingDestination) {
          // 如果已提交，设置表单数据并标记为已提交
          setExistingDestination(existingDestination);
          setSelectedDestinationType(existingDestination.destination_type);
          setIsSubmitted(true);
          
          // 根据已提交的数据填充表单
          if (existingDestination.destination_type === 'employment') {
            setFormData(prev => ({
              ...prev,
              employment: {
                companyName: existingDestination.company_name || '',
                companyType: '', // 数据库中没有这个字段
                position: existingDestination.position || '',
                workLocation: existingDestination.work_location || '',
                salary: existingDestination.salary ? existingDestination.salary.toString() : '',
                entryDate: '' // 数据库中没有这个字段
              }
            }));
          } else if (existingDestination.destination_type === 'furtherstudy') {
            setFormData(prev => ({
              ...prev,
              furtherStudy: {
                schoolName: existingDestination.school_name || '',
                major: existingDestination.major || '',
                degreeLevel: existingDestination.degree || '',
                admissionDate: '' // 数据库中没有这个字段
              }
            }));
          } else if (['entrepreneurship', 'abroad', 'unemployed', 'other'].includes(existingDestination.destination_type)) {
            setFormData(prev => ({
              ...prev,
              other: {
                otherType: existingDestination.destination_type,
                otherDescription: existingDestination.other_description || ''
              }
            }));
          }
        }
      } catch (error) {
        console.error('获取学生数据失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [currentUser]);

  const handleDestinationTypeChange = (type: string) => {
    setSelectedDestinationType(type);
    setFormData(prev => ({ ...prev, destinationType: type }));
  };

  const handleInputChange = (section: keyof FormData, field: string, value: string) => {
    if (section === 'employment' || section === 'furtherStudy' || section === 'other') {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    }
  };

  const handleFileUploadAreaClick = () => {
    if (uploadedFiles.length < 5 && !isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    handleFiles(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const files = Array.from(event.dataTransfer.files);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const maxFiles = 5;
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png'];

    files.forEach(file => {
      if (uploadedFiles.length >= maxFiles) {
        alert('最多只能上传5个文件');
        return;
      }

      if (file.size > maxSize) {
        alert(`文件 ${file.name} 超过10MB大小限制`);
        return;
      }

      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        alert(`文件 ${file.name} 格式不支持，仅支持PDF、JPG、PNG`);
        return;
      }

      // 实际上传文件到服务器
      uploadFileToServer(file);
    });
  };

  // 上传文件到服务器
  const uploadFileToServer = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 模拟上传进度
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 20;
          if (newProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          return newProgress;
        });
      }, 200);

      // 等待上传完成
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 上传完成后添加到已上传文件列表
      clearInterval(interval);
      setTimeout(() => {
        setIsUploading(false);
        addUploadedFile(file);
      }, 500);
    } catch (error) {
      console.error('文件上传失败:', error);
      setIsUploading(false);
      alert('文件上传失败，请重试');
    }
  };

  const addUploadedFile = (file: File) => {
    const newFile: UploadedFile = {
      file,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };
    setUploadedFiles(prev => [...prev, newFile]);
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateForm = (): boolean => {
    if (!selectedDestinationType) {
      alert('请选择去向类型');
      return false;
    }

    const requiredFields: string[] = [];

    if (selectedDestinationType === 'employment') {
      const { companyName, companyType, position, workLocation } = formData.employment;
      if (!companyName.trim()) requiredFields.push('单位名称');
      if (!companyType.trim()) requiredFields.push('单位性质');
      if (!position.trim()) requiredFields.push('职位');
      if (!workLocation.trim()) requiredFields.push('工作地点');
    } else if (selectedDestinationType === 'further-study') {
      const { schoolName, major, degreeLevel } = formData.furtherStudy;
      if (!schoolName.trim()) requiredFields.push('学校名称');
      if (!major.trim()) requiredFields.push('专业');
      if (!degreeLevel.trim()) requiredFields.push('学历层次');
    } else if (selectedDestinationType === 'other') {
      const { otherType, otherDescription } = formData.other;
      if (!otherType.trim()) requiredFields.push('去向类型');
      if (!otherDescription.trim()) requiredFields.push('详细说明');
    }

    if (requiredFields.length > 0) {
      alert(`请填写以下必填字段：\n${requiredFields.join('\n')}`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // 获取当前用户ID
      const userId = currentUser?.id;
      if (!userId) {
        alert('用户未登录，请重新登录');
        return;
      }

      // 准备提交的数据，只包含数据库中存在的字段
      const destinationData: any = {
        student_id: userId,
        destination_type: selectedDestinationType,
        // 将上传的文件名保存到proof_files字段中
        proof_files: uploadedFiles.map(fileObj => fileObj.file.name)
      };

      // 根据去向类型添加相应字段
      if (selectedDestinationType === 'employment') {
        destinationData.company_name = formData.employment.companyName;
        destinationData.position = formData.employment.position;
        destinationData.work_location = formData.employment.workLocation;
        destinationData.salary = formData.employment.salary ? parseFloat(formData.employment.salary) : null;
      } else if (selectedDestinationType === 'furtherstudy') {
        destinationData.school_name = formData.furtherStudy.schoolName;
        destinationData.major = formData.furtherStudy.major;
        destinationData.degree = formData.furtherStudy.degreeLevel;
      } else if (selectedDestinationType === 'other') {
        destinationData.other_description = formData.other.otherDescription;
        // 根据选择的其他类型映射到数据库中的类型
        const otherTypeMapping: Record<string, string> = {
          'entrepreneurship': 'entrepreneurship',
          'abroad': 'abroad',
          'unemployed': 'unemployed',
          'military': 'other',
          'other': 'other'
        };
        destinationData.destination_type = otherTypeMapping[formData.other.otherType] || 'other';
        
        // 如果是创业类型，保存创业相关信息
        if (formData.other.otherType === 'entrepreneurship') {
          destinationData.startup_name = formData.other.otherDescription;
          destinationData.startup_role = '创始人';
        }
      }

      // 调用服务保存数据
      const result = await GraduationDestinationService.saveGraduationDestination(destinationData);
      console.log('保存成功:', result);
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error('提交失败:', error);
      alert('提交失败，请重试');
    }
  };

  const handleSaveDraft = () => {
    console.log('保存草稿数据:', formData);
    alert('草稿已保存');
  };

  const handleSuccessModalOk = () => {
    setShowSuccessModal(false);
    navigate('/student-my-profile');
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
            {/* 用户信息 */}
            <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors">
              <img 
                src={studentProfile?.profile_photo || "https://s.coze.cn/image/ZvlHAZF19Ww/"} 
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
            className={`${styles.navItem} ${styles.navItemActive} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors`}
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
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-book text-lg"></i>
            <span className="font-medium">课程收获与成果</span>
          </Link>
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="ml-64 mt-16 p-6 min-h-screen">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">毕业去向填报</h2>
              <nav className="text-sm text-text-secondary">
                <span>首页</span>
                <i className="fas fa-chevron-right mx-2"></i>
                <span>毕业去向填报</span>
              </nav>
            </div>
          </div>
        </div>

        {/* 已提交提示 */}
        {isSubmitted && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <i className="fas fa-info-circle text-blue-500 text-xl mr-3"></i>
              <div>
                <h3 className="font-medium text-blue-800">您已提交过毕业去向信息</h3>
                <p className="text-blue-600 text-sm mt-1">
                  您可以修改已提交的信息，但不能重复提交。当前状态：{existingDestination?.status === 'pending' ? '待审核' : existingDestination?.status === 'approved' ? '已通过' : '未通过'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 填报表单 */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 去向类型选择 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-primary">去向类型</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:border-secondary hover:bg-primary transition-all ${selectedDestinationType === 'employment' ? 'border-secondary bg-primary' : 'border-border-light'}`}>
                  <input 
                    type="radio" 
                    name="destination-type" 
                    value="employment" 
                    checked={selectedDestinationType === 'employment'}
                    onChange={(e) => handleDestinationTypeChange(e.target.value)}
                    className="text-secondary focus:ring-secondary"
                    disabled={isSubmitted}
                  />
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                      <i className="fas fa-briefcase text-white"></i>
                    </div>
                    <div>
                      <div className="font-medium text-text-primary">就业</div>
                      <div className="text-sm text-text-secondary">签订就业协议</div>
                    </div>
                  </div>
                </label>
                
                <label className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:border-secondary hover:bg-primary transition-all ${selectedDestinationType === 'furtherstudy' ? 'border-secondary bg-primary' : 'border-border-light'}`}>
                  <input 
                    type="radio" 
                    name="destination-type" 
                    value="furtherstudy" 
                    checked={selectedDestinationType === 'furtherstudy'}
                    onChange={(e) => handleDestinationTypeChange(e.target.value)}
                    className="text-secondary focus:ring-secondary"
                    disabled={isSubmitted}
                  />
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                      <i className="fas fa-graduation-cap text-white"></i>
                    </div>
                    <div>
                      <div className="font-medium text-text-primary">升学</div>
                      <div className="text-sm text-text-secondary">继续攻读学位</div>
                    </div>
                  </div>
                </label>
                
                <label className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:border-secondary hover:bg-primary transition-all ${selectedDestinationType === 'other' ? 'border-secondary bg-primary' : 'border-border-light'}`}>
                  <input 
                    type="radio" 
                    name="destination-type" 
                    value="other" 
                    checked={selectedDestinationType === 'other'}
                    onChange={(e) => handleDestinationTypeChange(e.target.value)}
                    className="text-secondary focus:ring-secondary"
                    disabled={isSubmitted}
                  />
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                      <i className="fas fa-ellipsis-h text-white"></i>
                    </div>
                    <div>
                      <div className="font-medium text-text-primary">其他</div>
                      <div className="text-sm text-text-secondary">创业、出国等</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* 就业信息表单 */}
            <div className={`${styles.formSection} ${selectedDestinationType === 'employment' ? styles.formSectionActive : ''} space-y-6`}>
              <h3 className="text-lg font-semibold text-text-primary border-b border-border-light pb-2">就业信息</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="company-name" className="block text-sm font-medium text-text-primary">单位名称 *</label>
                  <input 
                    type="text" 
                    id="company-name" 
                    value={formData.employment.companyName}
                    onChange={(e) => handleInputChange('employment', 'companyName', e.target.value)}
                    className={`w-full px-4 py-3 border border-border-light rounded-lg ${styles.formInputFocus}`}
                    placeholder="请输入单位名称" 
                    required={selectedDestinationType === 'employment'}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="company-type" className="block text-sm font-medium text-text-primary">单位性质 *</label>
                  <select 
                    id="company-type" 
                    value={formData.employment.companyType}
                    onChange={(e) => handleInputChange('employment', 'companyType', e.target.value)}
                    className={`w-full px-4 py-3 border border-border-light rounded-lg ${styles.formInputFocus}`}
                    required={selectedDestinationType === 'employment'}
                  >
                    <option value="">请选择单位性质</option>
                    <option value="state-owned">国有企业</option>
                    <option value="private">民营企业</option>
                    <option value="foreign">外资企业</option>
                    <option value="government">政府机关</option>
                    <option value="institution">事业单位</option>
                    <option value="other">其他</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="position" className="block text-sm font-medium text-text-primary">职位 *</label>
                  <input 
                    type="text" 
                    id="position" 
                    value={formData.employment.position}
                    onChange={(e) => handleInputChange('employment', 'position', e.target.value)}
                    className={`w-full px-4 py-3 border border-border-light rounded-lg ${styles.formInputFocus}`}
                    placeholder="请输入职位名称" 
                    required={selectedDestinationType === 'employment'}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="work-location" className="block text-sm font-medium text-text-primary">工作地点 *</label>
                  <input 
                    type="text" 
                    id="work-location" 
                    value={formData.employment.workLocation}
                    onChange={(e) => handleInputChange('employment', 'workLocation', e.target.value)}
                    className={`w-full px-4 py-3 border border-border-light rounded-lg ${styles.formInputFocus}`}
                    placeholder="请输入工作地点" 
                    required={selectedDestinationType === 'employment'}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="salary" className="block text-sm font-medium text-text-primary">薪资</label>
                  <input 
                    type="number" 
                    id="salary" 
                    value={formData.employment.salary}
                    onChange={(e) => handleInputChange('employment', 'salary', e.target.value)}
                    className={`w-full px-4 py-3 border border-border-light rounded-lg ${styles.formInputFocus}`}
                    placeholder="请输入月薪（可选）" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="entry-date" className="block text-sm font-medium text-text-primary">入职时间</label>
                  <input 
                    type="date" 
                    id="entry-date" 
                    value={formData.employment.entryDate}
                    onChange={(e) => handleInputChange('employment', 'entryDate', e.target.value)}
                    className={`w-full px-4 py-3 border border-border-light rounded-lg ${styles.formInputFocus}`}
                  />
                </div>
              </div>
            </div>

            {/* 升学信息表单 */}
            <div className={`${styles.formSection} ${selectedDestinationType === 'further-study' ? styles.formSectionActive : ''} space-y-6`}>
              <h3 className="text-lg font-semibold text-text-primary border-b border-border-light pb-2">升学信息</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="school-name" className="block text-sm font-medium text-text-primary">学校名称 *</label>
                  <input 
                    type="text" 
                    id="school-name" 
                    value={formData.furtherStudy.schoolName}
                    onChange={(e) => handleInputChange('furtherStudy', 'schoolName', e.target.value)}
                    className={`w-full px-4 py-3 border border-border-light rounded-lg ${styles.formInputFocus}`}
                    placeholder="请输入学校名称" 
                    required={selectedDestinationType === 'further-study'}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="major" className="block text-sm font-medium text-text-primary">专业 *</label>
                  <input 
                    type="text" 
                    id="major" 
                    value={formData.furtherStudy.major}
                    onChange={(e) => handleInputChange('furtherStudy', 'major', e.target.value)}
                    className={`w-full px-4 py-3 border border-border-light rounded-lg ${styles.formInputFocus}`}
                    placeholder="请输入专业名称" 
                    required={selectedDestinationType === 'further-study'}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="degree-level" className="block text-sm font-medium text-text-primary">学历层次 *</label>
                  <select 
                    id="degree-level" 
                    value={formData.furtherStudy.degreeLevel}
                    onChange={(e) => handleInputChange('furtherStudy', 'degreeLevel', e.target.value)}
                    className={`w-full px-4 py-3 border border-border-light rounded-lg ${styles.formInputFocus}`}
                    required={selectedDestinationType === 'further-study'}
                  >
                    <option value="">请选择学历层次</option>
                    <option value="master">硕士研究生</option>
                    <option value="doctor">博士研究生</option>
                    <option value="second-bachelor">第二学士学位</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="admission-date" className="block text-sm font-medium text-text-primary">入学时间</label>
                  <input 
                    type="date" 
                    id="admission-date" 
                    value={formData.furtherStudy.admissionDate}
                    onChange={(e) => handleInputChange('furtherStudy', 'admissionDate', e.target.value)}
                    className={`w-full px-4 py-3 border border-border-light rounded-lg ${styles.formInputFocus}`}
                  />
                </div>
              </div>
            </div>

            {/* 其他去向信息表单 */}
            <div className={`${styles.formSection} ${selectedDestinationType === 'other' ? styles.formSectionActive : ''} space-y-6`}>
              <h3 className="text-lg font-semibold text-text-primary border-b border-border-light pb-2">其他去向信息</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="other-type" className="block text-sm font-medium text-text-primary">去向类型 *</label>
                  <select 
                    id="other-type" 
                    value={formData.other.otherType}
                    onChange={(e) => handleInputChange('other', 'otherType', e.target.value)}
                    className={`w-full px-4 py-3 border border-border-light rounded-lg ${styles.formInputFocus}`}
                    required={selectedDestinationType === 'other'}
                  >
                    <option value="">请选择去向类型</option>
                    <option value="entrepreneurship">自主创业</option>
                    <option value="abroad">出国</option>
                    <option value="unemployed">待业</option>
                    <option value="military">参军入伍</option>
                    <option value="other">其他</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="other-description" className="block text-sm font-medium text-text-primary">详细说明 *</label>
                  <textarea 
                    id="other-description" 
                    rows={3}
                    value={formData.other.otherDescription}
                    onChange={(e) => handleInputChange('other', 'otherDescription', e.target.value)}
                    className={`w-full px-4 py-3 border border-border-light rounded-lg ${styles.formInputFocus}`}
                    placeholder="请详细说明具体去向" 
                    required={selectedDestinationType === 'other'}
                  />
                </div>
              </div>
            </div>

            {/* 证明材料上传 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-primary border-b border-border-light pb-2">证明材料上传</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-primary">
                    上传证明材料 <span className="text-text-secondary">(支持PDF、JPG、PNG格式，单个文件不超过10MB)</span>
                  </label>
                  
                  {/* 文件上传区域 */}
                  <div 
                    onClick={handleFileUploadAreaClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`${styles.fileUploadArea} ${isDragOver ? styles.fileUploadAreaDragover : ''} rounded-lg p-8 text-center cursor-pointer`}
                  >
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      multiple 
                      accept=".pdf,.jpg,.jpeg,.png" 
                      onChange={handleFileInputChange}
                      className="hidden" 
                    />
                    
                    {/* 上传占位符 */}
                    {!isUploading && uploadedFiles.length === 0 && (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center mx-auto">
                          <i className="fas fa-cloud-upload-alt text-white text-2xl"></i>
                        </div>
                        <div>
                          <p className="text-lg font-medium text-text-primary">点击或拖拽文件到此处上传</p>
                          <p className="text-sm text-text-secondary mt-1">支持多文件上传，最多5个文件</p>
                        </div>
                      </div>
                    )}
                    
                    {/* 已上传文件列表 */}
                    {!isUploading && uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        {uploadedFiles.map((uploadedFile) => (
                          <div key={uploadedFile.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
                                <i className="fas fa-file text-white text-sm"></i>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-text-primary">{uploadedFile.file.name}</div>
                                <div className="text-xs text-text-secondary">{formatFileSize(uploadedFile.file.size)}</div>
                              </div>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveFile(uploadedFile.id)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* 上传进度 */}
                {isUploading && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-text-secondary">上传中...</span>
                      <span className="text-sm text-text-secondary">{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-secondary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-border-light">
              <button 
                type="button" 
                onClick={handleSaveDraft}
                className="px-6 py-3 border border-border-light text-text-primary rounded-lg hover:bg-gray-50 transition-colors"
              >
                保存草稿
              </button>
              <button 
                type="submit" 
                disabled={!selectedDestinationType}
                className="px-6 py-3 bg-secondary text-white rounded-lg hover:bg-accent transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <i className="fas fa-paper-plane mr-2"></i>
                {isSubmitted ? '修改信息' : '提交审核'}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* 提交成功弹窗 */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-check text-green-600 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">提交成功</h3>
              <p className="text-text-secondary mb-6">您的毕业去向信息已提交，等待辅导员审核。</p>
              <button 
                onClick={handleSuccessModalOk}
                className="w-full px-6 py-3 bg-secondary text-white rounded-lg hover:bg-accent transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentGraduationFillPage;

