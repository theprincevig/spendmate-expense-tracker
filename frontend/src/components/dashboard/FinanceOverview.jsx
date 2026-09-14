import { COLOR_ARRAY } from "../../theme/theme";
import CustomPieChart from "../charts/CustomPieChart";

export default function FinanceOverview({
    currency,
    totalBalance,
    totalIncome,
    totalExpense
}) {
    const balanceData = [
        {
            name: "Total Balance",
            amount: totalBalance,
        },
        {
            name: "Total Income",
            amount: totalIncome,
        },
        {
            name: "Total Expenses",
            amount: totalExpense,
        },
    ];

    return (
        <div className="glass card hover:translate-x-1">
            {/* Header */}
            <div>
                <h5 className="text-lg font-semibold text-(--text-primary)">
                    Financial Overview
                </h5>

                <p className="text-xs text-(--text-secondary) font-[Basic] tracking-wider">
                    A quick look at your money
                </p>
            </div>

            {/* Chart */}
            <div className="mt-3">
                <CustomPieChart
                    data={balanceData}
                    label="Total Balance"
                    totalAmount={totalBalance}
                    currency={currency}
                    colors={COLOR_ARRAY}
                    showTextAnchor
                />
            </div>
        </div>
    );
}