import { Lock } from "lucide-react";

/* ==================================================
   Mock Field
   Renders a masked password row, a plain text row,
   or an OTP row depending on the field shape
   ================================================== */

export const MockField = ({ field }) => {
    return (
        <div className="glass rounded-xl px-3 py-2.5">
            <p className="text-[10px] text-(--text-secondary) mb-1">
                {field.label}
            </p>

            {field.otp ? (
                <div className="flex gap-1.5">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className={`
                                w-6 h-7
                                rounded-md
                                flex items-center justify-center
                                text-xs
                                font-semibold
                                text-(--text-primary)
                                ${i < 4 ? "glass-strong" : "glass"}
                            `}
                        >
                            {i < 4 ? Math.floor(Math.random() * 9) + 1 : ""}
                        </div>
                    ))}
                </div>
            ) : field.masked ? (
                <div className="flex items-center gap-1.5">
                    <Lock size={12} className="text-(--text-secondary)" />
                    <div className="flex gap-1">
                        {Array.from({ length: field.filled }).map((_, i) => (
                            <span
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-(--text-primary)/70"
                            />
                        ))}
                        <span className="w-0.5 h-3 bg-(--text-primary)/60 animate-pulse ml-0.5" />
                    </div>
                </div>
            ) : (
                <p className="text-sm font-[Basic] text-(--text-primary)">
                    {field.value}
                    <span className="inline-block w-0.5 h-3.5 bg-(--text-primary)/60 align-middle animate-pulse ml-0.5" />
                </p>
            )}
        </div>
    );
};
