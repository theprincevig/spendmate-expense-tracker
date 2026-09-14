import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, Loader, Mail } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { hasErrors } from "../../errors/errors";
import { useAuthStore } from "../../store/useAuthStore";
import { validateSignup } from '../../errors/auth.error';

import PasswordStrengthMeter from "../../components/inputs/PasswordStrengthMeter";
import AuthLayout from "../../components/layouts/AuthLayout";
import Input from "../../components/inputs/Input";

export default function Signup() {
    const data = { email: "", password: "" };

    const { isSigningUp, signup } = useAuthStore();

    const [formData, setFormData] = useState(data);
    const [errors, setErrors] = useState(data);
    const navigate = useNavigate();

    const handleChange = (field) => (e) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        setErrors(prev => ({ ...prev, [field]: "" }));
    };

    async function handleSubmit(e) {
        e.preventDefault();

        if (isSigningUp) return;

        const newErrors = validateSignup(formData);
        if (hasErrors(newErrors)) return setErrors(newErrors);

        try {
            await signup(formData);
            setFormData(data);
            navigate("/dashboard");
            toast.success("Welcome to Spendmate!");

        } catch (error) {
            console.error(error.error);
            toast.error(error.error || "Failed to sign up.");
        }
    };

    return (
        <AuthLayout>
            <div className="w-full lg:w-[70%] flex flex-col justify-center">
                {/* Heading */}
                <div className='mb-7'>
                    <h3 className="text-2xl md:text-3xl font-[Genos] font-semibold tracking-tight text-(--text-primary)">
                        Create an Account
                    </h3>
                    <p className="text-xs text-(--text-secondary)">
                        Join us today by entering your details below.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Input 
                        icon={<Mail size={18} />}
                        type="text"
                        label="Email"
                        value={formData.email}
                        placeholder="mail@site.com"
                        onChange={handleChange("email")}
                        error={errors.email}
                    />

                    <Input 
                        icon={<KeyRound size={18} />}
                        type="password"
                        label="Password"
                        value={formData.password}
                        placeholder="Enter password"
                        onChange={handleChange("password")}
                        error={errors.password}
                    />

                    {/* Password Strength Meter - Only show if password is not empty */}
                    <div
                        className="overflow-hidden transition-all duration-300 ease-in-out"
                        style={{
                            maxHeight: formData.password 
                                ? "200px" 
                                : "0px", // adjust according to your PasswordStrengthMeter height
                        }}
                    >
                        <div
                            className="transform origin-top transition-transform duration-300 ease-in-out"
                            style={{
                                transform: formData.password 
                                    ? "scaleY(1)" 
                                    : "scaleY(0)",
                            }}
                        >
                            <PasswordStrengthMeter password={formData.password} />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="auth-btn"
                        disabled={isSigningUp}
                    >
                        { isSigningUp ? <Loader size={20} className="animate-spin" /> : "SIGN UP" }
                    </button>

                    <p className="text-[13px] mt-4 text-(--txt-secondary) text-center">
                        If Already have an Account?{" "}
                        <Link 
                            to="/login"
                            className="font-[Basic] font-medium text-income hover:text-brand-teal transition-colors"
                        >
                            Login
                        </Link>
                    </p>
                </form>
            </div>
        </AuthLayout>
    );
}