import { useNavigate } from "react-router-dom";
import { KeyRound, Loader } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { validateChangePassword } from "../../errors/auth.error";
import { hasErrors } from "../../errors/errors";
import { useAuthStore } from "../../store/useAuthStore";

import PasswordStrengthMeter from "../../components/inputs/PasswordStrengthMeter";
import Input from "../../components/inputs/Input";

export default function ChangePassword() {
    const initState = {
        current: "",
        new: "",
        confirm: ""
    };

    const { isResettingPassword, changePassword, logout } = useAuthStore();
    const navigate = useNavigate();

    const [password, setPassword] = useState(initState);
    const [errors, setErrors] = useState(initState);

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

            toast.success("Password Updated Successfully! Please login again.");
            navigate("/login");

        } catch (error) {
            console.error(error.error);
            toast.error(error.error || "Failed to Updating Password.");
        }
    }

    return (
        <div className="h-screen flex items-center justify-center p-4 ">
            <div className="w-full max-w-xl flex flex-col items-center justify-center shadow-lg rounded-xl overflow-hidden">
                <div className="w-full bg-emerald-500 text-white flex flex-col items-center justify-center py-1">
                    <h3 className="sm:text-2xl text-lg uppercase">Change Password</h3>
                    <p className="sm:text-sm text-xs">A stronger password, a safer account.</p>
                </div>

                <form 
                    onSubmit={handleSubmit}
                    className="w-full p-4"
                >
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

                    <button 
                        type="submit"
                        className="btn-success"
                        disabled={isResettingPassword}
                    >
                        { isResettingPassword ? <Loader size={20} className="animate-spin mx-auto" /> : "CONFIRM" }
                    </button>
                </form>
            </div>
        </div>
    );
}