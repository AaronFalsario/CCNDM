const checks = [
    { label: 'At least 8 characters', test: (password) => password.length >= 8 },
    { label: '12 or more characters for stronger protection', test: (password) => password.length >= 12 },
    { label: 'A lowercase letter', test: (password) => /[a-z]/.test(password) },
    { label: 'An uppercase letter', test: (password) => /[A-Z]/.test(password) },
    { label: 'A number', test: (password) => /\d/.test(password) },
    { label: 'A symbol', test: (password) => /[^A-Za-z0-9]/.test(password) },
];

const strengthLevels = [
    { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-700' },
    { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-700' },
    { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-700' },
    { label: 'Fair', color: 'bg-amber-500', text: 'text-amber-700' },
    { label: 'Good', color: 'bg-blue-500', text: 'text-blue-700' },
    { label: 'Good', color: 'bg-blue-500', text: 'text-blue-700' },
    { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-700' },
];

export default function PasswordStrength({ password }) {
    const score = checks.filter(({ test }) => test(password)).length;
    const level = password ? strengthLevels[score] : null;
    const suggestions = checks.filter(({ test }) => !test(password));

    return (
        <div className="mt-2 space-y-2" aria-live="polite">
            <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">Password strength</span>
                <span className={level?.text || 'text-slate-500'}>
                    {level?.label || 'Enter a password'}
                </span>
            </div>
            <div
                className="flex gap-1"
                role="meter"
                aria-label="Password strength"
                aria-valuemin={0}
                aria-valuemax={checks.length}
                aria-valuenow={score}
                aria-valuetext={level?.label || 'Not entered'}
            >
                {checks.map((check, index) => (
                    <span
                        key={check.label}
                        className={`h-1.5 flex-1 rounded-full ${
                            level && index < score ? level.color : 'bg-slate-200'
                        }`}
                    />
                ))}
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
                {suggestions.length
                    ? `To improve: ${suggestions.map(({ label }) => label.toLowerCase()).join(', ')}.`
                    : 'Strong password. Avoid reusing it on other sites.'}
            </p>
        </div>
    );
}
