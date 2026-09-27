import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

import CustomToolTip from "./CustomToolTip";
import CustomLegend from "./CustomLegend";

import { useExchangeRateStore } from "../../store/useExchangeRateStore";
import { formatPrice } from "../../utils/formatPrice";

export default function CustomPieChart({
    data,
    label,
    totalAmount,
    currency,
    colors,
    showTextAnchor,
}) {
    const { rates, isFetchingRates } = useExchangeRateStore();

    return (
        <ResponsiveContainer width="100%" height={380}>
            <PieChart>
                <Pie
                    data={data}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    outerRadius={125}
                    innerRadius={92}
                    paddingAngle={2}
                    cornerRadius={4}
                    labelLine={false}
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={colors[index % colors.length]}
                            stroke="none"
                        />
                    ))}
                </Pie>

                {/* Tooltip */}
                <Tooltip
                    content={
                        <CustomToolTip currency={currency} />
                    }
                />

                {/* Legend */}
                <Legend
                    content={<CustomLegend />}
                    verticalAlign="bottom"
                />

                {/* Center Text */}
                {showTextAnchor && (
                    <>
                        <text
                            x="50%"
                            y="45%"
                            dy={-12}
                            textAnchor="middle"
                            fill="#667085"
                            fontSize="13px"
                        >
                            {label}
                        </text>

                        <text
                            x="50%"
                            y="45%"
                            dy={20}
                            textAnchor="middle"
                            fill="#171A1F"
                            fontSize="22px"
                            fontWeight="600"
                        >
                            {isFetchingRates && currency !== "INR" ? (
                                <tspan>
                                    Loading...
                                </tspan>
                            ) : (
                                formatPrice({
                                    amount: totalAmount,
                                    userCurrency: currency,
                                    rates,
                                })
                            )}
                        </text>
                    </>
                )}
            </PieChart>
        </ResponsiveContainer>
    );
}