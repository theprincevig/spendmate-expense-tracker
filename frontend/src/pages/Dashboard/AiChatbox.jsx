import { useEffect, useState } from "react";
import { useAiChatStore } from "../../store/useAiChatStore";

import AiChatBody from "../../components/chats/AiChatBody";
import AiMessageInput from "../../components/chats/AiMessageInput";
import AiChatboxSkeleton from "../../components/skeletons/AiChatboxSkeleton";

export default function AiChatbox() {
    const { 
        messages,
        sendMessage,
        initialLoading,
        aiTyping,
        activeChatId,
        newChat,
        loadChatSession,
        aiUnavailable
    } = useAiChatStore();

    const [input, setInput] = useState("");

    useEffect(() => {
        const init = async () => {
            await loadChatSession();

            if (!activeChatId) {
                newChat();
            }
        };

        init();
    }, [activeChatId, newChat, loadChatSession]);

    function handleSend() {
        if (!input.trim() || aiTyping || aiUnavailable) return;

        sendMessage(input);
        setInput("");
    }

    return (
        <>
            {initialLoading ? (
                <AiChatboxSkeleton />
            ) : (
                <div className="h-full flex flex-col bg-white/20">
                    {/* Message content */}
                    <AiChatBody 
                        messages={messages}
                        loading={aiTyping} 
                    />

                    {/* Message input */}
                    <AiMessageInput 
                        input={input} 
                        setInput={setInput} 
                        onSend={handleSend}
                        disabled={aiTyping || aiUnavailable}
                    />
                </div>
            )}
        </>
    );
}