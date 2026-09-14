import { Check, X } from "lucide-react";
import { useMemo } from "react";

const PasswordCriteria = ({ password }) => {
    const criteria = useMemo(
        () => [
            {
                label: "Minimum 8 characters",
                met: password.length >= 8,
            },
            {
                label: "Includes uppercase letter (A–Z)",
                met: /[A-Z]/.test(password),
            },
            {
                label: "Includes lowercase letter (a–z)",
                met: /[a-z]/.test(password),
            },
            {
                label: "Contains a number (0–9)",
                met: /\d/.test(password),
            },
            {
                label: "Has special character (!@#$...)",
                met: /[!@#$%^&*(),.?":{}/<>]/.test(password),
            },
        ],
        [password]
    );

    return (
        <div className="mt-3 space-y-1.5">
            {criteria.map((item) => (
                <div
                    key={item.label}
                    className="pw-criteria-row"
                    data-met={item.met}
                >
                    {item.met ? (
                        <Check className="size-4 mr-2 shrink-0" />
                    ) : (
                        <X className="size-4 mr-2 shrink-0 text-(--text-muted)" />
                    )}

                    <span>{item.label}</span>
                </div>
            ))}
        </div>
    );
};

export default function PasswordStrengthMeter({ password }) {
    const getStrength = (pass) => {
        let strength = 0;

        if (pass.length >= 8) strength += 1;
        if (/[A-Z]/.test(pass)) strength += 1;
        if (/[a-z]/.test(pass)) strength += 1;
        if (/\d/.test(pass)) strength += 1;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) strength += 1;

        return Math.min(strength, 5);
    };

    const strength = getStrength(password);

    const getLevel = (strength) => {
        if (strength <= 1) return "weak";
        if (strength === 2) return "fair";
        if (strength === 3) return "strong";
        return "excellent";
    };

    const getStrengthLabel = (strength) => {
        if (strength === 0) return "Very Weak";
        if (strength === 1) return "Weak";
        if (strength === 2) return "Moderate";
        if (strength === 3) return "Strong";
        return "Excellent";
    };

    const level = getLevel(strength);

    return (
        <div className="mt-1 px-2 py-3">
            {/* Password Strength Header */}
            <div className="pw-meter-header">
                <span className="text-(--text-secondary)">
                    Password Strength
                </span>

                <span 
                    className="pw-meter-label"
                    data-level={level}
                >
                    {getStrengthLabel(strength)}
                </span>
            </div>

            {/* Strength Progress */}
            <div className="pw-meter-track">
                <div
                    className="pw-meter-fill"
                    data-level={level}
                    style={{ width: `${(strength / 5) * 100}%` }}
                />
            </div>

            {/* Password Criteria */}
            <PasswordCriteria password={password} />
        </div>
    );
}