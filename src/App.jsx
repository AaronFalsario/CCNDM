import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import StudentLogin from './pages/StudentLogin/StudentLogin';
import StudentDashboard from './pages/StudentDashboard/StudentDashboard';
import AdminLogin from './pages/AdminLogin/AdminLogin';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/student/login" element={<StudentLogin />} />
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard/*" element={<AdminDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}