import { MessageCircleDashed } from "lucide-react";
import { useEffect, useState } from "react";

export default function AiFloatingButton({ onClick }) {
    const [bounce, setBounce] = useState(false);
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            if (hovered) return;

            setBounce(true);
            setTimeout(() => setBounce(false), 900);
        }, 30000);

        return () => clearInterval(interval);
    }, [hovered]);

    return (
        <div
            className={`
                fixed bottom-8 right-8 z-1000
                ${bounce ? "AI_smart-bounce" : ""}
            `}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <button
                type="button"
                onClick={onClick}
                aria-label="Open AI Assistant"
                className={`
                    AI_floating-btn
                    group
                    flex items-center
                    overflow-hidden
                    rounded-full
                    transition-all duration-300
                    hover:scale-105
                    active:scale-95
                    ${!hovered ? "AI_glow" : ""}
                `}
            >
                {/* Icon */}
                <div className="w-11 h-11 flex items-center justify-center shrink-0">
                    <MessageCircleDashed size={20} />
                </div>

                {/* Text */}
                <span
                    className="
                        max-w-0
                        overflow-hidden
                        whitespace-nowrap
                        opacity-0
                        translate-x-2
                        font-[Basic]
                        font-medium
                        group-hover:max-w-[120px]
                        group-hover:opacity-100
                        group-hover:translate-x-0
                        group-hover:mr-4
                        transition-all
                        duration-300
                        delay-100
                    "
                >
                    AI Assistant
                </span>
            </button>
        </div>
    );
}