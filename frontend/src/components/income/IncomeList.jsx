import { Download } from "lucide-react";
import TransactionsInfoCard from "../cards/TransactionsInfoCard";
import moment from "moment";

export default function IncomeList({
    currency,
    transactions,
    onDownloadPDF,
    onDelete
}) {
    if (!Array.isArray(transactions)) return null;

    return (
        <div className="glass card">
            <div className="flex items-center justify-between gap-4">
                <h5 className="text-lg font-semibold text-(--text-primary)">
                    Income Source
                </h5>

                <button 
                    onClick={onDownloadPDF}
                    className="glass card-btn"
                >
                    <Download size={14} /> Download
                </button>
            </div>

            {/* Transactions */}
            <div className="mt-5">
                {transactions?.slice(0, 5)?.map((income) => (
                    <TransactionsInfoCard 
                        type="income"
                        key={income._id}
                        title={income.source}
                        amount={Number(income.amount)}
                        icon={income.icon}
                        currency={currency}
                        date={moment(income.date).format("Do MMM YYYY")}
                        onDelete={() => onDelete(income._id)}
                    />
                ))}

                {/* Empty State */}
                {!transactions?.length && (
                    <div className="py-8 text-center">
                        <p className="text-sm text-(--text-secondary)">
                            Income list is empty yet
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}