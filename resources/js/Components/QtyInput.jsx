import { useEffect, useState } from 'react';

/**
 * A whole-number box that can be typed into freely.
 *
 * While you type, the box keeps what you typed (so you can clear it and type a new number);
 * every valid number is passed on at once so totals update live. When you leave the box
 * (or press Enter), an empty or too-small entry becomes `min`.
 */
export default function QtyInput({ value, onCommit, min = 1, className = '', ...rest }) {
    const [draft, setDraft] = useState(String(value));
    const [focused, setFocused] = useState(false);

    // Follow changes that come from elsewhere (the − / + buttons, quick buttons), but never while typing
    useEffect(() => {
        if (!focused) setDraft(String(value));
    }, [value, focused]);

    function finish() {
        const n = Math.floor(Number(draft));
        const next = Number.isFinite(n) && n >= min ? n : min;

        setFocused(false);
        setDraft(String(next));
        if (next !== value) onCommit(next);
    }

    return (
        <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={draft}
            onFocus={(e) => {
                setFocused(true);
                e.target.select();
            }}
            onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '');
                setDraft(digits);

                if (digits !== '' && Number(digits) >= min) onCommit(Number(digits));
            }}
            onBlur={finish}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    e.currentTarget.blur();
                }
            }}
            className={className}
            {...rest}
        />
    );
}
