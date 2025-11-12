

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

interface ModalConfig {
  title: string;
  message: string;
  onConfirm: () => void;
}

const SystemSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  
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

  // 备份信息相关状态
  const [lastBackupTime, setLastBackupTime] = useState<string>('2024年1月15日 02:00');
  const [backupSize, setBackupSize] = useState<string>('2.5 GB');
  const [backupStatus, setBackupStatus] = useState<string>('成功');

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

  // 立即备份处理
  const handleBackupNow = () => {
    showConfirmModalHandler(
      '立即备份',
      '备份过程中系统可能会有短暂的性能影响，确定要立即执行备份吗？',
      () => {
        performBackup();
      }
    );
  };

  const performBackup = () => {
    showLoadingModalHandler('正在执行备份...');
    
    // 模拟备份过程
    setTimeout(() => {
      hideLoadingModal();
      
      // 更新备份信息
      const now = new Date();
      const timeString = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      setLastBackupTime(timeString);
      setBackupStatus('成功');
      
      // 显示成功提示
      showSuccessMessage('备份操作已完成');
    }, 3000);
  };

  // 恢复数据处理
  const handleRestoreData = () => {
    showConfirmModalHandler(
      '恢复数据',
      '数据恢复是一个高风险操作，将覆盖当前所有数据。请确保您已了解此操作的后果。确定要继续吗？',
      () => {
        performRestore();
      }
    );
  };

  const performRestore = () => {
    showLoadingModalHandler('正在恢复数据...');
    
    // 模拟恢复过程
    setTimeout(() => {
      hideLoadingModal();
      showSuccessMessage('数据恢复操作已完成');
    }, 5000);
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
            {/* 消息通知 */}
            <button className="relative p-2 text-text-secondary hover:text-secondary transition-colors">
              <i className="fas fa-bell text-lg"></i>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
            </button>
            
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
            to="/admin-role-permission" 
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-user-shield text-lg"></i>
            <span className="font-medium">角色权限管理</span>
          </Link>
          
          <Link 
            to="/admin-system-settings" 
            className={`${styles.navItem} ${styles.navItemActive} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors`}
          >
            <i className="fas fa-cog text-lg"></i>
            <span className="font-medium">系统设置</span>
          </Link>
          
          <Link 
            to="/admin-operation-log" 
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-file-alt text-lg"></i>
            <span className="font-medium">操作日志审计</span>
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

          {/* 数据备份与恢复 */}
          <div className={`bg-white rounded-xl shadow-card p-6 transition-all duration-300 ${styles.cardHover}`}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-database text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">数据备份与恢复</h3>
                <p className="text-sm text-text-secondary">管理系统数据的备份和恢复操作</p>
              </div>
            </div>
            
            {/* 备份信息 */}
            <div className="mb-6">
              <h4 className="font-medium text-text-primary mb-3">最近备份</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-text-secondary">备份时间：</span>
                    <span className="text-text-primary font-medium">{lastBackupTime}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary">备份大小：</span>
                    <span className="text-text-primary font-medium">{backupSize}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary">备份状态：</span>
                    <span className="text-green-600 font-medium">{backupStatus}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleBackupNow}
                className="flex-1 bg-secondary hover:bg-accent text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <i className="fas fa-download"></i>
                <span>立即备份</span>
              </button>
              <button 
                onClick={handleRestoreData}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <i className="fas fa-upload"></i>
                <span>恢复数据</span>
              </button>
            </div>
            
            {/* 备份策略 */}
            <div className="mt-6 pt-6 border-t border-border-light">
              <h4 className="font-medium text-text-primary mb-3">自动备份策略</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">自动备份频率：</span>
                  <span className="text-text-primary font-medium">每日凌晨 2:00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">备份保留天数：</span>
                  <span className="text-text-primary font-medium">30天</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">备份存储位置：</span>
                  <span className="text-text-primary font-medium">云端 + 本地</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">加密保护：</span>
                  <span className="text-green-600 font-medium">已启用</span>
                </div>
              </div>
            </div>
          </div>

          {/* 系统信息 */}
          <div className={`bg-white rounded-xl shadow-card p-6 transition-all duration-300 ${styles.cardHover}`}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-info-circle text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">系统信息</h3>
                <p className="text-sm text-text-secondary">查看系统版本和运行状态</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-text-primary mb-1">v2.1.0</div>
                <div className="text-sm text-text-secondary">系统版本</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">正常</div>
                <div className="text-sm text-text-secondary">运行状态</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-text-primary mb-1">156</div>
                <div className="text-sm text-text-secondary">在线用户</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-text-primary mb-1">2024-01-15</div>
                <div className="text-sm text-text-secondary">最后更新</div>
              </div>
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

