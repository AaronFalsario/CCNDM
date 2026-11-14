import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardSkeleton from '../../components/DashboardSkeleton';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';

const initialForm = {
  studentId: '',
  name: '',
  email: '',
  course: 'BS Nursing',
  yearLevel: '1st Year',
};

export default function AdminStudentRegistration() {
  const { user: admin, loading } = useAuth('admin');
  const [form, setForm] = useState(initialForm);
  const [createdAccount, setCreatedAccount] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';
  const labelClass = 'mb-2 block text-sm font-semibold text-slate-700';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setCreatedAccount(null);
    setSaving(true);
    try {
      const result = await api.post('/api/admin/students', form);
      setCreatedAccount({
        message: result.message,
        invitationUrl: result.invitationUrl || null,
      });
      setForm(initialForm);
    } catch (requestError) {
      setError(requestError.message || 'Could not create the student account.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !admin) return <DashboardSkeleton variant="admin" />;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 font-sans">
      <section className="mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
        <header className="bg-gradient-to-r from-blue-700 to-indigo-700 px-7 py-8 text-white sm:px-10">
          <Link to="/admin/dashboard" className="text-sm font-semibold text-blue-100 hover:text-white">
            &larr; Back to admin dashboard
          </Link>
          <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-blue-100">Admin only</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Register a student</h1>
          <p className="mt-2 text-sm leading-6 text-blue-100">
            Create an account for a verified student. Their invitation link will be sent to the email address provided.
          </p>
        </header>

        <div className="space-y-6 px-7 py-8 sm:px-10">
          {createdAccount && (
            <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
              <h2 className="font-bold">{createdAccount.invitationUrl ? 'Invitation ready' : 'Invitation sent'}</h2>
              <p className="mt-1 text-sm">{createdAccount.message}</p>
              {createdAccount.invitationUrl && (
                <a
                  href={createdAccount.invitationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex break-all rounded-lg bg-white px-3 py-2 text-xs font-medium text-blue-700 underline decoration-blue-700/50 underline-offset-2"
                >
                  {createdAccount.invitationUrl}
                </a>
              )}
              <p className="mt-3 text-xs">
                The student will choose a password through the invitation link, then see their Student ID and password once before signing in.
              </p>
            </div>
          )}

          {error && (
            <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="student-id" className={labelClass}>Student ID</label>
              <input
                id="student-id"
                name="studentId"
                inputMode="numeric"
                pattern="\d{8}"
                maxLength={8}
                autoComplete="off"
                className={inputClass}
                value={form.studentId}
                onChange={(event) => setForm({ ...form, studentId: event.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="student-name" className={labelClass}>Full name</label>
              <input
                id="student-name"
                name="name"
                autoComplete="name"
                maxLength={160}
                className={inputClass}
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="student-email" className={labelClass}>Email address</label>
              <input
                id="student-email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={254}
                className={inputClass}
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="student-course" className={labelClass}>Course</label>
                <input
                  id="student-course"
                  name="course"
                  maxLength={120}
                  className={inputClass}
                  value={form.course}
                  onChange={(event) => setForm({ ...form, course: event.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="student-year" className={labelClass}>Year level</label>
                <select
                  id="student-year"
                  name="yearLevel"
                  className={inputClass}
                  value={form.yearLevel}
                  onChange={(event) => setForm({ ...form, yearLevel: event.target.value })}
                  required
                >
                  {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Creating account...' : 'Create student account'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
