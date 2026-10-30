import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../lib/api';
import logo from '../../assets/CC.png';

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('Verifying your email address...');
  const [studentIdInput, setStudentIdInput] = useState('');
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No confirmation token provided. Please check the link from your email.');
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        const response = await api.post('/api/auth/student/confirm-email', { token });
        if (isMounted) {
          setStatus('success');
          setMessage(response?.message || 'Your email has been confirmed! You can now log in to the CCNDM Student Portal.');
        }
      } catch (err) {
        if (isMounted) {
          setStatus('error');
          setMessage(err.message || 'The confirmation link is invalid, expired, or has already been used.');
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!studentIdInput || !/^\d{8}$/.test(studentIdInput.trim())) {
      setResendStatus({ type: 'error', message: 'Enter a valid 8-digit Student ID' });
      return;
    }

    setResending(true);
    setResendStatus(null);
    try {
      const res = await api.post('/api/auth/student/resend-confirmation', {
        studentId: studentIdInput.trim(),
      });
      setResendStatus({
        type: 'success',
        message: res?.message || 'A new confirmation email has been sent. Please check your inbox.',
      });
    } catch (err) {
      setResendStatus({
        type: 'error',
        message: err.message || 'Unable to resend confirmation email.',
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-slate-100 flex flex-col items-center text-center">
        {/* LOGO */}
        <div className="w-20 h-20 bg-blue-50 rounded-2xl p-3 flex items-center justify-center mb-6 shadow-sm border border-blue-100">
          <img src={logo} alt="Columban College Logo" className="w-full h-full object-contain" />
        </div>

        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">COLUMBAN COLLEGE</h1>
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mt-1 mb-6">
          Nursing Discipline Monitoring
        </p>

        {status === 'loading' && (
          <div className="py-8 flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <h2 className="text-lg font-bold text-slate-800">Verifying Your Email</h2>
            <p className="text-sm text-slate-500 mt-2">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-4 flex flex-col items-center w-full">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800">Email Verified!</h2>
            <p className="text-sm text-slate-600 mt-2 mb-6 leading-relaxed">
              {message}
            </p>
            <button
              onClick={() => navigate('/student/login')}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Go to Student Login →
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="py-4 flex flex-col items-center w-full">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800">Verification Issue</h2>
            <p className="text-sm text-slate-600 mt-2 mb-6 leading-relaxed">
              {message}
            </p>

            {/* RESEND FORM */}
            <form onSubmit={handleResend} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5 text-left">
              <label htmlFor="student-id-resend" className="block text-xs font-bold text-slate-700 mb-1.5">
                Need a new confirmation link?
              </label>
              <div className="flex gap-2">
                <input
                  id="student-id-resend"
                  type="text"
                  placeholder="8-digit Student ID"
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  maxLength={8}
                  className="flex-1 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={resending}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition"
                >
                  {resending ? 'Sending...' : 'Resend'}
                </button>
              </div>
              {resendStatus && (
                <p className={`text-xs mt-2 ${resendStatus.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
                  {resendStatus.message}
                </p>
              )}
            </form>

            <Link
              to="/student/login"
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition"
            >
              ← Back to Student Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

