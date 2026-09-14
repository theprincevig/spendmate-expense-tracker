import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
    ResponsiveContainer
} from 'recharts';
import { useExchangeRateStore } from '../../store/useExchangeRateStore';
import { formatPrice } from '../../utils/formatPrice';

export default function CustomBarChart({
    data,
    currency,
    labelKey
}) {
    if (!currency) return null;

    const { rates, isFetchingRates } = useExchangeRateStore();

    // Function to alternate colors
    const getBarColor = (index) => {
        if (labelKey === "source") {
            return index % 2 === 0 
                ? "var(--brand-teal)" 
                : "var(--brand-lime)";
        }

        return index % 2 === 0
            ? "var(--brand-red)"
            : "var(--brand-coral)";
    };

    function CustomTooltip({ active, payload }) {
        if (!active || !payload || !payload.length) return null;

        // console.log("FULL PAYLOAD:", payload);
        // console.log("DATA OBJECT:", payload[0].payload);

        const { amount } = payload[0].payload;
        const label = payload[0].payload[labelKey];

        return (
            <div className="
                glass-subtle
                min-w-[180px] rounded-xl p-3
            ">
                <p className="text-xs font-semibold text-(--text-primary) mb-1.5">
                    {label}
                </p>
                <p className="text-xs text-(--text-secondary)">
                    Amount:{" "}
                    <span className="text-sm font-semibold text-(--text-primary)">
                        {isFetchingRates && currency !== "INR" ? (
                            <span className="w-24 h-3 shimmer inline-block rounded-full" />
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
                </p>
            </div>
        );
    }

    return (
        <div className="mt-6">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                    data={data}
                    margin={{ top: 10, right: 10, left: 12, bottom: 0 }}
                >
                    <CartesianGrid stroke='none' />

                    <XAxis 
                        dataKey={labelKey}
                        tick={{
                            fontSize: 12,
                            fill: "var(--text-secondary)"
                        }}
                        stroke='none'
                        tickLine={false}
                    />
                    <YAxis 
                        tick={{
                            fontSize: 12,
                            fill: "var(--text-secondary)"
                        }} 
                        stroke='none'
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={
                            (value) => formatPrice({
                                amount: value,
                                userCurrency: currency,
                                rates
                            })
                        }
                    />

                    <Tooltip 
                        content={<CustomTooltip />}
                        cursor={{
                            fill:
                                labelKey === "source"
                                    ? "color-mix(in srgb, var(--brand-teal) 5%, transparent)"
                                    : "color-mix(in srgb, var(--brand-red) 5%, transparent)"
                        }}
                    />

                    <Bar 
                        dataKey="amount"
                        radius={[8, 8, 2, 2]}
                        maxBarSize={42}
                    >
                        {Array.isArray(data) &&
                            data?.map((_, index) => (
                                <Cell 
                                    key={index}
                                    fill={getBarColor(index)} 
                                />
                            ))
                        }
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}