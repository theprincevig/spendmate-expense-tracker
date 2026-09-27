import { CheckCircle2 } from "lucide-react";
import { CYCLE_MS, VARIANTS } from "./PasswordVairants";
import { MockField } from "./MockField";
import { useEffect, useState } from "react";

/* ==================================================
   Password Showcase
   Cycles through change / forgot / reset mock forms
   ================================================== */

export const PasswordShowcase = () => {
    const [active, setActive] = useState(0);

    useEffect(() => {
        const id = setInterval(() => {
            setActive((prev) => (prev + 1) % VARIANTS.length);
        }, CYCLE_MS);

        return () => clearInterval(id);
    }, []);

    const variant = VARIANTS[active];

    return (
        <div className="w-100">
            {/* Tabs */}
            <div className="flex items-center justify-center gap-2 mb-5">
                {VARIANTS.map((v, idx) => (
                    <button
                        key={v.key}
                        onClick={() => setActive(idx)}
                        className={`
                            px-3 py-1.5
                            rounded-full
                            text-[11px]
                            font-[Basic]
                            transition-all
                            duration-300
                            ${idx === active
                                ? "glass-strong text-(--text-primary) font-semibold"
                                : "text-(--text-secondary) hover:text-(--text-primary)"
                            }
                        `}
                    >
                        {v.title.split(" ")[0]}
                    </button>
                ))}
            </div>

            {/* Card */}
            <div
                key={variant.key}
                className="
                    glass-strong
                    rounded-3xl
                    p-6
                    animate-[fadeIn_0.5s_ease]
                "
            >
                {/* Card header */}
                <div className="flex items-center gap-3 mb-5">
                    <div className={`
                        ${variant.iconClass}
                        w-10 h-10
                        shrink-0
                        rounded-full
                        flex items-center justify-center
                        text-white
                    `}>
                        {variant.icon}
                    </div>

                    <div>
                        <p className="
                            text-sm
                            font-[Basic]
                            font-semibold
                            text-(--text-primary)
                        ">
                            {variant.title}
                        </p>
                        <p className="text-[11px] text-(--text-secondary)">
                            {variant.subtitle}
                        </p>
                    </div>
                </div>

                {/* Fields */}
                <div className="flex flex-col gap-3">
                    {variant.fields.map((field) => (
                        <MockField key={field.label} field={field} />
                    ))}
                </div>

                {/* Fake submit */}
                <div className="
                    brand-gradient
                    mt-5
                    h-9
                    rounded-xl
                    flex items-center justify-center
                    gap-2
                    text-white
                    text-xs
                    font-[Basic]
                    font-semibold
                ">
                    <CheckCircle2 size={14} />
                    Continue
                </div>
            </div>
        </div>
    );
};