import { Link } from "react-router-dom";
import { KeyRound, Loader, Lock } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { validateChangePassword } from "../../errors/password.error";
import { hasErrors } from "../../errors/errors";
import { useAuthStore } from "../../store/useAuthStore";
import { usePasswordStore } from "../../store/usePasswordStore";

import PasswordStrengthMeter from "../../components/inputs/PasswordStrengthMeter";
import Input from "../../components/inputs/Input";
import PasswordLayout from "../../components/layouts/PasswordLayout";

export default function ChangePassword() {
    const initState = {
        current: "",
        new: "",
        confirm: ""
    };

    const { changePassLoading, changePassword } = usePasswordStore();
    const { logout } = useAuthStore();
    
    const [password, setPassword] = useState(initState);
    const [errors, setErrors] = useState(initState);
    // const navigate = useNavigate();

    const handleChange = (field) => (e) => {
        setPassword(prev => ({ ...prev, [field]: e.target.value }));
        setErrors(prev => ({ ...prev, [field]: "" }));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const newErrors = validateChangePassword(password);
        if (hasErrors(newErrors)) return setErrors(newErrors);
        
        try {
            await changePassword(password.current, password.new);
            await logout(); // if you have logout in store
            setPassword(initState);
            setErrors(initState);

            toast.success("Password Updated Successfully! Please login again");
            // navigate("/login");

        } catch (error) {
            console.error(error.error);
            toast.error(error.error || "Failed to Updating Password");
        }
    }

    return (
        <PasswordLayout>
            <div className="w-full lg:w-[70%] flex flex-col justify-center">
                <div className='flex items-center gap-3 mb-7'>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl brand-gradient text-white">
                        <Lock size={18} />
                    </span>
                    
                    <div>
                        <h3 className="text-2xl md:text-3xl font-[Genos] font-semibold tracking-tight text-(--text-primary)">
                            Change Password
                        </h3>
                        <p className="text-xs text-(--text-secondary)">
                            A stronger password, a safer account
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <Input 
                        icon={<KeyRound size={16} />}
                        label="Current Password"
                        type="password"
                        value={password.current}
                        placeholder="Enter current password"
                        onChange={handleChange("current")}
                        error={errors.current}
                    />

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

                    {/* Forgot password */}
                    <div className="text-left text-xs px-2 mb-1">
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
                        disabled={changePassLoading}
                    >
                        { changePassLoading ? <Loader size={20} className="animate-spin mx-auto" /> : "CONFIRM" }
                    </button>
                </form>
            </div>
        </PasswordLayout>
    );
}