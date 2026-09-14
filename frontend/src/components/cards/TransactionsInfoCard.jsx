import { Bug, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { useExchangeRateStore } from "../../store/useExchangeRateStore";
import { formatPrice } from "../../utils/formatPrice";

export default function TransactionsInfoCard({
    title,
    icon,
    date,
    amount,
    type,
    currency,
    onDelete,
    hideDeleteBtn
}) {
    const { rates, isFetchingRates } = useExchangeRateStore();
    const isIncome = type === "income";

    const amountStyles = isIncome
        ? "bg-brand-teal/10 text-[#008F7A] border-brand-teal/10"
        : "bg-brand-red/10 text-[#E52A46] border-brand-red/10";

    const iconStyles = isIncome
        ? "bg-brand-teal/8 text-income"
        : "bg-brand-red/8 text-expense";

    return (
        <div
            className="
                glass
                group relative
                flex items-center gap-3 md:gap-4
                mt-2 py-2 px-3 rounded-xl
            "
        >
            {/* Transaction Icon */}
            <div
                className={`
                    w-11 h-11 md:w-12 md:h-12
                    shrink-0 flex items-center justify-center
                    rounded-xl ${iconStyles}
                    transition-all duration-200
                `}
            >
                {icon ? (
                    <img 
                        src={icon} 
                        alt={title} 
                        className="w-6 h-6"
                    />
                ) : (
                    <Bug />
                )}
            </div>

            <div className="min-w-0 flex-1 flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-sm text-(--text-primary) font-medium truncate">{title}</p>
                    <p className="text-xs text-(--text-secondary) mt-1">{date}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {/* Delete */}
                    {!hideDeleteBtn && (
                        <button
                            type="button"
                            onClick={onDelete}
                            aria-label={`Delete ${title}`}
                            className="delete-btn"
                        >
                            <Trash2 size={15} />
                        </button>
                    )}

                    {/* Amount */}
                    <div
                        className={`
                            flex items-center gap-1.5
                            px-2.5 py-1.5
                            rounded-lg border
                            ${amountStyles}
                        `}
                    >
                        <span className="text-xs font-semibold whitespace-nowrap">
                            {isIncome ? "+" : "-"}
                            {isFetchingRates && currency !== "INR" ? (
                                <span className="w-16 h-3 shimmer inline-block rounded ml-1" />
                            ) : (
                                <>
                                    {formatPrice({
                                        amount,
                                        userCurrency: currency,
                                        rates
                                    })}
                                </>
                            )}
                        </span>
                        
                        {isIncome ? (
                            <TrendingUp size={14} />
                        ) : (
                            <TrendingDown size={14} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}