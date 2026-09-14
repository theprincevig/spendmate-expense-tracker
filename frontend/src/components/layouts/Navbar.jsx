import { useState } from "react";
import { Menu, X } from "lucide-react";
import SideMenu from "./SideMenu";


export default function Navbar({ activeMenu }) {

    const [openSideMenu, setOpenSideMenu] = useState(false);


    return (
        <div className="
            glass
            sticky top-0
            z-50
            flex items-center gap-4
            px-4 md:px-6
            py-2
        ">

            {/* Mobile Menu Button */}
            <button
                type="button"
                onClick={() => setOpenSideMenu(!openSideMenu)}
                className="
                    glass
                    lg:hidden
                    w-10 h-10
                    rounded-full
                    flex items-center justify-center
                    text-primary
                    hover:text-brand-teal
                    transition-all duration-200
                    cursor-pointer
                "
                aria-label={
                    openSideMenu
                        ? "Close menu"
                        : "Open menu"
                }
            >

                {openSideMenu ? (
                    <X size={20} />
                ) : (
                    <Menu size={20} />
                )}

            </button>


            {/* Logo */}
            <div className="py-1">

                <img
                    src="/spendmate-logo.png"
                    alt="spendmate"
                    className="w-40 md:w-48 object-contain"
                />

            </div>


            {/* Mobile Side Menu */}
            {openSideMenu && (
                <>

                    {/* Backdrop */}
                    <div
                        className="
                            fixed
                            inset-0
                            top-22
                            bg-primary/10
                            backdrop-blur-[2px]
                            lg:hidden
                        "
                        onClick={() => setOpenSideMenu(false)}
                    />


                    {/* Menu */}
                    <div
                        className="
                            glass-strong
                            fixed
                            top-21
                            left-0
                            w-[260px]
                            max-h-[calc(100vh-65px)]
                            overflow-y-auto
                            lg:hidden
                        "
                    >
                        <SideMenu activeMenu={activeMenu} />
                    </div>

                </>
            )}

        </div>
    );
}