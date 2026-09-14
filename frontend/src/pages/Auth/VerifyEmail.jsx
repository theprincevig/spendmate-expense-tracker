import AuthLayout from "../../components/layouts/AuthLayout";
import { useAuthStore } from "../../store/useAuthStore";

export default function VerifyEmail() {
    const {
        authUser,
        verifyEmail,
        isVerifing
    } = useAuthStore();
    return (
        <AuthLayout>

        </AuthLayout>
    );
}