export default function RadioGroup({
    label,
    name,
    options = [],
    value,
    onChange,
    error,
    disabled = false,
}) {
    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label className="block text-sm font-medium text-(--text-primary) mb-2">
                    {label}
                </label>
            )}

            <div className="flex flex-wrap gap-2">
                {options.map((option) => {
                    const checked = value === option.value;

                    return (
                        <label
                            key={option.value}
                            htmlFor={`${name}-${option.value}`}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer
                                transition-colors select-none
                                ${checked
                                    ? "border-income bg-income/10 text-(--text-primary)"
                                    : `
                                        border-transparent text-(--text-secondary) 
                                        hover:border-expense hover:bg-expense/10
                                    `
                                }
                                ${disabled && "opacity-50 pointer-events-none"}
                            `}
                        >
                            <input
                                type="radio"
                                id={`${name}-${option.value}`}
                                name={name}
                                value={option.value}
                                checked={checked}
                                onChange={onChange}
                                disabled={disabled}
                                className="accent-income w-4 h-4"
                            />
                            <span className="text-sm font-medium">{option.label}</span>
                        </label>
                    );
                })}
            </div>

            {/* Error */}
            {error && (
                <div
                    className="
                        absolute
                        -bottom-5
                        left-1
                        font-[Basic]
                        tracking-wide
                        text-xs
                        text-brand-red
                    "
                >
                    {error}
                </div>
            )}
        </div>
    );
}