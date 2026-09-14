import { Download } from "lucide-react";
import TransactionsInfoCard from "../cards/TransactionsInfoCard";
import moment from "moment";

export default function ExpenseList({
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
                    Expense Source
                </h5>

                <button 
                    onClick={onDownloadPDF}
                    className="card-btn"
                >
                    <Download size={14} /> Download
                </button>
            </div>

            {/* Transactions */}
            <div className="mt-5">
                {transactions?.slice(0, 5)?.map((expense) => (
                    <TransactionsInfoCard 
                        type="expense"
                        key={expense._id}
                        title={expense.category}
                        amount={Number(expense.amount)}
                        icon={expense.icon}
                        currency={currency}
                        date={moment(expense.date).format("Do MMM YYYY")}
                        onDelete={() => onDelete(expense._id)}
                    />
                ))}

                {/* Empty State */}
                {!transactions?.length && (
                    <div className="py-8 text-center">
                        <p className="text-sm text-[#98A2B3]">
                            Expense list is empty yet
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}