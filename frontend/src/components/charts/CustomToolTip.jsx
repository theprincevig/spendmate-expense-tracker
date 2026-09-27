import { useExchangeRateStore } from "../../store/useExchangeRateStore";
import { formatPrice } from "../../utils/formatPrice";

export default function CustomToolTip({ active, payload, currency }) {
    const { rates, isFetchingRates } = useExchangeRateStore();
    
    if (!active || !payload || !payload.length) return null;

    const { name, value } = payload[0];

    return (
        <div className="
            glass
            min-w-[180px] rounded-xl p-3
        ">
            <p className="text-xs font-semibold text-(--text-primary) mb-1.5">{name}</p>
            <p className="text-xs text-(--text-secondary)">
                Amount:{" "}
                <span className="text-sm font-semibold text-(--text-primary)">
                    {isFetchingRates && currency !== "INR" ? (
                        <span className="w-24 h-3 shimmer inline-block rounded-full" />
                    ) : (
                        <>
                            {formatPrice({
                                amount: value,
                                userCurrency: currency,
                                rates
                            })}
                        </>
                    )}
                </span>
            </p>
        </div>
    );
}