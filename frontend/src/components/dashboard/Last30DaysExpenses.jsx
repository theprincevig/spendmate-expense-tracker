import { useMemo } from "react";
import { prepareExpenseBarChartData } from "../../lib/helper";
import CustomBarChart from "../charts/CustomBarChart";


export default function Last30DaysExpenses({ data, currency }) {
    const chartData = useMemo(() => 
        prepareExpenseBarChartData(data),
    [data]);

    if (!currency) return null;

    return (
        <div className="glass card col-span-1 hover:translate-x-1">
            <div className="flex items-center justify-between">
                <h5 className="text-lg font-semibold text-(--text-primary)">
                    Last 30 Days Expenses
                </h5>
            </div>

            <CustomBarChart 
                data={chartData}
                currency={currency}
                labelKey="category"
            />
        </div>
    );
}