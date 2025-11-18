

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import StudentProfileService from '../../services/studentProfileService';
import styles from './styles.module.css';

interface ModalConfig {
  title: string;
  message: string;
  onConfirm: () => void;
}

const SystemSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  
  // 系统状态相关状态
  const [isSystemEnabled, setIsSystemEnabled] = useState<boolean>(true);
  const [currentStatus, setCurrentStatus] = useState<string>('启用');
  const [statusDescription, setStatusDescription] = useState<React.ReactNode>(
    <div className="flex items-start space-x-3">
      <i className="fas fa-info-circle text-green-600 mt-1"></i>
      <div className="text-sm text-green-800">
        <p className="font-medium mb-1">系统当前处于启用状态</p>
        <p>所有用户可以正常进行数据的创建、修改、删除操作。</p>
      </div>
    </div>
  );

  // 学生个人信息维护功能相关状态
  const [isStudentProfileEditEnabled, setIsStudentProfileEditEnabled] = useState<boolean>(true);
  const [studentProfileEditStatus, setStudentProfileEditStatus] = useState<string>('启用');
  const [studentProfileEditDescription, setStudentProfileEditDescription] = useState<React.ReactNode>(
    <div className="flex items-start space-x-3">
      <i className="fas fa-info-circle text-green-600 mt-1"></i>
      <div className="text-sm text-green-800">
        <p className="font-medium mb-1">学生个人信息维护功能已启用</p>
        <p>学生可以自行添加、补充个人信息，并提交审核。</p>
      </div>
    </div>
  );

  // 系统设置加载状态
  const [settingsLoading, setSettingsLoading] = useState<boolean>(true);



  // 模态框相关状态
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showLoadingModal, setShowLoadingModal] = useState<boolean>(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState<ModalConfig | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('请稍候，正在执行操作...');

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '系统设置 - 学档通';
    return () => { document.title = originalTitle; };
  }, []);

  // 加载系统设置
  useEffect(() => {
    const loadSystemSettings = async () => {
      try {
        // 模拟加载系统设置
        setSettingsLoading(true);
        
        // 这里可以调用API获取实际设置
        const mockSettings = {
          isSystemEnabled: true,
          isStudentProfileEditEnabled: true
        };
        
        setIsSystemEnabled(mockSettings.isSystemEnabled);
        setIsStudentProfileEditEnabled(mockSettings.isStudentProfileEditEnabled);
        
        // 更新状态描述
        updateSystemStatus(mockSettings.isSystemEnabled);
        updateStudentProfileEditStatus(mockSettings.isStudentProfileEditEnabled);
        
      } catch (error) {
        console.error('加载系统设置失败:', error);
      } finally {
        setSettingsLoading(false);
      }
    };
    
    loadSystemSettings();
  }, []);

  // 系统状态切换处理
  const handleSystemStatusToggle = (checked: boolean) => {
    const isEnabled = checked;
    
    showConfirmModalHandler(
      isEnabled ? '启用系统' : '停用系统',
      isEnabled ? '启用系统后，所有用户将恢复正常的数据操作权限。确定要启用系统吗？' : '停用系统后，所有用户将无法进行数据的创建、修改、删除操作，只能浏览数据。确定要停用系统吗？',
      () => {
        updateSystemStatus(isEnabled);
      }
    );
  };

  const updateSystemStatus = (enabled: boolean) => {
    setIsSystemEnabled(enabled);
    
    if (enabled) {
      setCurrentStatus('启用');
      setStatusDescription(
        <div className="flex items-start space-x-3">
          <i className="fas fa-info-circle text-green-600 mt-1"></i>
          <div className="text-sm text-green-800">
            <p className="font-medium mb-1">系统当前处于启用状态</p>
            <p>所有用户可以正常进行数据的创建、修改、删除操作。</p>
          </div>
        </div>
      );
    } else {
      setCurrentStatus('停用');
      setStatusDescription(
        <div className="flex items-start space-x-3">
          <i className="fas fa-exclamation-triangle text-red-600 mt-1"></i>
          <div className="text-sm text-red-800">
            <p className="font-medium mb-1">系统当前处于停用状态</p>
            <p>所有用户只能浏览数据，无法进行创建、修改、删除操作。</p>
          </div>
        </div>
      );
    }
  };

  // 学生个人信息维护功能状态切换处理
  const handleStudentProfileEditToggle = (checked: boolean) => {
    const isEnabled = checked;
    
    showConfirmModalHandler(
      isEnabled ? '启用学生个人信息维护功能' : '停用学生个人信息维护功能',
      isEnabled ? '启用后，学生可以自行添加、补充个人信息。确定要启用吗？' : '停用后，学生将无法自行修改个人信息，只能由管理员维护。确定要停用吗？',
      () => {
        updateStudentProfileEditStatus(isEnabled);
      }
    );
  };

  const updateStudentProfileEditStatus = (enabled: boolean) => {
    setIsStudentProfileEditEnabled(enabled);
    
    if (enabled) {
      setStudentProfileEditStatus('启用');
      setStudentProfileEditDescription(
        <div className="flex items-start space-x-3">
          <i className="fas fa-info-circle text-green-600 mt-1"></i>
          <div className="text-sm text-green-800">
            <p className="font-medium mb-1">学生个人信息维护功能已启用</p>
            <p>学生可以自行添加、补充个人信息，并提交审核。</p>
          </div>
        </div>
      );
    } else {
      setStudentProfileEditStatus('停用');
      setStudentProfileEditDescription(
        <div className="flex items-start space-x-3">
          <i className="fas fa-exclamation-triangle text-red-600 mt-1"></i>
          <div className="text-sm text-red-800">
            <p className="font-medium mb-1">学生个人信息维护功能已停用</p>
            <p>学生无法自行修改个人信息，只能由管理员维护。</p>
          </div>
        </div>
      );
    }
  };



  // 退出登录处理
  const handleLogout = () => {
    showConfirmModalHandler(
      '退出登录',
      '确定要退出登录吗？',
      () => {
        navigate('/login');
      }
    );
  };

  // 模态框相关函数
  const showConfirmModalHandler = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModalConfig({ title, message, onConfirm });
    setShowConfirmModal(true);
  };

  const hideConfirmModal = () => {
    setShowConfirmModal(false);
    setConfirmModalConfig(null);
  };

  const handleConfirmAction = () => {
    hideConfirmModal();
    if (confirmModalConfig?.onConfirm) {
      confirmModalConfig.onConfirm();
    }
  };

  const showLoadingModalHandler = (message: string) => {
    setLoadingMessage(message);
    setShowLoadingModal(true);
  };

  const hideLoadingModal = () => {
    setShowLoadingModal(false);
  };

  // 显示成功消息
  const showSuccessMessage = (message: string) => {
    // 创建临时成功提示
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-20 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
    successDiv.innerHTML = `
      <div class="flex items-center space-x-2">
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(successDiv);
    
    // 显示动画
    setTimeout(() => {
      successDiv.classList.remove('translate-x-full');
    }, 100);
    
    // 3秒后隐藏
    setTimeout(() => {
      successDiv.classList.add('translate-x-full');
      setTimeout(() => {
        if (document.body.contains(successDiv)) {
          document.body.removeChild(successDiv);
        }
      }, 300);
    }, 3000);
  };

  // 点击模态框背景关闭
  const handleModalOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      hideConfirmModal();
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
                src="https://s.coze.cn/image/ZA7vX1rsbL4/" 
                alt="管理员头像" 
                className="w-8 h-8 rounded-full" 
              />
              <div className="text-sm">
                <div className="font-medium text-text-primary">超级管理员</div>
                <div className="text-text-secondary">系统管理员</div>
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
            to="/admin-dashboard" 
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-home text-lg"></i>
            <span className="font-medium">超级管理平台</span>
          </Link>
          
          <Link 
            to="/admin-user-management" 
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-users text-lg"></i>
            <span className="font-medium">用户管理</span>
          </Link>
          

          <Link 
            to="/admin-system-settings" 
            className={`${styles.navItem} ${styles.navItemActive} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors`}
          >
            <i className="fas fa-cog text-lg"></i>
            <span className="font-medium">系统设置</span>
          </Link>
          

        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="ml-64 mt-16 p-6 min-h-screen">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">系统设置</h2>
              <nav className="text-sm text-text-secondary">
                <span>首页</span>
                <i className="fas fa-chevron-right mx-2"></i>
                <span>系统设置</span>
              </nav>
            </div>
          </div>
        </div>

        {/* 配置项列表 */}
        <div className="space-y-6">
          {/* 系统状态配置 */}
          <div className={`bg-white rounded-xl shadow-card p-6 transition-all duration-300 ${styles.cardHover}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
                  <i className="fas fa-power-off text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">系统状态</h3>
                  <p className="text-sm text-text-secondary">控制整个系统的启用/停用状态</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-text-secondary">当前状态</div>
                  <div className={`text-lg font-medium px-3 py-1 rounded-full inline-block ${isSystemEnabled ? styles.statusBadgeActive : styles.statusBadgeInactive}`}>
                    {currentStatus}
                  </div>
                </div>
                <label className={styles.toggleSwitch}>
                  <input 
                    type="checkbox" 
                    checked={isSystemEnabled}
                    onChange={(e) => handleSystemStatusToggle(e.target.checked)}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              {statusDescription}
            </div>
          </div>

          {/* 学生个人信息维护功能配置 */}
          <div className={`bg-white rounded-xl shadow-card p-6 transition-all duration-300 ${styles.cardHover}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-user-edit text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">学生个人信息维护功能</h3>
                  <p className="text-sm text-text-secondary">控制学生是否可以自行维护个人信息</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-text-secondary">当前状态</div>
                  <div className={`text-lg font-medium px-3 py-1 rounded-full inline-block ${isStudentProfileEditEnabled ? styles.statusBadgeActive : styles.statusBadgeInactive}`}>
                    {studentProfileEditStatus}
                  </div>
                </div>
                <label className={styles.toggleSwitch}>
                  <input 
                    type="checkbox" 
                    checked={isStudentProfileEditEnabled}
                    onChange={(e) => handleStudentProfileEditToggle(e.target.checked)}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>
            </div>
            
            <div className={`${isStudentProfileEditEnabled ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'} rounded-lg p-4`}>
              {studentProfileEditDescription}
            </div>
            

          </div>


        </div>
      </main>

      {/* 确认对话框 */}
      {showConfirmModal && (
        <div className={styles.modalOverlay} onClick={handleModalOverlayClick}>
          <div className={styles.modalContent}>
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-exclamation-triangle text-orange-600"></i>
                </div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {confirmModalConfig?.title || '确认操作'}
                </h3>
              </div>
              <p className="text-text-secondary mb-6">
                {confirmModalConfig?.message || '您确定要执行此操作吗？'}
              </p>
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={hideConfirmModal}
                  className="px-4 py-2 border border-border-light text-text-secondary rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={handleConfirmAction}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  确认
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 加载提示 */}
      {showLoadingModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className="p-6 text-center">
              <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">处理中...</h3>
              <p className="text-text-secondary">
                {loadingMessage}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemSettingsPage;

