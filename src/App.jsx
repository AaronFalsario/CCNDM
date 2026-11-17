import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

const Landing = lazy(() => import('./pages/Landing'));
const StudentLogin = lazy(() => import('./pages/StudentLogin/studentLogin'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard/StudentDashboard'));
const AdminLogin = lazy(() => import('./pages/AdminLogin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard/AdminDashboard'));
const AdminStudentRegistration = lazy(() => import('./pages/AdminDashboard/AdminStudentRegistration'));
const AdminInvitationRegistration = lazy(() => import('./pages/AdminDashboard/AdminInvitationRegistration'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ForgotPassword/ResetPassword'));
const ChangePassword = lazy(() => import('./pages/student/change-password'));

export default function App() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-slate-500">Loading...</div>}>
      <Routes>
        <Route path="/" element={<Landing />} />

        {/* Student */}
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/student/ResetPassword" element={<ResetPassword />} />
        <Route path="/student/accept-invitation" element={<ResetPassword />} />
        <Route path="/student/change-password" element={<ChangePassword />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/students/register" element={<AdminStudentRegistration />} />
        <Route path="/admin/admins/invite" element={<AdminInvitationRegistration />} />
        <Route path="/admin/accept-invitation" element={<ResetPassword />} />
        <Route path="/admin/dashboard/*" element={<AdminDashboard />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
