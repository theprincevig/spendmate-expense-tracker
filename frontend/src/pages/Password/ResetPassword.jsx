import { KeyRound, ShieldCheck } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";

import { usePasswordStore } from "../../store/usePasswordStore";
import { validateResetPassword } from "../../errors/password.error";
import { hasErrors } from "../../errors/errors";

import PasswordLayout from "../../components/layouts/PasswordLayout";
import PasswordStrengthMeter from "../../components/inputs/PasswordStrengthMeter";
import Input from "../../components/inputs/Input";

export default function ResetPassword() {
    const initState = {
        new: "",
        confirm: ""
    };

    const { resetPassLoading, resetPassword } = usePasswordStore();
    const token = useParams();

    const [password, setPassword] = useState(initState);
    const [errors, setErrors] = useState(initState);
    const navigate = useNavigate();

    const handleChange = (field) => (e) => {
        setPassword(prev => ({ ...prev, [field]: e.target.value }));
        setErrors(prev => ({ ...prev, [field]: "" }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = validateResetPassword(password);
        if (hasErrors(newErrors)) return setErrors(newErrors);
        
        try {
            await resetPassword(token, password.new);
            setPassword(initState);
            setErrors(initState);
            
            toast.success("New password set successfully!");
            navigate("/login");

        } catch (error) {
            console.error(error.error);
            toast.error(error.error || "Failed to set New Password");
        }
    }

    return (
        <PasswordLayout>
            <div className="w-full lg:w-[70%] flex flex-col justify-center">
                <div className='flex items-center gap-3 mb-7'>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl income-gradient text-white">
                        <ShieldCheck size={18} />
                    </span>
                    
                    <div>
                        <h3 className="text-2xl md:text-3xl font-[Genos] font-semibold tracking-tight text-(--text-primary)">
                            Reset Password
                        </h3>
                        <p className="text-xs text-(--text-secondary)">
                            A new password, a safer account
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <Input 
                        icon={<KeyRound size={16} />}
                        type="password"
                        value={password.new}
                        label="New Password"
                        placeholder="Enter new password"
                        onChange={handleChange("new")}
                        error={errors.new}
                    />

                    <Input 
                        icon={<KeyRound size={16} />}
                        type="password"
                        value={password.confirm}
                        label="Confirm Password"
                        placeholder="Enter confirm password"
                        onChange={handleChange("confirm")}
                        error={errors.confirm}
                    />

                    <PasswordStrengthMeter password={password.new} />

                    <button 
                        type="submit"
                        className="auth-btn"
                        disabled={resetPassLoading}
                    >
                        {resetPassLoading 
                            ? <Loader size={20} className="animate-spin mx-auto" /> 
                            : "CONFIRM"
                        }
                    </button>
                </form>
            </div>
        </PasswordLayout>
    );
}