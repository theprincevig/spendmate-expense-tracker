import { X } from "lucide-react";
import { useEffect, useState } from "react";

export default function Modal({
    children,
    isOpen,
    onClose,
    title
}) {
    const [showModal, setShowModal] = useState(isOpen);

    // Handle mount/unmount animation
    useEffect(() => {
        if (isOpen) {
            setShowModal(true);
        } else {
            const timer = setTimeout(() => {
                setShowModal(false);
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!showModal) return null;

    return (
        <div
            onClick={onClose}
            className={`
                fixed inset-0 z-50
                flex items-center justify-center p-4
                bg-(--text-primary)/35 backdrop-blur-md
                transition-opacity duration-300
                ${isOpen ? "opacity-100" : "opacity-0"}
            `}
        >
            <div className="relative w-full max-w-2xl">

                {/* Modal Box */}
                <div
                    onClick={(e) => e.stopPropagation()}
                    className={`
                        glass-strong
                        relative overflow-hidden
                        rounded-2xl 
                        ${isOpen ? "open-y" : "close-y"}
                    `}
                >
                    {/* Decorative Brand Glow */}
                    <div className="
                        pointer-events-none
                        absolute -top-20 -right-20
                        w-40 h-40 rounded-full
                        bg-[#00BFA6]/10 blur-3xl
                    " />

                    <div className="
                        pointer-events-none
                        absolute -bottom-24 -left-20
                        w-44 h-44 rounded-full
                        bg-[#FF304F]/8 blur-3xl
                    " />

                    {/* Header */}
                    <div className="
                        relative flex
                        items-center justify-between
                        p-4 md:p-5 border-b
                        border-slate-200/70
                    ">
                        <h3 className="text-lg font-semibold text-[#171A1F]">
                            {title}
                        </h3>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close modal"
                            className="close-btn"
                        >
                            <X size={17} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="
                        relative p-4 md:p-6
                        space-y-4 max-h-[80vh]
                        overflow-y-auto
                    ">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}