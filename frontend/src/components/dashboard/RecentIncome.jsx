import { ArrowRight } from "lucide-react";
import moment from "moment";
import TransactionsInfoCard from "../cards/TransactionsInfoCard";

export default function RecentIncome({ currency, transactions, onSeeMore }) {
    if (!Array.isArray(transactions)) return null;

    return (
        <div className="glass card hover:translate-x-1">
            <div className="flex items-center justify-between gap-4">
                <h5 className="text-lg font-semibold text-(--text-primary)">
                    Income
                </h5>

                <button
                    className="glass card-btn"
                    onClick={onSeeMore}
                >
                    See more <ArrowRight size={14} />
                </button>
            </div>

            {/* Transactions */}
            <div className="mt-5">
                {transactions?.slice(0, 5)?.map((income) => (
                    <TransactionsInfoCard 
                        key={income._id}
                        type="income"
                        title={income.source}
                        amount={Number(income.amount)}
                        icon={income.icon}
                        currency={currency}
                        date={moment(income.date).format("Do MMM YYYY")}
                        hideDeleteBtn
                    />
                ))}

                {/* Empty State */}
                {!transactions?.length && (
                    <div className="py-8 text-center">
                        <p className="text-sm text-(--text-secondary)">
                            No income transactions found
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}