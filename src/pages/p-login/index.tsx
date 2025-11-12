

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

interface LoginFormData {
  username: string;
  password: string;
  captcha: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  
  // 表单数据状态
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
    captcha: ''
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
    const { username, password, captcha } = formData;

    if (!username.trim()) {
      showErrorMessage('请输入用户名');
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

    hideErrorMessage();
    return true;
  };

  // 模拟登录请求
  const simulateLogin = (username: string, password: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (username === 'admin' && password === 'admin123') {
          resolve('super_admin');
        } else if (username === 'teacher' && password === 'teacher123') {
          resolve('teacher');
        } else if (username === 'student' && password === 'student123') {
          resolve('student');
        } else {
          reject('用户名或密码错误');
        }
      }, 1500);
    });
  };

  // 表单提交处理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { username, password } = formData;
      const role = await simulateLogin(username.trim(), password.trim());
      
      // 根据角色跳转到不同页面
      switch(role) {
        case 'super_admin':
          navigate('/admin-dashboard');
          break;
        case 'teacher':
          navigate('/teacher-dashboard');
          break;
        case 'student':
          navigate('/student-dashboard');
          break;
        default:
          showErrorMessage('未知用户角色');
          setIsLoading(false);
      }
    } catch (error) {
      showErrorMessage(error as string);
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
        </div>

        {/* 登录表单 */}
        <div className={`bg-white rounded-2xl shadow-login-form p-8 ${styles.fadeIn}`}>
          <h2 className="text-xl font-semibold text-text-primary text-center mb-6">用户登录</h2>
          
          <form onSubmit={handleSubmit} className={`space-y-6 ${formShake ? styles.shakeAnimation : ''}`}>
            {/* 用户名输入框 */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-text-primary">用户名</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-user text-text-secondary"></i>
                </div>
                <input 
                  type="text" 
                  id="username" 
                  name="username" 
                  value={formData.username}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  className={`w-full pl-10 pr-4 py-3 border border-border-light rounded-lg ${styles.formInputFocus} transition-all duration-300`}
                  placeholder="请输入用户名"
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

