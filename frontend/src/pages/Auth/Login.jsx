import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, Loader, Mail } from "lucide-react";
import toast from "react-hot-toast";

import { hasErrors } from "../../errors/errors";
import { useAuthStore } from "../../store/useAuthStore";
import { validateLogin } from "../../errors/auth.error";

import AuthLayout from "../../components/layouts/AuthLayout";
import Input from "../../components/inputs/Input";

export default function Login() {
    const data = { email: "", password: "" };
    
    const { isLoggingIn, login } = useAuthStore();

    const [formData, setFormData] = useState(data);
    const [errors, setErrors] = useState(data);
    const navigate = useNavigate();

    const handleChange = (field) => (e) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        setErrors(prev => ({ ...prev, [field]: "" }));
    };

    // Handle login form submit
    async function handleSubmit(e) {
        e.preventDefault();

        if (isLoggingIn) return;

        const newErrors = validateLogin(formData);
        if (hasErrors(newErrors)) return setErrors(newErrors);

        try {
            await login(formData);
            setFormData(data);
            navigate("/dashboard");
            toast.success("Welcome back to SpendMate!");

        } catch (error) {
            console.error(error.error);
            toast.error(error.error || "Failed to login");
        }
    }

    return (
        <AuthLayout>
            <div className="w-full lg:w-[70%] flex flex-col justify-center">
                <div className='mb-7'>
                    <h3 className="text-2xl md:text-3xl font-[Genos] font-semibold tracking-tight text-(--text-primary)">
                        Welcome Back
                    </h3>
                    <p className="text-xs text-(--text-secondary)">
                        Please enter your details to login
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

                    {/* Forgot password */}
                    <div className="text-left px-2 my-1">
                        <Link 
                            to={"/password/forgot"}
                            className="text-xs font-medium text-income 
                            hover:text-brand-teal hover:underline transition-all"
                        >
                            Forgotten password?
                        </Link>
                    </div>

                    <button 
                        type="submit"
                        className="auth-btn"
                        disabled={isLoggingIn}
                    >
                        { isLoggingIn ? <Loader size={20} className="animate-spin" /> : "LOGIN" }
                    </button>

                    <p className="text-[13px] text-(--text-secondary) mt-4 text-center">
                        Don't have an Account?{" "}
                        <Link 
                            to="/signup"
                            className="font-[Basic] font-medium text-income 
                            hover:text-brand-teal hover:underline transition-colors"
                        >
                            Signup
                        </Link>
                    </p>
                </form>
            </div>
        </AuthLayout>
    );
}