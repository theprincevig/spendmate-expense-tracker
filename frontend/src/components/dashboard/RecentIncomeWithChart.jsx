import { useEffect, useState } from "react";
import CustomPieChart from "../charts/CustomPieChart";
import { COLOR_ARRAY } from "../../theme/theme";

export default function RecentIncomeWithChart({ currency, data, totalIncome }) {
    const [chartData, setChartData] = useState([]);

    function prepareChartData() {
        const dataArr = data?.map((item) => ({
            name: item?.source,
            amount: item?.amount
        }));

        setChartData(dataArr);
    }

    useEffect(() => {
        prepareChartData();

        return () => {}
    }, [data]);

    if (!currency) return null;

    return (
        <div className="glass card hover:-translate-x-1">
            <div className="flex items-center justify-between">
                <h5 className="text-lg font-semibold text-(--text-primary)">Last 60 Days Income</h5>
            </div>

            <CustomPieChart 
                data={chartData}
                label="Total Income"
                totalAmount={totalIncome}
                currency={currency}
                showTextAnchor
                colors={COLOR_ARRAY}
            />
        </div>
    );
}