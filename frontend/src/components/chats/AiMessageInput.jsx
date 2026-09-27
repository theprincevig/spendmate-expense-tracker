import { RefreshCcwIcon, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { useAiChatStore } from "../../store/useAiChatStore";
import AiQuickActions from "./AiQuickActions";

export default function AiMessageInput({
    input,
    setInput,
    onSend,
    disabled
}) {
    const { newChat, messages } = useAiChatStore();
    const [spinReset, setSpinReset] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const typingTimeout = useRef(null);

    const handleChange = (e) => {
        const nextValue = e.target.value;

        setInput(nextValue);

        if (!nextValue) {
            setIsTyping(false);
            return;
        }

        setIsTyping(true);

        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
            setIsTyping(false);
        }, 1200);
    };

    useEffect(() => {
        return () => clearTimeout(typingTimeout.current);
    }, []);

    // Reminder for reset chat
    useEffect(() => {
        if (messages.length < 3) return;

        const interval = setInterval(() => {
            if (isTyping || disabled) return;

            setSpinReset(true);
            setTimeout(() => setSpinReset(false), 800);    // Stop spin after animation
        }, 10000);

        return () => clearInterval(interval);
    }, [messages.length, isTyping, disabled]);

    const handleReset = () => {
        newChat();
        toast.success("Reset chat successfully!");
    }

    return (
        <div
            className="
                w-full p-4 sm:p-5
                flex flex-col gap-3
                glass-subtle
            "
        >
            <AiQuickActions />

            <div className="w-full flex items-center gap-2">
                <input
                    type="text"
                    placeholder={
                        disabled
                            ? "AI is thinking..."
                            : "Ask about your spending..."
                    }
                    value={input}
                    onChange={handleChange}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            onSend();
                        }
                    }}
                    className="glass AI_chat-input"
                    disabled={disabled}
                />

                {input ? (
                    <button
                        type="button"
                        onClick={onSend}
                        className="AI_send-btn"
                        disabled={disabled}
                        aria-label="Send message"
                    >
                        <Send size={18} />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleReset}
                        className="glass AI_reset-btn"
                        disabled={disabled}
                        title="New Chat"
                        aria-label="Start new chat"
                    >
                        <RefreshCcwIcon
                            size={18}
                            className={
                                spinReset
                                    ? "AI_glow-spin"
                                    : ""
                            }
                        />
                    </button>
                )}
            </div>
        </div>
    );
}