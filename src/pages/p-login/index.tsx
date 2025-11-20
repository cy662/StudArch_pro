

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import AuthService, { LoginCredentials } from '../../services/authService';

interface LoginFormData {
  identifier: string; // 学号或工号
  password: string;
  captcha: string;
  loginType: 'student_id' | 'teacher_id'; // 登录方式
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  
  // 表单数据状态
  const [formData, setFormData] = useState<LoginFormData>({
    identifier: '',
    password: '',
    captcha: '',
    loginType: 'student_id'
  });
  
  // UI状态
  const [showPassword, setShowPassword] = useState(false);
  const [currentCaptcha, setCurrentCaptcha] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formShake, setFormShake] = useState(false);

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '登录 - 学档通';
    return () => { document.title = originalTitle; };
  }, []);

  // 生成验证码
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCurrentCaptcha(result);
  };

  // 初始化验证码
  useEffect(() => {
    generateCaptcha();
  }, []);

  // 密码显示/隐藏切换
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  // 登录方式切换
  const handleLoginTypeChange = (type: 'student_id' | 'teacher_id') => {
    setFormData(prev => ({
      ...prev,
      loginType: type,
      identifier: '' // 清空输入框
    }));
  };

  // 验证码刷新
  const handleRefreshCaptcha = () => {
    generateCaptcha();
  };

  // 表单输入处理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 显示错误信息
  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    setShowError(true);
    setFormShake(true);
    setTimeout(() => {
      setFormShake(false);
    }, 500);
  };

  // 隐藏错误信息
  const hideErrorMessage = () => {
    setShowError(false);
  };

  // 表单验证
  const validateForm = (): boolean => {
    const { identifier, password, captcha } = formData;

    if (!identifier.trim()) {
      showErrorMessage('请输入学号/工号');
      return false;
    }

    if (!password.trim()) {
      showErrorMessage('请输入密码');
      return false;
    }

    if (!captcha.trim()) {
      showErrorMessage('请输入验证码');
      return false;
    }

    if (captcha.trim().toUpperCase() !== currentCaptcha) {
      showErrorMessage('验证码错误');
      generateCaptcha();
      return false;
    }

    // 根据登录类型验证格式
    if (formData.loginType === 'student_id' && !/^\d{5,12}$/.test(identifier)) {
      showErrorMessage('请输入正确的学号格式（5-12位数字）');
      return false;
    }

    if (formData.loginType === 'teacher_id' && !/^[A-Za-z]+\d{1,8}$/.test(identifier)) {
      showErrorMessage('请输入正确的工号格式（字母开头，后跟1-8位数字，如：T2024001 或 ADMIN001）');
      return false;
    }

    hideErrorMessage();
    return true;
  };

  // 登录请求
  const handleLogin = async (credentials: LoginCredentials): Promise<void> => {
    const result = await AuthService.login(credentials);
    
    if (result.success && result.user) {
      // 存储token和用户信息
      localStorage.setItem('auth_token', result.token || '');
      localStorage.setItem('user_info', JSON.stringify(result.user));
      
      // 检查是否为学生且需要完善个人信息
      if (result.user.role?.role_name === 'student') {
        try {
          // 导入StudentProfileService进行动态检查
          const { default: StudentProfileService } = await import('../../services/studentProfileService');
          const profileCheck = await StudentProfileService.checkProfileCompletion(result.user.id);
          
          // 如果是首次登录或个人信息不完整，强制跳转到个人信息填写页面
          if (profileCheck.needsCompletion) {
            navigate('/student-profile-edit');
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.warn('检查个人信息完成状态失败，直接跳转到学生主页:', error);
        }
      }
      
      // 根据角色跳转到不同页面
      const redirectPath = AuthService.getRedirectPath(result.user.role.role_name);
      navigate(redirectPath);
      setIsLoading(false); // 登录成功后关闭加载状态
    } else {
      throw new Error(result.error || '登录失败');
    }
  };



  // 表单提交处理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { identifier, password } = formData;
      await handleLogin({
        identifier: identifier.trim(),
        password: password.trim()
      });
    } catch (error) {
      // 确保错误信息是字符串，避免直接渲染错误对象
      const errorMessage = error instanceof Error ? error.message : String(error);
      showErrorMessage(errorMessage);
      setIsLoading(false);
      generateCaptcha();
    }
  };

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        hideErrorMessage();
      }
      
      if (e.key === 'Enter' && showError) {
        hideErrorMessage();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showError]);

  // 忘记密码处理
  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    alert('请联系系统管理员重置密码');
  };

  // 输入框焦点处理
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    hideErrorMessage();
    const parentElement = e.target.parentElement;
    if (parentElement) {
      parentElement.classList.add('ring-2', 'ring-secondary', 'ring-opacity-20');
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const parentElement = e.target.parentElement;
    if (parentElement) {
      parentElement.classList.remove('ring-2', 'ring-secondary', 'ring-opacity-20');
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* 登录容器 */}
      <div className="w-full max-w-md">
        {/* Logo和系统名称 */}
        <div className={`text-center mb-8 ${styles.fadeIn}`}>
          <div className="w-20 h-20 bg-gradient-to-br from-secondary to-accent rounded-xl flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-graduation-cap text-white text-3xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">学档通</h1>
          <p className="text-text-secondary">学生档案全生命周期管理平台</p>
          <p className="text-text-secondary text-sm mt-1">支持学号/工号登录</p>
        </div>

        {/* 登录表单 */}
        <div className={`bg-white rounded-2xl shadow-login-form p-8 ${styles.fadeIn}`}>
          <h2 className="text-xl font-semibold text-text-primary text-center mb-6">用户登录</h2>
          
          <form onSubmit={handleSubmit} className={`space-y-6 ${formShake ? styles.shakeAnimation : ''}`}>
            {/* 登录方式选择 */}
            <div className="flex space-x-2 mb-4">
              <button
                type="button"
                onClick={() => handleLoginTypeChange('student_id')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  formData.loginType === 'student_id'
                    ? 'bg-secondary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                学生学号登录
              </button>
              <button
                type="button"
                onClick={() => handleLoginTypeChange('teacher_id')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  formData.loginType === 'teacher_id'
                    ? 'bg-secondary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                教师工号登录
              </button>
            </div>

            {/* 标识符输入框 */}
            <div className="space-y-2">
              <label htmlFor="identifier" className="block text-sm font-medium text-text-primary">
                {formData.loginType === 'student_id' && '学号'}
                {formData.loginType === 'teacher_id' && '工号'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className={`fas ${
                    formData.loginType === 'student_id' ? 'fa-graduation-cap' :
                    'fa-chalkboard-teacher'
                  } text-text-secondary`}></i>
                </div>
                <input 
                  type="text" 
                  id="identifier" 
                  name="identifier" 
                  value={formData.identifier}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  className={`w-full pl-10 pr-4 py-3 border border-border-light rounded-lg ${styles.formInputFocus} transition-all duration-300`}
                  placeholder={
                    formData.loginType === 'student_id' ? '请输入学号（5-12位数字）' :
                    '请输入工号（字母开头，3-8位数字）'
                  }
                  required
                />
              </div>
            </div>

            {/* 密码输入框 */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-text-primary">密码</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-lock text-text-secondary"></i>
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  id="password" 
                  name="password" 
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  className={`w-full pl-10 pr-12 py-3 border border-border-light rounded-lg ${styles.formInputFocus} transition-all duration-300`}
                  placeholder="请输入密码"
                  required
                />
                <button 
                  type="button" 
                  onClick={handleTogglePassword}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-secondary transition-colors"
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* 验证码输入框 */}
            <div className="space-y-2">
              <label htmlFor="captcha" className="block text-sm font-medium text-text-primary">验证码</label>
              <div className="flex space-x-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-shield-alt text-text-secondary"></i>
                  </div>
                  <input 
                    type="text" 
                    id="captcha" 
                    name="captcha" 
                    value={formData.captcha}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    className={`w-full pl-10 pr-4 py-3 border border-border-light rounded-lg ${styles.formInputFocus} transition-all duration-300`}
                    placeholder="请输入验证码"
                    maxLength={4}
                    required
                  />
                </div>
                <div 
                  onClick={handleRefreshCaptcha}
                  className="w-24 h-12 bg-gradient-to-r from-secondary to-accent rounded-lg flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <span className="text-white font-bold text-lg">{currentCaptcha}</span>
                </div>
              </div>
            </div>

            {/* 错误提示 */}
            {showError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 登录按钮 */}
            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full bg-secondary text-white py-3 px-4 rounded-lg font-medium ${styles.loginButtonHover} transition-all duration-300 flex items-center justify-center`}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  <span>登录中...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt mr-2"></i>
                  <span>登录</span>
                </>
              )}
            </button>
          </form>

          {/* 忘记密码链接 */}
          <div className="mt-6 text-center">
            <a 
              href="#" 
              onClick={handleForgotPassword}
              className="text-secondary hover:text-accent text-sm transition-colors"
            >
              忘记密码？
            </a>
          </div>
        </div>

        {/* 版权信息 */}
        <div className={`text-center mt-8 ${styles.fadeIn}`}>
          <p className="text-text-secondary text-sm">© 2024 学档通. 保留所有权利.</p>
        </div>
      </div>

      {/* 加载遮罩 */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-secondary"></div>
            <span className="text-text-primary">登录中...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;

