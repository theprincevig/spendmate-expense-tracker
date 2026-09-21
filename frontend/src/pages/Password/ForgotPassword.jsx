import {
    ArrowLeft,
    CheckCircle2,
    Loader,
    Mail
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { usePasswordStore } from "../../store/usePasswordStore";
import { validateEmail } from "../../lib/validators";

import PasswordLayout from "../../components/layouts/PasswordLayout";
import Input from "../../components/inputs/Input";

export default function ForgotPassword() {
    const { forgotPassLoading, forgotPassword } = usePasswordStore();

    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setEmail(e.target.value);
        if (error) setError("");
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setError("Email is required");
            return;
        }
        if (!validateEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }

        try {
            await forgotPassword(email);
            setEmail("");
            setSubmitted(true);

            toast.success("Send Reset Password email successfully!");

        } catch (error) {
            console.error(error.error);
            toast.error(error.error || "Failed to send mail");
        }
    };
    
    return (
        <PasswordLayout>
            <div className="w-full lg:w-[70%] flex flex-col justify-center">
                <div className='flex items-center gap-3 mb-7'>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl expense-gradient text-white">
                        <Mail size={22} />
                    </span>
                    
                    <div>
                        <h3 className="text-2xl md:text-3xl font-[Genos] font-semibold tracking-tight text-(--text-primary)">
                            Forgot Password
                        </h3>
                        <p className="text-xs text-(--text-secondary)">
                            Get back in, securely and easily
                        </p>
                    </div>
                </div>

                <div className="glass-strong card flex flex-col justify-center items-center">
                    {submitted ? (
                        <div className="flex flex-col justify-center space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-teal/10 text-brand-teal">
                                    <CheckCircle2 size={24} />
                                </span>

                                <h4 className="text-lg font-semibold text-(--text-primary)">
                                    Check your email
                                </h4>
                            </div>

                            <p className="text-sm text-(--text-secondary)">
                                We've sent a password reset link to your inbox. It may take a
                                minute to arrive — don't forget to check spam.
                            </p>

                            <button
                                type="button"
                                onClick={() => setSubmitted(false)}
                                className="text-left text-sm font-medium text-(--text-primary) underline underline-offset-2 cursor-pointer"
                            >
                                Didn't get it? Try again
                            </button>
                        </div>
                    ) : (
                        <form 
                            onSubmit={handleSubmit}
                            className="w-full"
                        >
                            <Input
                                icon={<Mail size={18} />}
                                type="text"
                                label="Email address"
                                value={email}
                                placeholder="mail@site.com"
                                onChange={handleChange}
                                error={error}
                            />

                            <button
                                type="submit"
                                className="auth-btn"
                                disabled={forgotPassLoading}
                            >
                                {forgotPassLoading 
                                    ? <Loader size={20} className="animate-spin mx-auto" /> 
                                    : "Send Reset Link"
                                }
                            </button>
                        </form>
                    )}

                    <Link
                        to="/login"
                        className="w-full flex items-center justify-center md:justify-end gap-1 text-xs md:text-sm font-[Basic] font-medium text-income hover:text-brand-teal transition-colors my-1 md:mr-8"
                    >
                        <ArrowLeft size={14} />
                        Back to login
                    </Link>
                </div>
            </div>
        </PasswordLayout>
    );
}