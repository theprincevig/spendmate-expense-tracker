import { useEffect, useRef } from "react";
import { getChatHeaderDate } from "../../utils/dateUtils";
import AiMessageBubble from "./AiMessageBubble";

export default function AiChatBody({ messages, loading }) {
    const bottomRef = useRef();

    // Auto scrolling
    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages, loading]);

    return (
        <div
            className="
                flex-1 nmin-h-0
                overflow-y-auto space-y-4
                px-4 sm:px-6 py-5
                bg-(--background)/60
                scrollbar-thin
            "
        >
           {/* Date */}
            <div
                className="
                    w-full py-1
                    flex items-center justify-center
                    text-[11px] sm:text-xs
                    text-(--text-muted)
                    font-[Basic] tracking-wide
                "
            >
                <span
                    className="
                        px-3 py-1 rounded-full
                        bg-white/60 backdrop-blur-md
                        border border-white/80
                    "
                >
                    {getChatHeaderDate()}
                </span>
            </div>

            {messages.map((message, idx) => (
                <AiMessageBubble 
                    key={idx}
                    message={message}
                />
            ))}

            {loading && (
                <AiMessageBubble
                    message={{
                        role: "ai",
                        content: "Thinking..."
                    }}
                    isLoading
                />
            )}

            {/* Scroll target */}
            <div ref={bottomRef} />
        </div>
    );
}