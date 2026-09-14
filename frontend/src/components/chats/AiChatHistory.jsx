import { MessageSquare, Trash, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";

import { useAiChatStore } from "../../store/useAiChatStore";
import AiChatHistorySkeleton from "../skeletons/AiChatHistorySkeleton";

export default function AiChatHistory({ isOpen, onClose }) {
    const {
        chatSessions,
        initialLoading,
        loadChatSession,
        openChat,
        deleteChatHistory,
        openAiModal
    } = useAiChatStore();

    const [showModal, setShowModal] = useState(isOpen);
    const navigate = useNavigate();

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

    useEffect(() => {
        if (chatSessions.length === 0) {
            loadChatSession();
        }
    }, [chatSessions.length, loadChatSession]);

    if (!showModal) return null;

    const handleOpenChat = (id) => {
        openChat(id);
        openAiModal();
        navigate("/expense");
        onClose();
    }

    const handleDeleteChatHistory = async (e, id) => {
        e.stopPropagation();

        try {
            await deleteChatHistory(id);
            toast.success("Chat delete successfully!");
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to delete chat history.");
        }
    }

    return createPortal(
        <div
            role="presentation"
            onClick={onClose}
            className={`
                fixed inset-0 z-2000
                flex items-center justify-center
                px-3 sm:px-5 
                bg-(--text-primary)/35
                transition-opacity duration-300
                ${isOpen ? "opacity-100" : "opacity-0"}
            `}
        >
            <div 
                role="dialog"
                aria-modal="true"
                aria-labelledby="AI-chat-history-modal-title"
                onClick={(e) => e.stopPropagation()}
                className={`
                    glass-strong 
                    relative w-full 
                    max-w-xl max-h-[75vh] 
                    flex flex-col rounded-2xl 
                    p-5 sm:p-6 overflow-hidden 
                    ${isOpen ? "open" : "close"}
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span 
                                className="
                                    w-8 h-8 shrink-0 
                                    flex items-center 
                                    justify-center rounded-full 
                                    text-white 
                                    ai-gradient 
                                    shadow-[0_5px_16px_var(--shadow-ai)]
                                "
                            >
                                <MessageSquare size={16} />
                            </span>
                            <h3
                                id="AI-chat-history-modal-title"
                                className="
                                    text-lg sm:text-2xl 
                                    font-[Genos] font-semibold 
                                    text-(--text-primary)
                                "
                            >
                                AI Chat History
                            </h3>
                        </div>

                        <p 
                            className="
                                text-xs sm:text-sm 
                                font-[Basic] text-(--text-secondary) 
                                tracking-wider mt-1
                            "
                        >
                            Choose or delete your existing conversations.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close AI-chat history"
                        className="close-btn shrink-0"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Divider */}
                <div className="h-px bg-[rgba(102,112,133,0.15)] my-5" />

                {/* Body */}
                <div className="min-h-0 overflow-y-auto pr-1">

                </div>
                {initialLoading ? (
                    <AiChatHistorySkeleton />
                ) : chatSessions.length === 0 ? (
                    <div 
                        className="
                            glass-subtle 
                            flex flex-col items-center 
                            justify-center rounded-xl 
                            px-5 py-10 text-center
                        "
                    >
                        <div 
                            className="
                                w-11 h-11 
                                flex items-center 
                                justify-center rounded-full 
                                ai-gradient text-white 
                                mb-3
                                shadow-[0_6px_18px_var(--shadow-ai)] 
                            "
                        >
                            <MessageSquare size={18} />
                        </div>

                        <h4 className="text-sm font-semibold text-(--text-primary)">
                            No chat history yet
                        </h4>

                        <p className="text-xs font-[Basic] text-(--text-muted) tracking-wide mt-1">
                            Your AI conversations will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {chatSessions.map((chat) => (
                            <div 
                                key={chat._id}
                                className="
                                    group 
                                    flex items-center gap-3 
                                    px-3 py-2.5 
                                    rounded-xl border 
                                    border-[rgba(255,255,255,0.55)] 
                                    bg-[rgba(255,255,255,0.25)] 
                                    transition-all duration-200 
                                    hover:bg-brand-teal/6
                                    hover:border-[rgba(0,191,166,0.20)] 
                                    hover:shadow-[0_5px_16px_var(--shadow-teal-soft)]
                                "
                            >
                                <button 
                                    onClick={() => handleOpenChat(chat._id)}
                                    className="
                                        min-w-0 flex-1 
                                        flex items-center gap-3 
                                        text-left cursor-pointer 
                                        outline-none
                                    "
                                >
                                    <span 
                                        className="
                                            shrink-0 w-8 h-8 
                                            flex items-center 
                                            justify-center rounded-lg 
                                            text-(--ai-indigo) 
                                            bg-[rgba(91,108,255,0.08)] 
                                            transition-all duration-200 
                                            group-hover:bg-brand-teal/10
                                            group-hover:text-brand-teal
                                        "
                                    >
                                        <MessageSquare size={15} />
                                    </span>

                                    <span className="min-w-0">
                                        <span className="
                                            block 
                                            text-xs sm:text-sm 
                                            font-medium text-(--text-secondary) 
                                            truncate transition-colors duration-200 
                                            group-hover:text-(--text-primary)
                                        ">
                                            {chat.title || "Untitled Chat"}
                                        </span>

                                        <span className="block text-[10px] sm:text-xs text-(--text-muted) mt-0.5">
                                            Open conversation
                                        </span>
                                    </span>
                                </button>

                                {/* Delete */}
                                <button 
                                    type="button"
                                    onClick={(e) => handleDeleteChatHistory(e, chat._id)}
                                    aria-label={`Delete ${ chat.title || "untitled chat" }`}
                                    className="delete-btn"
                                >
                                    <Trash size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}