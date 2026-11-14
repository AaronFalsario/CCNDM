import { useState } from 'react';
import api from '../lib/api';

export default function EmailVerificationField({
  id,
  email,
  onEmailChange,
  purpose,
  inputClass,
  labelClass,
  onVerificationChange,
}) {
  const [verificationId, setVerificationId] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleEmailChange = (event) => {
    setVerificationId('');
    setCode('');
    setMessage('');
    setError('');
    setVerified(false);
    onVerificationChange({ verificationId: '', verified: false });
    onEmailChange(event);
  };

  const handleSendCode = async (event) => {
    const emailInput = event.currentTarget.form?.elements.namedItem(id);
    if (!emailInput?.reportValidity()) return;

    setError('');
    setMessage('');
    setVerificationId('');
    setCode('');
    setVerified(false);
    onVerificationChange({ verificationId: '', verified: false });
    setSending(true);
    try {
      const result = await api.post('/api/admin/email-verifications', {
        email: email.trim().toLowerCase(),
        purpose,
      });
      setVerificationId(result.verificationId);
      setCode('');
      setVerified(false);
      setMessage(result.message);
      onVerificationChange({ verificationId: result.verificationId, verified: false });
    } catch (requestError) {
      setError(requestError.message || 'Could not send an email verification code.');
    } finally {
      setSending(false);
    }
  };

  const handleVerifyCode = async () => {
    setError('');
    setMessage('');
    setChecking(true);
    try {
      const result = await api.post(`/api/admin/email-verifications/${verificationId}/verify`, { code });
      setVerified(true);
      setMessage(result.message);
      onVerificationChange({ verificationId, verified: true });
    } catch (requestError) {
      setError(requestError.message || 'Could not verify this email address.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div>
      <label htmlFor={id} className={labelClass}>Email address</label>
      <input
        id={id}
        name={id}
        type="email"
        autoComplete="email"
        maxLength={254}
        className={inputClass}
        value={email}
        onChange={handleEmailChange}
        disabled={sending || checking}
        required
      />
      <button
        type="button"
        onClick={handleSendCode}
        disabled={sending || checking || verified}
        className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {sending ? 'Sending code...' : verified ? 'Email verified' : verificationId ? 'Resend code' : 'Send verification code'}
      </button>

      {verificationId && !verified && (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            aria-label="6-digit email verification code"
            placeholder="6-digit code"
            className={`${inputClass} sm:max-w-44`}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
            disabled={sending || checking}
            required
          />
          <button
            type="button"
            onClick={handleVerifyCode}
            disabled={checking || sending || code.length !== 6}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {checking ? 'Checking...' : 'Verify email'}
          </button>
        </div>
      )}

      {message && <p role="status" className="mt-2 text-sm text-emerald-700">{message}</p>}
      {error && <p role="alert" className="mt-2 text-sm text-rose-700">{error}</p>}
    </div>
  );
}
