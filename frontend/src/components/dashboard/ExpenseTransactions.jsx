import { ArrowRight } from "lucide-react";
import moment from "moment";
import TransactionsInfoCard from "../cards/TransactionsInfoCard";

export default function ExpenseTransactions({ currency, transactions, onSeeMore }) {
    if (!Array.isArray(transactions)) return null;

    return (
        <div className="glass card hover:-translate-x-1">
            <div className="flex items-center justify-between gap-4">
                <h5 className="text-lg font-semibold text-(--text-primary)">
                        Expenses
                </h5>

                <button 
                    className="glass card-btn"
                    onClick={onSeeMore}
                >
                    See All <ArrowRight size={14} />
                </button>
            </div>


            {/* Transactions */}
            <div className="mt-5">
                {transactions?.slice(0, 5)?.map((expense) => (
                    <TransactionsInfoCard 
                        key={expense._id}
                        type="expense"
                        title={expense.category}
                        amount={Number(expense.amount)}
                        icon={expense.icon}
                        currency={currency}
                        date={moment(expense.date).format("Do MMM YYYY")}
                        hideDeleteBtn
                    />
                ))}

                {/* Empty State */}
                {!transactions?.length && (
                    <div className="py-8 text-center">
                        <p className="text-sm text-(--text-secondary)">
                            No expense transactions found
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}