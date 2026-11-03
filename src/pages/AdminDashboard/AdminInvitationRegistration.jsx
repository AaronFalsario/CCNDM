import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardSkeleton from '../../components/DashboardSkeleton';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';

const initialForm = {
  adminId: '',
  fullName: '',
  email: '',
};

export default function AdminInvitationRegistration() {
  const { user: admin, loading } = useAuth('admin');
  const [form, setForm] = useState(initialForm);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';
  const labelClass = 'mb-2 block text-sm font-semibold text-slate-700';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setInvitation(null);
    setSaving(true);
    try {
      const result = await api.post('/api/admin/admins', form);
      setInvitation({
        message: result.message,
        invitationUrl: result.invitationUrl || null,
      });
      setForm(initialForm);
    } catch (requestError) {
      setError(requestError.message || 'Could not create the administrator invitation.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !admin) return <DashboardSkeleton variant="admin" />;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 font-sans">
      <section className="mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
        <header className="bg-gradient-to-r from-blue-700 to-indigo-700 px-7 py-8 text-white sm:px-10">
          <Link to="/admin/dashboard" className="text-sm font-semibold text-blue-100 hover:text-white">
            &larr; Back to admin dashboard
          </Link>
          <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-blue-100">Admin only</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Invite an administrator</h1>
          <p className="mt-2 text-sm leading-6 text-blue-100">
            Send a secure, one-time link. The invited administrator will choose her own password.
          </p>
        </header>

        <div className="space-y-6 px-7 py-8 sm:px-10">
          {invitation && (
            <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
              <h2 className="font-bold">{invitation.invitationUrl ? 'Invitation ready' : 'Invitation sent'}</h2>
              <p className="mt-1 text-sm">{invitation.message}</p>
              {invitation.invitationUrl && (
                <a
                  href={invitation.invitationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex break-all rounded-lg bg-white px-3 py-2 text-xs font-medium text-blue-700 underline decoration-blue-700/50 underline-offset-2"
                >
                  {invitation.invitationUrl}
                </a>
              )}
              <p className="mt-3 text-xs">
                The link expires in 24 hours and can only be used once. The account becomes active after a password is set.
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
              <label htmlFor="admin-id" className={labelClass}>Admin ID</label>
              <input
                id="admin-id"
                name="adminId"
                autoComplete="off"
                minLength={3}
                maxLength={40}
                pattern="[A-Za-z0-9._-]{3,40}"
                title="Use 3 to 40 letters, numbers, periods, underscores, or hyphens."
                className={inputClass}
                value={form.adminId}
                onChange={(event) => setForm({ ...form, adminId: event.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="admin-name" className={labelClass}>Full name</label>
              <input
                id="admin-name"
                name="fullName"
                autoComplete="name"
                minLength={2}
                maxLength={160}
                className={inputClass}
                value={form.fullName}
                onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="admin-email" className={labelClass}>Email address</label>
              <input
                id="admin-email"
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
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Sending invitation...' : 'Send admin invitation'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
