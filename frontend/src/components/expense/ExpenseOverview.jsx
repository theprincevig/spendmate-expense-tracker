import { useMemo } from "react";
import { prepareExpenseLineChartData } from "../../lib/helper";
import { Plus } from "lucide-react";
import CustomLineChart from "../charts/CustomLineChart";

export default function ExpenseOverview({
    currency,
    transactions,
    onAddExpense
}) {
    const chartData = useMemo(() => 
        prepareExpenseLineChartData(transactions),
    [transactions]);
    
    if (!currency) return null;

    return (
        <div className="glass card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h5 className="text-base sm:text-lg font-semibold text-(--text-primary)">
                        Expense Overview
                    </h5>
                    <p className="text-xs font-[Basic] tracking-wider text-(--text-secondary)">
                        Track your expenses over time and analyze your expense trends.
                    </p>
                </div>

                <button
                    onClick={onAddExpense}
                    className="expense-btn"
                >
                    <Plus size={16} />
                    Add Expense
                </button>
            </div>

            <div className="mt-10">
                <CustomLineChart 
                    data={chartData}
                    currency={currency}
                />
            </div>
        </div>
    );
}