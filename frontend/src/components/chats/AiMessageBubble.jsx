export default function AiMessageBubble({ message, isLoading = false }) {
    const isUser = message.role === "user";
    const isAI = message.role === "ai";

    return (
        <div
            className={`
                flex
                ${isUser ? "justify-end" : "justify-start"}
            `}
        >
            <div
                className={`
                    max-w-[75%] px-4 py-2.5 rounded-2xl
                    text-xs sm:text-sm
                    font-[Basic] font-medium
                    leading-relaxed wrap-break-word
                    transition-all duration-200

                    ${
                        isUser
                            ? `
                                text-white bg-linear-to-br
                                from-brand-teal to-[#008F83]
                                rounded-br-md
                                shadow-[0_6px_18px_rgba(0,143,131,0.16)]
                            `
                            : `
                                text-(--text-primary) bg-white/70
                                border border-white/80
                                backdrop-blur-xl rounded-bl-md
                                shadow-[0_5px_18px_rgba(15,23,42,0.06)]
                            `
                    }

                    ${
                        isAI && isLoading
                            ? "animate-pulse shimmer"
                            : ""
                    }
                `}
            >
                {message.content}
            </div>
        </div>
    );
}