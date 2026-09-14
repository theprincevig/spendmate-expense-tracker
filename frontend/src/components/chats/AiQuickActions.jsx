import { AI_QUICK_ACTIONS } from "../../config/aiQuickActions.Config";
import { useAiChatStore } from "../../store/useAiChatStore";

export default function AiQuickActions() {
    const { sendMessage, loading } = useAiChatStore();

    return (
        <div className="w-full flex gap-2 justify-start p-1 x-scrollbar">
            {AI_QUICK_ACTIONS.map((action, idx) => (
                <button
                    type="button"
                    key={idx}
                    onClick={() => sendMessage(action.message)}
                    className="AI_quick-btns"
                    disabled={loading}
                >
                    {action.label}
                </button>
            ))}
        </div>
    );
}