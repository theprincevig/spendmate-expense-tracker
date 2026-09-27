import { Loader, MailCheck, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuthStore } from "../../store/useAuthStore";
import AuthLayout from "../../components/layouts/AuthLayout";

const RESEND_COOLDOWN = 30; // keep in sync with backend OTP_COOLDOWN
export default function VerifyEmail() {
    const {
        authUser,
        verifyEmail,
        isVerifing,
        resendVerifyEmail
    } = useAuthStore();

    // console.log(authUser);

    const [code, setCode] = useState([ "", "", "", "", "", "" ]);
    const [isResending, setIsResending] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    const inputRefs = useRef([]);
    const navigate = useNavigate();

    // Tick down the cooldown every second
    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => {
            setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    const handleChange = (value, idx) => {
        // Only allow one digit
        if (!/^\d?$/.test(value)) return;

        const newCode = [...code];
        newCode[idx] = value;
        setCode(newCode);

        // Move to next input
        if (value && idx < code.length - 1) {
            inputRefs.current[idx + 1]?.focus();
        }
    };

    const handleKeyDown = (e, idx) => {
        // Move back when deleting an empty box
        if (e.key === "Backspace" && !code[idx] && idx > 0) {
            inputRefs.current[idx - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();

        const pastedCode = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6);

        if (!pastedCode) return;

        const newCode = [...code];

        pastedCode.split("").forEach((digit, index) => {
            newCode[index] = digit;
        });

        setCode(newCode);

        const nextIndex = Math.min(pastedCode.length, 5);
        inputRefs.current[nextIndex]?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const otp = code.join("");
        if (otp.length !== 6) return;

        try {
            await verifyEmail(authUser?.email, otp);
            setCode(["", "", "", "", "", ""]);
            navigate("/dashboard");
            toast.success("Welcome to SpendMate!");
            
        } catch (error) {
            console.error(error.error);
            toast.error(error.error || "Failed to verified email.");
        }

    };

    const handleResend = async () => {
        if (!authUser?.email || isResending || cooldown > 0) return;

        setIsResending(true);

        try {
            await resendVerifyEmail(authUser.email);
            setCode(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
            setCooldown(RESEND_COOLDOWN);

        } catch (error) {
            // Backend sends retryAfter on 429 (cooldown or max-limit)
            const retryAfter = error?.retryAfter;
            if (retryAfter) setCooldown(retryAfter);

            console.error(error.error);
            toast.error(error.error || "Failed to resend code. Please try again.");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <AuthLayout>
            <div className="w-full lg:w-[70%] flex flex-col justify-center">
                <div className='flex items-center gap-3 mb-7'>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl brand-gradient text-white">
                        <ShieldCheck size={22} />
                    </span>
                    
                    <div>
                        <h3 className="text-2xl md:text-3xl font-[Genos] font-semibold tracking-tight text-(--text-primary)">
                            Verify Your Email
                        </h3>
                        <p className="text-xs text-(--text-secondary)">
                            Enter the code we sent to your email to continue securely
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="glass card"
                >
                    {/* Info Banner */}
                    <div className="glass verify-banner verify-banner-pending">
                        <MailCheck size={18} className="mt-0.5 shrink-0" />

                        <p className="text-xs md:text-sm font-[Basic] tracking-wide">
                            We sent a 6-digit verification code to{" "}
                            <span className="font-medium text-(--text-primary)">
                                {authUser?.email || "email required!"}
                            </span>
                        </p>
                    </div>

                    {/* OTP */}
                    <div className="otp-group">
                        {code.map((digit, idx) => (
                            <input
                                key={idx}
                                ref={(el) => {
                                    inputRefs.current[idx] = el;
                                }}
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={1}
                                value={digit}
                                onChange={(e) =>
                                    handleChange(e.target.value, idx)
                                }
                                onKeyDown={(e) =>
                                    handleKeyDown(e, idx)
                                }
                                onPaste={handlePaste}
                                className={`
                                    glass-strong otp-box 
                                    ${digit ? "otp-box-filled" : ""}
                                `}
                            />
                        ))}
                    </div>

                    {/* Timer / Resend */}
                    <div className="resend-timer text-xs my-2">
                        {cooldown > 0 ? (
                            <span>Resend code in {cooldown}s</span>
                        ) : (
                            <>
                                Didn't receive the code?{" "}
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    className="resend-link"
                                    disabled={isResending}
                                >
                                    {isResending ? "Sending..." : "Resend code"}
                                </button>
                            </>
                        )}
                    </div>

                    {/* Verify Button */}
                    <button
                        type="submit"
                        disabled={isVerifing || code.join("").length !== 6}
                        className="auth-btn"
                    >
                        {isVerifing 
                            ? <Loader size={20} className="animate-spin mx-auto" /> 
                            : "Verify Email"
                        }
                    </button>
                </form>
            </div>
        </AuthLayout>
    );
}