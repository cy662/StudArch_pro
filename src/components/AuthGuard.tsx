import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthService from '../services/authService';
import StudentProfileService from '../services/studentProfileService';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'super_admin' | 'teacher' | 'student';
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRole }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authResult = await AuthService.checkAuthStatus();
        
        if (authResult.success && authResult.user) {
          setIsAuthenticated(true);
          setUserRole(authResult.user.role.role_name);
          setUser(authResult.user);
          
          // 如果是学生，检查个人信息完成状态
          if (authResult.user.role?.role_name === 'student') {
            try {
              const profileCheck = await StudentProfileService.checkProfileCompletion(authResult.user.id);
              setNeedsProfileCompletion(profileCheck.needsCompletion);
            } catch (error) {
              console.warn('检查个人信息状态失败:', error);
            }
          }
        } else {
          setIsAuthenticated(false);
          setUserRole(null);
          setUser(null);
        }
      } catch (error) {
        console.error('认证检查失败:', error);
        setIsAuthenticated(false);
        setUserRole(null);
        setUser(null);
      }
    };

    checkAuth();
  }, [location.pathname]);

  // 等待认证检查完成
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
        <span className="ml-4 text-text-primary">检查登录状态...</span>
      </div>
    );
  }

  // 未认证，重定向到登录页
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 检查角色权限
  if (requiredRole && userRole !== requiredRole) {
    // 根据当前用户角色重定向到对应页面
    const redirectPath = AuthService.getRedirectPath(userRole || 'student');
    return <Navigate to={redirectPath} replace />;
  }

  // 学生个人信息完成状态检查（不在个人信息编辑页面时）
  if (userRole === 'student' && needsProfileCompletion && location.pathname !== '/student-profile-edit') {
    return <Navigate to="/student-profile-edit" replace />;
  }

  // 认证通过，显示子组件
  return <>{children}</>;
};

export default AuthGuard;