import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function PasswordInput({
    id,
    name = 'password',
    value,
    placeholder = 'Password',
    autoComplete,
    autoFocus = false,
    onChange,
    className = '',
    required = false,
}) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative flex w-full items-center">
            <input
                id={id}
                type={showPassword ? 'text' : 'password'}
                name={name}
                value={value}
                placeholder={placeholder}
                autoComplete={autoComplete}
                autoFocus={autoFocus}
                onChange={onChange}
                required={required}
                className={`w-full pr-10 ${className}`}
            />
            <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                className="absolute right-3 flex items-center text-[#6B7280] transition-colors hover:text-[#111827] focus:outline-none"
                tabIndex={-1}
            >
                {showPassword ? (
                    <EyeOff size={18} strokeWidth={2} aria-hidden="true" />
                ) : (
                    <Eye size={18} strokeWidth={2} aria-hidden="true" />
                )}
            </button>
        </div>
    );
}
