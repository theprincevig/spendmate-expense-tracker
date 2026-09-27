import { useMemo } from "react";
import { prepareIncomeBarChartData } from "../../lib/helper";
import { Plus } from "lucide-react";
import CustomBarChart from "../charts/CustomBarChart";

export default function IncomeOverview({
    currency,
    transactions,
    onAddIncome
}) {
    const chartData = useMemo(() => 
        prepareIncomeBarChartData(transactions),
    [transactions]);

    if (!currency) return null;

    return (
        <div className="glass card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h5 className="text-base sm:text-lg font-semibold text-(--text-primary)">
                        Income Overview
                    </h5>

                    <p className="text-xs font-[Basic] tracking-wider text-(--text-secondary)">
                        Track your earnings over time and analyze your income trends.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onAddIncome}
                    className="income-btn"
                >
                    <Plus size={16} />
                    Add Income
                </button>
            </div>

            <div className="mt-10">
                <CustomBarChart 
                    data={chartData}
                    currency={currency}
                    labelKey="source"
                />
            </div>
        </div>
    );
}