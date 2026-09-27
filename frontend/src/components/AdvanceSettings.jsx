import { useNavigate } from "react-router-dom";
import {
    Brain,
    ChevronDown,
    ChevronUp,
    Globe,
    KeyRound,
    Settings
} from "lucide-react";
import { useState } from "react";

import { useActiveCurrency } from "../hooks/useActiveCurrency";
import AiChatHistory from "./chats/AiChatHistory";
import CurrencyModal from "./CurrencyModal";

export default function AdvanceSettings() {
    const [open, setOpen] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showCurrencies, setShowCurrencies] = useState(false);

    const activeCurrency = useActiveCurrency();
    const navigate = useNavigate();

    const currencyCode = activeCurrency?.code || "USD";
    const currencySymbol = activeCurrency?.details?.symbol || "$";

    return (
        <div className="relative">
            <div className="glass card p-4 md:p-5">
                <button
                    type="button"
                    onClick={() => setOpen((prev) => !prev)}
                    className="w-full flex items-center justify-between gap-3 rounded-2xl text-left"
                >
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-teal/8 text-brand-teal">
                            <Settings size={18} />
                        </span>

                        <div>
                            <p className="text-[10px] font-medium uppercase tracking-wide text-(--text-muted)">
                                Security
                            </p>
                            <h1 className="text-lg sm:text-xl font-[Genos] font-semibold text-(--text-primary)">
                                Advance settings
                            </h1>
                        </div>
                    </div>

                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-(--text-secondary)">
                        {!open 
                            ? <ChevronDown size={18} /> 
                            : <ChevronUp size={18} />
                        }
                    </span>
                </button>

                {open && (
                    <div className="mt-8 space-y-3">
                        <button
                            type="button"
                            onClick={() => setShowHistory(true)}
                            className="glass card-btn w-full flex items-center justify-between gap-3 text-left"
                        >
                            <div className="flex items-center gap-3">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-teal/8 text-brand-teal">
                                    <Brain size={16} />
                                </span>

                                <span className="text-sm sm:text-base font-[Basic] tracking-wider text-(--text-primary)">
                                    AI chat history
                                </span>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowCurrencies(true)}
                            className="glass card-btn w-full flex items-center justify-between gap-3 text-left"
                        >
                            <div className="flex items-center gap-3">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-teal/8 text-brand-teal">
                                    <Globe size={16} />
                                </span>

                                <span className="text-sm sm:text-base font-[Basic] tracking-wider text-(--text-primary)">
                                    Currency changer
                                </span>
                            </div>

                            <span className="text-sm font-semibold text-brand-teal">
                                {currencySymbol} {currencyCode}
                            </span>
                        </button>

                        <div className="glass card-btn w-full flex items-center justify-between gap-3 rounded-2xl p-3">
                            <div className="flex items-center gap-3">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-teal/8 text-brand-teal">
                                    <KeyRound size={16} />
                                </span>

                                <span className="text-sm sm:text-base font-[Basic] tracking-wider text-(--text-primary)">
                                    Change password
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => navigate("/password/change")}
                                className="auth-btn w-full max-w-[100px]"
                            >
                                Change
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <AiChatHistory
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
            />

            <CurrencyModal
                isOpen={showCurrencies}
                onClose={() => setShowCurrencies(false)}
            />
        </div>
    );
}