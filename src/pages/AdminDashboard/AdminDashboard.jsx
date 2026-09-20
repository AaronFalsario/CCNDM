import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Drawer from './components/Drawer';
import Topbar from './components/Topbar';
import NotificationModal from './components/NotificationModal';
import DashboardPage from './pages/DashboardPage';
import PenaltiesPage from './pages/PenaltiesPage';
import StudentsPage from './pages/StudentsPage';
import AppealsPage from './pages/AppealsPage';
import ReportsPage from './pages/ReportsPage';
import useNotifications from '../../hooks/useNotifications';
import './AdminDashboard.css';

const LOGIN_URL = '/admin/login';
const PAGE_KEY = 'adminCurrentPage';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(null);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [darkMode, setDarkMode] = useState(
        () => localStorage.getItem('theme') === 'dark'
    );

    const notifications = useNotifications();

    // Session check
    useEffect(() => {
        const stored = localStorage.getItem('currentAdmin');
        if (!stored) {
            navigate(LOGIN_URL, { replace: true });
            return;
        }
        try {
            const parsed = JSON.parse(stored);
            if (!parsed?.id) throw new Error('Invalid session');
            setAdmin(parsed);
        } catch {
            localStorage.removeItem('currentAdmin');
            navigate(LOGIN_URL, { replace: true });
        }
    }, [navigate]);

    // Restore last page
    useEffect(() => {
        const saved = localStorage.getItem(PAGE_KEY);
        if (saved) setCurrentPage(saved);
    }, []);

    // Dark mode
    useEffect(() => {
        document.body.classList.toggle('dark-mode', darkMode);
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    const handleNavigate = (page) => {
        setCurrentPage(page);
        localStorage.setItem(PAGE_KEY, page);
        if (window.innerWidth <= 768) setDrawerOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('currentAdmin');
        localStorage.removeItem('adminSessionExpiry');
        localStorage.removeItem('rememberedAdmin');
        localStorage.removeItem(PAGE_KEY);
        navigate(LOGIN_URL, { replace: true });
    };

    if (!admin) return null;

    return (
        <div className="admin-dashboard">
            <Drawer
                open={drawerOpen}
                currentPage={currentPage}
                onNavigate={handleNavigate}
                onClose={() => setDrawerOpen(false)}
                admin={admin}
                onLogout={handleLogout}
            />

            <Topbar
                admin={admin}
                darkMode={darkMode}
                unreadCount={notifications.unreadCount}
                onToggleTheme={() => setDarkMode((v) => !v)}
                onOpenNotifications={() => setShowNotifications(true)}
                onToggleDrawer={() => setDrawerOpen((v) => !v)}
                currentPage={currentPage}
            />

            <main className="dashboard-main">
                {currentPage === 'dashboard' && <DashboardPage admin={admin} />}
                {currentPage === 'penalties' && <PenaltiesPage admin={admin} />}
                {currentPage === 'students' && <StudentsPage admin={admin} />}
                {currentPage === 'appeals' && <AppealsPage admin={admin} />}
                {currentPage === 'reports' && <ReportsPage admin={admin} />}
            </main>

            <NotificationModal
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
                notifications={notifications}
            />
        </div>
    );
}