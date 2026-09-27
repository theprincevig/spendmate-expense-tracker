import { Check, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

import { useActiveCurrency } from "../hooks/useActiveCurrency";
import { currencyConfig } from "../config/currency.Config";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

export default function CurrencyModal({ isOpen, onClose }) {
    const [showModal, setShowModal] = useState(isOpen);

    const currencies = Object.values(currencyConfig);

    const { authUser, changeCurrency } = useAuthStore();
    const activeCurrency = useActiveCurrency();

    useEffect(() => {
        if (isOpen) {
            const frame = requestAnimationFrame(
                () => setShowModal(true)
            );
            return () => cancelAnimationFrame(frame);
        }

        const timer = setTimeout(
            () => setShowModal(false),
        300);
        return () => clearTimeout(timer);
    }, [isOpen]);

    if (!showModal) return null;

    const handleCurrencyChange = async (currencyCode) => {
        if (!authUser) return;

        if (currencyCode === activeCurrency.code) {
            onClose();
            return;
        }

        try {
            await changeCurrency(currencyCode);

            toast.success(`Currency changed to ${currencyCode}`);
            onClose();
        } catch (error) {
            console.error(error.error);
            toast.error(error.error || "Failed to change currency");
        }
    };

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
                aria-labelledby="currency-modal-title"
                onClick={(e) => e.stopPropagation()}
                className={`
                    glass-strong
                    relative w-full 
                    max-w-2xl max-h-[85vh]
                    flex flex-col rounded-2xl
                    p-5 sm:p-6 overflow-hidden
                    ${isOpen ? "open" : "close"}
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h3
                            id="currency-modal-title"
                            className="text-lg sm:text-xl font-semibold text-(--text-primary)"
                        >
                            Currency
                        </h3>

                        <p className="
                            text-xs sm:text-sm 
                            font-[Basic] text-(--text-secondary) 
                            tracking-wider
                        ">
                            Choose the currency used across your account.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close currency modal"
                        className="close-btn shrink-0"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Divider */}
                <div className="h-px bg-[rgba(102,112,133,0.15)] my-5" />

                {/* Currency List */}
                <div
                    className="
                        max-h-[55vh]
                        overflow-y-auto
                        pr-1
                        scrollbar-thin
                    "
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {currencies.map((currency) => {
                            const isActive =
                                activeCurrency.code === currency.code;

                            return (
                                <button
                                    key={currency.code}
                                    type="button"
                                    onClick={() =>
                                        handleCurrencyChange(currency.code)
                                    }
                                    aria-pressed={isActive}
                                    className={`
                                        group relative 
                                        w-full text-left 
                                        rounded-xl px-4 py-3
                                        border cursor-pointer
                                        transition-all duration-200

                                        ${
                                            isActive
                                                ? `
                                                    bg-brand-teal/5
                                                    border-brand-teal/50
                                                    shadow-[0_5px_18px_var(--shadow-teal-soft)]
                                                `
                                                : `
                                                    bg-[rgba(255,255,255,0.25)]
                                                    border-[rgba(255,255,255,0.55)]
                                                    hover:bg-brand-red/10
                                                    hover:border-brand-red/50
                                                    hover:-translate-y-0.5
                                                    hover:shadow-[0_5px_18px_var(--shadow-expense-soft)]
                                                `
                                        }
                                    `}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <h4
                                                className={`
                                                    text-sm sm:text-base
                                                    font-semibold
                                                    truncate
                                                    transition-colors duration-200
                                                    ${
                                                        isActive
                                                            ? "text-brand-teal"
                                                            : "text-(--text-primary)"
                                                    }
                                                `}
                                            >
                                                {currency.name}
                                            </h4>

                                            <p
                                                className="
                                                    text-xs sm:text-sm
                                                    text-(--text-secondary)
                                                    font-[Basic] mt-0.5
                                                "
                                            >
                                                {currency.code} ·{" "}
                                                {currency.symbol}
                                            </p>
                                        </div>

                                        {/* Active Indicator */}
                                        {isActive && (
                                            <span
                                                className="
                                                    shrink-0 w-6 h-6
                                                    flex items-center justify-center
                                                    rounded-full text-white
                                                    bg-brand-teal
                                                    shadow-[0_4px_12px_var(--shadow-teal)]
                                                "
                                            >
                                                <Check size={14} strokeWidth={2.5} />
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
