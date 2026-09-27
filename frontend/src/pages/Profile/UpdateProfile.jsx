import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Camera, Loader, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { validateProfile } from "../../errors/profile.error";
import { useAuthStore } from "../../store/useAuthStore";
import { hasErrors } from "../../errors/errors";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import Input from "../../components/inputs/Input";
import UpdateProfileSkeleton from "../../components/skeletons/UpdateProfileSkeleton";
import AvatarCard from "../../components/cards/AvatarCard";
import RadioGroup from "../../components/inputs/RadioGroup";

export default function UpdateProfile() {
    const { authUser, updateProfile, isUpdatingProfile } = useAuthStore();

    const emptyProfile = {
        fullName: "",
        dob: "",
        gender: "",
        phone: "",
        country: ""
    };

    const buildProfileData = (user) => ({
        fullName: user?.fullName || "",
        dob: user?.dob ? new Date(user.dob).toISOString().split("T")[0] : "",
        phone: user?.phone || "",
        gender: user?.gender || "",
        country: user?.country || ""
    });

    const [profileData, setProfileData] = useState(() => buildProfileData(authUser));
    const [changedData, setChangedData] = useState(() => buildProfileData(authUser));
    const [errors, setErrors] = useState(emptyProfile);

    const [profilePic, setProfilePic] = useState(null);
    const [preview, setPreview] = useState(authUser?.profilePic || "");
    const [profilePicRemoved, setProfilePicRemoved] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    // True only when the user has actually changed something:
    // a text field differs from what was loaded, a new picture was
    // chosen, or the existing picture was removed.
    const hasChanges =
        JSON.stringify(profileData) !== JSON.stringify(changedData) ||
        profilePic !== null ||
        profilePicRemoved;

    const handleChange = (field) => (e) => {
        setProfileData(prev => ({ ...prev, [field]: e.target.value }));
        setErrors(prev => ({ ...prev, [field]: "" }));
    };
    
    async function uploadProfilePic(e) {
        const file = e.target.files[0];
        if (!file) return;

        const profilePicUrl = URL.createObjectURL(file);
        
        setProfilePic(file);
        setPreview(profilePicUrl);
        setProfilePicRemoved(false);
    };
    
    function removeProfilePic() {
        setPreview("");
        setProfilePic(null);
        setProfilePicRemoved(true);
        toast.success("Profile picture will be removed successfully!");
    };

    async function handleSave(e) {
        e.preventDefault();

        const newErrors = validateProfile({...profileData, profilePic});
        if (hasErrors(newErrors)) return setErrors(newErrors);

        try {
            let profilePicSend = undefined;

            if (profilePicRemoved) {
                profilePicSend = "";
            } else if (profilePic) {
                profilePicSend = profilePic;
            }
            
            await updateProfile({ ...profileData, profilePic: profilePicSend });

            // Reset the "changed" baseline to the values we just saved,
            // and clear the pending picture state.
            setChangedData(profileData);
            setProfilePic(null);
            setProfilePicRemoved(false);

            navigate("/profile");
            toast.success("Profile updated successfully!");

        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Failed to update profile");
        }
    };

    return (
        <DashboardLayout activeMenu="Profile">
            <div className="w-full max-w-[1500px] mx-auto py-2 md:py-4">
                {!authUser ? (
                    <UpdateProfileSkeleton />
                ) : (
                    <div className="glass card w-full max-w-4xl mx-auto">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-6">
                            <h1 className="text-2xl md:text-3xl font-[Genos] font-semibold text-(--text-primary)">
                                Edit profile
                            </h1>
                            
                            <button
                                type="button"
                                onClick={() => navigate("/profile")}
                                className="btn-ghost w-fit"
                            >
                                <ArrowLeft size={14} /> Back
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/40 bg-white/20 px-4 py-6">
                                <div className="relative">
                                    <AvatarCard 
                                        avatar={preview}
                                        style="w-24 h-24"
                                    />

                                    {preview ? (
                                        <button
                                            type="button"
                                            onClick={removeProfilePic}
                                            className="img-remove"
                                            disabled={isUpdatingProfile}
                                            aria-label="Remove profile picture"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    ) : (
                                        <label
                                            htmlFor="avatar-upload"
                                            className={`
                                                img-upload
                                                ${isUpdatingProfile && "animate-pulse pointer-events-none"}
                                            `}
                                            aria-label="Upload profile picture"
                                        >
                                            <Camera size={16} />
                                            <input
                                                type="file"
                                                id="avatar-upload"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={uploadProfilePic}
                                                disabled={isUpdatingProfile}
                                            />
                                        </label>
                                    )}
                                </div>

                                <div className="text-center">
                                    <p className="text-base font-semibold text-(--text-primary)">
                                        {profileData.fullName || "Your name"}
                                    </p>
                                    <p className="text-sm text-[var(--text-secondary)">
                                        Update your personal details
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    type="text"
                                    label="Full Name"
                                    value={profileData.fullName}
                                    placeholder="Add your name"
                                    onChange={handleChange("fullName")}
                                    error={errors.fullName}
                                    disabled={isUpdatingProfile}
                                />

                                <Input
                                    type="date"
                                    label="Date of Birth"
                                    value={profileData.dob}
                                    placeholder="Add your dob"
                                    onChange={handleChange("dob")}
                                    error={errors.dob}
                                    disabled={isUpdatingProfile}
                                />

                                <Input
                                    type="number"
                                    label="Phone Number"
                                    value={profileData.phone}
                                    placeholder="Add contact number"
                                    onChange={handleChange("phone")}
                                    error={errors.phone}
                                    disabled={isUpdatingProfile}
                                />

                                <Input
                                    type="text"
                                    label="Country"
                                    value={profileData.country}
                                    placeholder="Add your country"
                                    onChange={handleChange("country")}
                                    error={errors.country}
                                    disabled={isUpdatingProfile}
                                />

                                <div className="md:col-span-2">
                                    <RadioGroup
                                        label="Gender"
                                        name="gender"
                                        options={[
                                            { label: "Male", value: "male" },
                                            { label: "Female", value: "female" },
                                            { label: "Other", value: "other" },
                                        ]}
                                        value={profileData.gender}
                                        onChange={handleChange("gender")}
                                        error={errors.gender}
                                        disabled={isUpdatingProfile}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="auth-btn md:max-w-[220px] mt-3"
                                disabled={isUpdatingProfile || !hasChanges}
                            >
                                {isUpdatingProfile ? (
                                    <Loader size={18} className="animate-spin mx-auto" />
                                ) : (
                                    "Save changes"
                                )}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}