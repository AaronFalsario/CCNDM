import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Toast from '../../components/Toast';
import './AdminLogin.css';

export default function AdminLogin() {
    const navigate = useNavigate();

    // ----- form state -----
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);

    // ----- forgot-password modal state -----
    const [showForgot, setShowForgot] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);

    // ----- toast state -----
    const [toast, setToast] = useState(null); // { message, type, title }

    const showToast = (message, type = 'info', title = null) => {
        setToast({ message, type, title });
    };

    // ============ SESSION CHECK ON MOUNT ============
    useEffect(() => {
        const init = async () => {
            const hasSession = await checkExistingSession();
            if (hasSession) {
                navigate('/admin/dashboard', { replace: true });
                return;
            }

            const remembered = localStorage.getItem('rememberedAdmin');
            if (remembered) {
                setUsername(remembered);
                setRememberMe(true);
            }
        };
        init();
    }, [navigate]);

    const checkExistingSession = async () => {
        const storedAdmin = localStorage.getItem('currentAdmin');
        if (!storedAdmin) return false;

        try {
            const expiry = localStorage.getItem('adminSessionExpiry');
            if (expiry && new Date(expiry) < new Date()) {
                localStorage.removeItem('currentAdmin');
                localStorage.removeItem('adminSessionExpiry');
                return false;
            }

            const admin = JSON.parse(storedAdmin);
            const { data, error } = await supabase
                .from('admins')
                .select('id, status, role, full_name')
                .eq('id', admin.id)
                .single();

            if (error || !data || data.status !== 'active') {
                localStorage.removeItem('currentAdmin');
                localStorage.removeItem('adminSessionExpiry');
                return false;
            }
            return true;
        } catch {
            localStorage.removeItem('currentAdmin');
            localStorage.removeItem('adminSessionExpiry');
            return false;
        }
    };

    // ============ LOGIN ============
    const handleLogin = async (e) => {
        e?.preventDefault();

        const u = username.trim();
        const p = password.trim();

        if (!u) return showToast('Enter Admin ID or Email', 'error', 'Missing Field');
        if (!p) return showToast('Enter Password', 'error', 'Missing Field');

        setLoading(true);

        try {
            const { data: admin, error } = await supabase
                .from('admins')
                .select('*')
                .or(`admin_id.ilike.${u},email.ilike.${u}`)
                .maybeSingle();

            if (error || !admin) {
                showToast('Admin not found. Please check your credentials.', 'error', 'Login Failed');
                setLoading(false);
                return;
            }

            if (admin.password_hash !== p) {
                showToast('Wrong password. Please try again.', 'error', 'Authentication Failed');
                setLoading(false);
                return;
            }

            if (admin.status !== 'active') {
                showToast('Your account is inactive. Please contact support.', 'error', 'Account Inactive');
                setLoading(false);
                return;
            }

            // Update last login
            await supabase
                .from('admins')
                .update({ last_login: new Date().toISOString() })
                .eq('id', admin.id);

            // Session (24h)
            const sessionExpiry = new Date();
            sessionExpiry.setHours(sessionExpiry.getHours() + 24);

            const adminSession = {
                id: admin.id,
                admin_id: admin.admin_id,
                full_name: admin.full_name,
                email: admin.email,
                role: admin.role,
                status: admin.status,
                login_time: new Date().toISOString(),
                expires: sessionExpiry.toISOString(),
            };

            localStorage.setItem('currentAdmin', JSON.stringify(adminSession));
            localStorage.setItem('adminSessionExpiry', sessionExpiry.toISOString());

            if (rememberMe) {
                localStorage.setItem('rememberedAdmin', admin.admin_id);
            } else {
                localStorage.removeItem('rememberedAdmin');
            }

            showToast(
                `Welcome back, ${admin.full_name || admin.admin_id}! Redirecting...`,
                'success',
                'Login Successful'
            );

            setTimeout(() => navigate('/admin/dashboard'), 1200);
        } catch (err) {
            console.error(err);
            showToast('Login failed. Please try again.', 'error', 'Error');
            setLoading(false);
        }
    };

    // ============ FORGOT PASSWORD ============
    const handleForgotPassword = async (e) => {
        e?.preventDefault();

        const email = forgotEmail.trim();
        if (!email) return showToast('Please enter your email address', 'error', 'Email Required');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return showToast('Please enter a valid email address', 'error', 'Invalid Email');
        }

        setForgotLoading(true);

        try {
            const { data: admin, error: adminError } = await supabase
                .from('admins')
                .select('email, full_name')
                .eq('email', email)
                .maybeSingle();

            if (adminError || !admin) {
                showToast('No admin account found with this email', 'error', 'Account Not Found');
                setForgotLoading(false);
                return;
            }

            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/Assets/Admin_dashboard/password/password.html`,
            });

            if (resetError) {
                showToast('Failed to send reset email. Please try again.', 'error', 'Reset Failed');
                setForgotLoading(false);
                return;
            }

            showToast(`Password reset link sent to ${email}. Check your inbox!`, 'success', 'Email Sent');
            setForgotEmail('');
            setShowForgot(false);
        } catch (err) {
            console.error(err);
            showToast('An error occurred. Please try again.', 'error', 'Error');
        } finally {
            setForgotLoading(false);
        }
    };

    return (
        <div className="admin-auth-page">
            <div className="card">
                {/* ===== LEFT PANEL ===== */}
                <div className="left">
                    <div className="left-brand">
                        <div className="left-brand-icon">
                            <img
                                src="/Assets/Images/304165957_491516459647524_3858023326832346527_n.png"
                                alt="DOCST Logo"
                            />
                        </div>
                        <div className="left-brand-text">
                            <div className="top">Columban College</div>
                            <div className="btm">Nursing Discipline Monitoring</div>
                        </div>
                    </div>

                    <div className="left-headline">
                        Maintain Integrity &amp;<br />Excellence.
                    </div>
                    <div className="left-sub">
                        The centralized Student Affair Office record tracking system for administrators
                        and students. Secure, transparent and efficient.
                    </div>

                    <div className="left-features">
                        <div className="left-feature">
                            <div className="lf-icon"><i className="fas fa-shield-halved"></i></div>
                            <div>
                                <div className="lf-title">Admin Control</div>
                                <div className="lf-sub">Manage records and cases efficiently.</div>
                            </div>
                        </div>
                        <div className="left-feature">
                            <div className="lf-icon"><i className="fas fa-graduation-cap"></i></div>
                            <div>
                                <div className="lf-title">Student Access</div>
                                <div className="lf-sub">View status and student appeals.</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== RIGHT PANEL ===== */}
                <div className="right">
                    <form className="panel active" onSubmit={handleLogin}>
                        <div className="panel-title">Admin Login</div>
                        <div className="admin-badge">
                            <i className="fas fa-shield-halved"></i> Admin Portal
                        </div>
                        <div className="panel-desc">Restricted access. Authorized personnel only.</div>

                        <div className="admin-info-banner">
                            <div className="ib-title">
                                <i className="fas fa-triangle-exclamation"></i> Restricted Access
                            </div>
                            <div className="ib-sub">
                                This portal is for authorized administrators only. All login attempts
                                are logged.
                            </div>
                        </div>

                        <div className="field">
                            <label>Admin ID or Email</label>
                            <div className="input-wrap">
                                <i className="fas fa-user-shield"></i>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="ADMIN-001 or admin@docst.edu.ph"
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        <div className="field">
                            <label>Password</label>
                            <div className="input-wrap">
                                <i className="fas fa-lock"></i>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="eye-btn"
                                    onClick={() => setShowPassword((v) => !v)}
                                >
                                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </button>
                            </div>
                        </div>

                        <div className="row-check">
                            <label className="check-label">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />{' '}
                                Keep me signed in
                            </label>
                            <a
                                href="#"
                                className="forgot-link"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setShowForgot(true);
                                }}
                            >
                                Forgot Password?
                            </a>
                        </div>

                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Logging in...' : (<>Login <i className="fas fa-arrow-right"></i></>)}
                        </button>
                    </form>
                </div>
            </div>

            {/* ===== FORGOT PASSWORD MODAL ===== */}
            {showForgot && (
                <div className="modal-overlay" onClick={() => setShowForgot(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Reset Password</h3>
                            <button className="modal-close" onClick={() => setShowForgot(false)}>
                                &times;
                            </button>
                        </div>

                        <p className="modal-desc">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>

                        <form onSubmit={handleForgotPassword}>
                            <div className="field">
                                <label>Email Address</label>
                                <div className="input-wrap">
                                    <i className="fas fa-envelope"></i>
                                    <input
                                        type="email"
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                        placeholder="admin@gordoncollege.edu.ph"
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-submit" disabled={forgotLoading}>
                                {forgotLoading ? 'Checking...' : 'Send Reset Link'}
                            </button>

                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={() => setShowForgot(false)}
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== TOAST ===== */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    title={toast.title}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}