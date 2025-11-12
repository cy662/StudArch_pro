import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';

import P_login from '../pages/p-login';
import P_admin_dashboard from '../pages/p-admin_dashboard';
import P_admin_user_management from '../pages/p-admin_user_management';
import P_admin_role_permission from '../pages/p-admin_role_permission';
import P_admin_system_settings from '../pages/p-admin_system_settings';
import P_admin_operation_log from '../pages/p-admin_operation_log';
import P_teacher_dashboard from '../pages/p-teacher_dashboard';
import P_teacher_student_list from '../pages/p-teacher_student_list';
import P_teacher_student_detail from '../pages/p-teacher_student_detail';
import P_teacher_academic_management from '../pages/p-teacher_academic_management';
import P_teacher_graduation_management from '../pages/p-teacher_graduation_management';
import P_teacher_report from '../pages/p-teacher_report';
import P_student_dashboard from '../pages/p-student_dashboard';
import P_student_my_profile from '../pages/p-student_my_profile';
import P_student_profile_edit from '../pages/p-student_profile_edit';
import P_student_graduation_fill from '../pages/p-student_graduation_fill';
import P_student_document_view from '../pages/p-student_document_view';
import P_student_task_list from '../pages/p-student_task_list';
import P_student_course_schedule from '../pages/p-student_course_schedule';
import P_student_task_progress from '../pages/p-student_task_progress';
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
        <P_admin_dashboard />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/admin-user-management',
    element: (
      <ErrorBoundary>
        <P_admin_user_management />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/admin-role-permission',
    element: (
      <ErrorBoundary>
        <P_admin_role_permission />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/admin-system-settings',
    element: (
      <ErrorBoundary>
        <P_admin_system_settings />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/admin-operation-log',
    element: (
      <ErrorBoundary>
        <P_admin_operation_log />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/teacher-dashboard',
    element: (
      <ErrorBoundary>
        <P_teacher_dashboard />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/teacher-student-list',
    element: (
      <ErrorBoundary>
        <P_teacher_student_list />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/teacher-student-detail',
    element: (
      <ErrorBoundary>
        <P_teacher_student_detail />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/teacher-academic-management',
    element: (
      <ErrorBoundary>
        <P_teacher_academic_management />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/teacher-graduation-management',
    element: (
      <ErrorBoundary>
        <P_teacher_graduation_management />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/teacher-report',
    element: (
      <ErrorBoundary>
        <P_teacher_report />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/student-dashboard',
    element: (
      <ErrorBoundary>
        <P_student_dashboard />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/student-my-profile',
    element: (
      <ErrorBoundary>
        <P_student_my_profile />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/student-profile-edit',
    element: (
      <ErrorBoundary>
        <P_student_profile_edit />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/student-graduation-fill',
    element: (
      <ErrorBoundary>
        <P_student_graduation_fill />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/student-document-view',
    element: (
      <ErrorBoundary>
        <P_student_document_view />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/student-task-list',
    element: (
      <ErrorBoundary>
        <P_student_task_list />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/student-course-schedule',
    element: (
      <ErrorBoundary>
        <P_student_course_schedule />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/student-task-progress',
    element: (
      <ErrorBoundary>
        <P_student_task_progress />
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