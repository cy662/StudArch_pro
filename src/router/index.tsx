import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import AuthGuard from '../components/AuthGuard';

import P_login from '../pages/p-login';
import P_admin_dashboard from '../pages/p-admin_dashboard';
import P_admin_user_management from '../pages/p-admin_user_management';

import P_admin_class_management from '../pages/p-admin_class_management';

import P_teacher_dashboard from '../pages/p-teacher_dashboard';
import P_teacher_student_list from '../pages/p-teacher_student_list';
import P_teacher_student_detail from '../pages/p-teacher_student_detail';

import P_teacher_graduation_management from '../pages/p-teacher_graduation_management';
import P_teacher_job_matching from '../pages/p-teacher_job_matching';

import P_student_dashboard from '../pages/p-student_dashboard';
import P_student_my_profile from '../pages/p-student_my_profile';
import P_student_profile_edit from '../pages/p-student_profile_edit';
import P_student_graduation_fill from '../pages/p-student_graduation_fill';
import P_student_document_view from '../pages/p-student_document_view';
import P_student_academic_tasks from '../pages/p-student_academic_tasks';
import P_student_profile_analysis from '../pages/p-student_profile_analysis';
import NotFoundPage from './NotFoundPage';
import ErrorPage from './ErrorPage';

function Listener() {
  const location = useLocation();
  useEffect(() => {
    const pageId = 'P-' + location.pathname.replace('/', '').toUpperCase();
    console.log('当前pageId:', pageId, ', pathname:', location.pathname, ', search:', location.search);
    if (typeof window === 'object' && window.parent && window.parent.postMessage) {
      window.parent.postMessage({
        type: 'chux-path-change',
        pageId: pageId,
        pathname: location.pathname,
        search: location.search,
      }, '*');
    }
  }, [location]);

  return <Outlet />;
}

// 使用 createBrowserRouter 创建路由实例
const router = createBrowserRouter([
  {
    path: '/',
    element: <Listener />,
    children: [
      {
    path: '/',
    element: <Navigate to='/login' replace={true} />,
  },
      {
    path: '/login',
    element: (
      <ErrorBoundary>
        <P_login />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/admin-dashboard',
    element: (
      <ErrorBoundary>
        <AuthGuard requiredRole="super_admin">
          <P_admin_dashboard />
        </AuthGuard>
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/admin-user-management',
    element: (
      <ErrorBoundary>
        <AuthGuard requiredRole="super_admin">
          <P_admin_user_management />
        </AuthGuard>
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },



      {
    path: '/teacher-dashboard',
    element: (
      <ErrorBoundary>
        <AuthGuard requiredRole="teacher">
          <P_teacher_dashboard />
        </AuthGuard>
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/teacher-student-list',
    element: (
      <ErrorBoundary>
        <AuthGuard requiredRole="teacher">
          <P_teacher_student_list />
        </AuthGuard>
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/teacher-student-detail',
    element: (
      <ErrorBoundary>
        <AuthGuard requiredRole="teacher">
          <P_teacher_student_detail />
        </AuthGuard>
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },

      {
    path: '/teacher-graduation-management',
    element: (
      <ErrorBoundary>
        <AuthGuard requiredRole="teacher">
          <P_teacher_graduation_management />
        </AuthGuard>
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: '/teacher-job-matching',
    element: (
      <ErrorBoundary>
        <P_teacher_job_matching />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },

      {
    path: '/student-dashboard',
    element: (
      <ErrorBoundary>
        <AuthGuard requiredRole="student">
          <P_student_dashboard />
        </AuthGuard>
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/student-my-profile',
    element: (
      <ErrorBoundary>
        <AuthGuard requiredRole="student">
          <P_student_my_profile />
        </AuthGuard>
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/student-profile-edit',
    element: (
      <ErrorBoundary>
        <AuthGuard requiredRole="student">
          <P_student_profile_edit />
        </AuthGuard>
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/student-graduation-fill',
    element: (
      <ErrorBoundary>
        <AuthGuard requiredRole="student">
          <P_student_graduation_fill />
        </AuthGuard>
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/student-document-view',
    element: (
      <ErrorBoundary>
        <AuthGuard requiredRole="student">
          <P_student_document_view />
        </AuthGuard>
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },

      {
    path: '/student-academic-tasks',
    element: (
      <ErrorBoundary>
        <AuthGuard requiredRole="student">
          <P_student_academic_tasks />
        </AuthGuard>
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/student-profile-analysis',
    element: (
      <ErrorBoundary>
        <AuthGuard requiredRole="student">
          <P_student_profile_analysis />
        </AuthGuard>
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },

      {
    path: '*',
    element: <NotFoundPage />,
  },
    ]
  }
]);

export default router;