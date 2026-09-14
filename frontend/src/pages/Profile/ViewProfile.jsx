import { useState, useEffect } from "react";
import { CalendarDays, Mail, MapPin, Pencil, Phone, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../../store/useAuthStore";
import { useActiveCurrency } from "../../hooks/useActiveCurrency";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import ViewProfileSkeleton from "../../components/skeletons/ViewProfileSkeleton";
import AdvanceSettings from "../../components/AdvanceSettings";
import AvatarCard from "../../components/cards/AvatarCard";

export default function ViewProfile() {
    const { authUser, viewProfile } = useAuthStore();
    const [loading, setLoading] = useState(true);

    const activeCurrency = useActiveCurrency();
    const navigate = useNavigate();

    useEffect(() => {
        if (!authUser) return;

        const fetchProfile = async () => {
            setLoading(true);
            try {
                await viewProfile();
            } catch (error) {
                console.error(error?.error || error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [authUser, viewProfile]);

    return (
        <DashboardLayout activeMenu="Profile">
            <div className="w-full max-w-[1500px] mx-auto py-2 md:py-4 space-y-6">
                {loading ? (
                    <ViewProfileSkeleton />
                ) : (
                    <div className="space-y-3">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 md:gap-4">
                            <div className="glass card p-5 md:p-6">
                                <h1 className="text-xl md:text-2xl font-[Genos] font-semibold">
                                    Your profile
                                </h1>

                                <div className="flex flex-col items-center gap-2">
                                    <AvatarCard 
                                        avatar={authUser?.profilePic}
                                        style="w-20 h-20 md:w-26 md:h-26"
                                    />
                                    
                                    <div className="text-center">
                                        <h2 className="text-xl md:text-2xl font-semibold text-(--text-primary)">
                                            {authUser?.fullName || "Your name"}
                                        </h2>

                                        <div className="flex items-center justify-center gap-2 text-sm text-(--text-secondary)">
                                            <CalendarDays size={14} />
                                            {authUser?.dob
                                                ? new Date(authUser.dob).toLocaleDateString()
                                                : "dd/mm/yyyy"}
                                        </div>

                                        <div className="glass mt-4 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold text-(--text-secondary)">
                                            <span>{activeCurrency?.details?.symbol || "₹"}</span>
                                            <span>{activeCurrency?.code || "INR"}</span>
                                        </div>
                                    </div>

                                    <div className="w-full flex justify-end mt-2">
                                        <button
                                            type="button"
                                            onClick={() => navigate("/profile/edit")}
                                            className="expense-btn flex gap-2"
                                        >
                                            <Pencil size={14} /> Edit profile
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="glass card p-5 md:p-6">
                                <h3 className="text-xl md:text-2xl font-semibold font-[Genos] mb-6">
                                    Account details
                                </h3>

                                <div className="space-y-4">
                                    <InfoRow
                                        icon={<Mail size={14} />}
                                        label="Email"
                                        value={authUser?.email}
                                    />
                                    <InfoRow
                                        icon={<Phone size={14} />}
                                        label="Phone Number"
                                        value={authUser?.phone}
                                    />
                                    <InfoRow
                                        icon={<User size={15} />}
                                        label="Gender"
                                        value={authUser?.gender}
                                    />
                                    <InfoRow
                                        icon={<MapPin size={15} />}
                                        label="Country"
                                        value={authUser?.country}
                                    />
                                </div>
                            </div>
                        </div>

                        <AdvanceSettings />
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

const InfoRow = ({ icon, label, value }) => {
    return (
        <div className="flex items-center gap-6 text-sm md:text-base font-[Basic] tracking-wider mb-1">
            <div className="flex items-center text-(--text-secondary) gap-2">
                <span>{icon}</span>
                <h6>{label}:</h6>
            </div>

            <p className="font-medium text-(--text-primary)">
                {value}
            </p>
        </div>
    );
};