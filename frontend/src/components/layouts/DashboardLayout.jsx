import { useAuthStore } from "../../store/useAuthStore";
import Navbar from "./Navbar";
import SideMenu from "./SideMenu";

export default function DashboardLayout({ activeMenu, children }) {
    const { authUser } = useAuthStore();

    return (
        <div className="min-h-screen bg-[#F6F8FA]">
            <Navbar activeMenu={activeMenu} />

            {authUser && (
                <div className="flex min-h-[calc(100vh-65px)]">
                    {/* Desktop Sidebar */}
                    <aside className="max-[1080px]:hidden shrink-0">
                        <SideMenu activeMenu={activeMenu} />
                    </aside>

                    {/* Main Content */}
                    <main className="grow min-w-0 px-4 md:px-5 py-5">
                        {children}
                    </main>
                </div>
            )}
        </div>
    );
}