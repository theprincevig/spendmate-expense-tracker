import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { useExchangeRateStore } from '../../store/useExchangeRateStore';
import { formatPrice } from '../../utils/formatPrice';

export default function CustomLineChart({ data, currency }) {
    if (!currency) return null;

    const { rates, isFetchingRates } = useExchangeRateStore();

    function CustomTooltip({ active, payload }) {
        if (!active || !payload || !payload.length) return null;

        const { category, amount } = payload[0].payload;
    
        return (
            <div className="
                glass-subtle
                min-w-[180px] rounded-xl p-3
            ">
                <p className="text-xs font-semibold text-(--text-primary) mb-1.5">
                    {category}
                </p>
                <span className="text-sm text-(--text-secondary)">
                    Amount:{" "}
                    <span className="text-sm font-medium text-(--text-primary)">
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
                </span>
            </div>
        );
    }

    return (
        <div className="mt-6">
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: 12, bottom: 0 }}
                >
                    <defs>
                        <linearGradient
                            id="expenseGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="0%"
                                stopColor="var(--expense)"
                                stopOpacity={0.28}
                            />

                            <stop
                                offset="100%"
                                stopColor="var(--brand-coral)"
                                stopOpacity={0}
                            />
                        </linearGradient>
                    </defs>

                    <CartesianGrid stroke='none' />
                    <XAxis
                        dataKey="month"
                        tick={{
                            fontSize: 12,
                            fill: "var(--text-secondary)"
                        }}
                        stroke="none"
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
                        tickFormatter={(value) => formatPrice({
                            amount: value,
                            userCurrency: currency,
                            rates
                        })}
                    />

                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{
                            stroke: "var(--expense)",
                            strokeOpacity: 0.15
                        }}
                    />

                    <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="var(--expense)"
                        fill="url(#expenseGradient)"
                        strokeWidth={2.5}
                        activeDot={{
                            r: 5,
                            fill: "var(--expense)",
                            stroke: "#FFFFFF",
                            strokeWidth: 2
                        }}
                        dot={{
                            r: 3,
                            fill: "var(--expense)",
                            stroke: "#FFFFFF",
                            strokeWidth: 1.5
                        }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}