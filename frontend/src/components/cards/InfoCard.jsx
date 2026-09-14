import { useExchangeRateStore } from "../../store/useExchangeRateStore";
import { getCardTheme } from "../../theme/theme";
import { formatPrice } from "../../utils/formatPrice";

export default function InfoCard({
    icon,
    label,
    value,
    currency,
    color
}) {
    const { rates, isFetchingRates } = useExchangeRateStore();
    const cardTheme = getCardTheme(color);

    return (
        <div
            className="
                glass card
                flex items-center gap-4 md:gap-5
                overflow-hidden
                hover:-translate-y-1
            "
        >
            {/* Subtle accent */}
            <div
                className={`
                    absolute left-0 top-0
                    bottom-0 w-1 ${cardTheme.accent}
                `}
            />

            {/* Icon */}
            <div
                className={`
                    w-12 h-12 md:w-14 md:h-14
                    shrink-0 flex items-center justify-center
                    ${cardTheme.icon} ${cardTheme.iconColor}
                    rounded-2xl shadow-lg shadow-black/5
                `}
            >
                {icon}
            </div>

            <div className="min-w-0">
                <h6 className="text-sm text-(--text-secondary) mb-1">{ label }</h6>
                <p className="text-xl md:text-2xl font-semibold text-(--text-primary) truncate">
                    {isFetchingRates && currency !== "INR" ? (
                        <span className="w-32 md:w-40 h-5 shimmer rounded-md inline-block" />
                    ) : (
                        <>
                            {formatPrice({
                                amount: value,
                                userCurrency: currency,
                                rates
                            })}
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}