import { MessageSquare, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function AiModal({
    children,
    chatboxOpen,
    chatboxClose,
    chatboxTitle
}) {
    const [showModal, setShowModal] = useState(chatboxOpen);
    
    // Handle mount/unmount animation
    useEffect(() => {
        if (chatboxOpen) {
            setShowModal(true);
        } else {
            const timer = setTimeout(() => {
                setShowModal(false);
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [chatboxOpen]);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") chatboxClose();
        };

        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, []);

    if (!showModal) return null;

    return (
        <div
            onClick={chatboxClose}
            className={`
                fixed inset-0 z-2000
                flex items-center justify-center
                px-3 sm:px-5 
                bg-(--text-primary)/35
                transition-opacity duration-300
                ${chatboxOpen ? "opacity-100" : "opacity-0"}
            `}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={`
                    relative w-full max-w-[820px]
                    ${chatboxOpen ? "open" : "close"}
                `}
            >
                {/* Modal */}
                <div
                    className="
                        glass
                        relative overflow-hidden
                        rounded-3xl 
                    "
                >
                    {/* Decorative AI glow */}
                    {/* <div
                        aria-hidden="true"
                        className="
                            pointer-events-none
                            absolute -top-20 -right-20
                            h-40 w-40 rounded-full
                            bg-(--ai-indigo)/10 blur-3xl
                        "
                    />

                    <div
                        aria-hidden="true"
                        className="
                            pointer-events-none
                            absolute -bottom-20 -left-20
                            h-40 w-40 rounded-full
                            bg-brand-teal/10 blur-3xl
                        "
                    /> */}

                    {/* Header */}
                    <div
                        className="
                            relative px-5 py-4 z-10
                            flex items-center justify-between
                            bg-linear-to-bl from-brand-teal
                            via-[#008F83] to-(--ai-indigo)
                            border-b border-white/20
                        "
                    >
                        <div className="flex items-center gap-2">
                            <MessageSquare 
                                size={22}
                                className="text-white"
                            />
                            

                            <h3 className="text-lg text-white font-semibold tracking-wide">
                                {chatboxTitle}
                            </h3>
                        </div>

                        <button
                            type="button"
                            onClick={chatboxClose}
                            aria-label="Close AI Assistant"
                            className="close-btn"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="relative h-[620px] max-h-[calc(100dvh-120px)] overflow-hidden">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}