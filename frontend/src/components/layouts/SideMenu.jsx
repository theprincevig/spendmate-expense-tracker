import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { SIDE_MENU_DATA } from "../../utils/data";
import AvatarCard from "../cards/AvatarCard";

export default function SideMenu({ activeMenu }) {
    const { authUser, logout } = useAuthStore();
    const navigate = useNavigate();

    function handleClick(route) {
        if (route === "logout") {
            logout();
            navigate("/login");
            return;
        }

        navigate(route);
    }

    return (
        <aside
            className="
                glass
                w-64 h-[calc(100vh-65px)]
                p-5 z-40
                sticky top-[65px]
                overflow-y-auto
            "
        >
            {/* Profile */}
            <div className="flex flex-col items-center justify-center gap-3 mt-3 mb-8">
                <AvatarCard 
                    avatar={authUser?.profilePic}
                    style="w-18 h-18"
                />

                <div className="text-center">
                    <h5
                        className="
                            text-(--text-primary)
                            font-semibold
                            leading-6
                            truncate
                            max-w-[210px]
                        "
                    >
                        {authUser?.fullName || "User"}
                    </h5>

                    <p
                        className="
                            text-xs
                            text-(--text-muted)
                            font-[Basic]
                            tracking-wide
                            mt-0.5
                        "
                    >
                        SpendMate Account
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1.5">
                {SIDE_MENU_DATA.map((item, index) => {
                    const isActive = activeMenu === item.label;

                    return (
                        <button
                            key={`menu_${index}`}
                            type="button"
                            onClick={() => handleClick(item.path)}
                            className={`
                                group relative w-full
                                rounded-xl
                                flex items-center gap-4
                                py-3 px-4
                                text-base font-medium font-[Genos]
                                transition-all duration-200
                                cursor-pointer

                                ${
                                    isActive
                                        ? `
                                            text-income
                                            bg-[rgba(0,191,166,0.10)]
                                            border border-[rgba(0,191,166,0.15)]
                                            shadow-sm
                                        `
                                        : `
                                            text-(--text-secondary)
                                            border border-transparent
                                            hover:text-primary
                                            hover:bg-white/70
                                            hover:border-white
                                        `
                                }
                            `}
                        >
                            {/* Active indicator */}
                            {isActive && (
                                <span
                                    className="
                                        absolute left-0 top-1/2
                                        -translate-y-1/2
                                        w-1 h-6
                                        rounded-r-full
                                        bg-linear-to-b
                                        from-brand-red
                                        to-brand-teal
                                    "
                                />
                            )}

                            <item.icon
                                size={20}
                                strokeWidth={isActive ? 2.3 : 2}
                                className={`
                                    shrink-0
                                    transition-colors duration-200
                                    ${
                                        isActive
                                            ? "text-income"
                                            : `
                                                text-(--text-muted)
                                                group-hover:text-income
                                            `
                                    }
                                `}
                            />

                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
}