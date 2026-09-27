import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Input({
    icon,
    type,
    label,
    value,
    placeholder,
    onChange,
    error
}) {
    const [showPassword, setShowPassword] = useState(false);

    function toggleShowPassword() {
        setShowPassword((prev) => !prev);
    }

    return (
        <div className="relative mb-8">

            <label className="block text-sm font-medium text-(--text-primary) mb-2">
                {label}
            </label>

            <div
                className={`
                    glass input-box
                    mb-0!
                    ${error ? "input-box-error" : ""}
                `}
            >

                {/* Input Icon */}
                <span
                    className={`
                        shrink-0
                        transition-colors duration-200
                        ${error
                            ? "text-brand-red/70"
                            : "text-(--text-secondary)"
                        }
                    `}
                >
                    {icon}
                </span>


                {/* Input */}
                <input
                    type={
                        type === "password"
                            ? showPassword
                                ? "text"
                                : "password"
                            : type
                    }
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e)}
                    className="
                        w-full
                        bg-transparent
                        outline-none
                        text-sm
                        text-(--text-primary)
                        placeholder:text-(--text-muted)
                    "
                />


                {/* Password Toggle */}
                {type === "password" && (
                    <button
                        type="button"
                        onClick={toggleShowPassword}
                        className="
                            shrink-0
                            flex items-center justify-center
                            text-(--text-muted)
                            hover:text-(--text-secondary)
                            transition-colors
                            cursor-pointer
                        "
                        aria-label={
                            showPassword
                                ? "Hide password"
                                : "Show password"
                        }
                    >
                        {showPassword ? (
                            <Eye size={18} />
                        ) : (
                            <EyeOff size={18} />
                        )}
                    </button>
                )}

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