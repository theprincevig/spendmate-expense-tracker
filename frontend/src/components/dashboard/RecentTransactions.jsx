import { ArrowRight } from "lucide-react";
import moment from 'moment';
import TransactionsInfoCard from "../cards/TransactionsInfoCard";

export default function RecentTransactions({ currency, transactions, onSeeMore }) {
    return (
        <div className="glass card hover:-translate-x-1">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h5 className="text-lg font-semibold text-[#171A1F]">
                        Recent Transactions
                    </h5>

                    <p className="text-xs text-[#98A2B3] tracking-wider font-[Basic]">
                        Your latest financial activity
                    </p>
                </div>

                <button
                    type="button"
                    className="glass card-btn"
                    onClick={onSeeMore}
                >
                    See All <ArrowRight size={14} />
                </button>
            </div>

            {/* Transactions */}
            <div className="mt-5">
                {transactions?.slice(0, 5)?.map((item) => (
                    <TransactionsInfoCard
                        key={item._id}
                        type={item.type}
                        icon={item.icon}
                        amount={item.amount}
                        title={
                            item.type === "expense"
                                ? item.category
                                : item.source
                        }
                        date={moment(item.date).format("Do MMM YYYY")}
                        currency={currency}
                        hideDeleteBtn
                    />
                ))}

                {/* Empty State */}
                {!transactions?.length && (
                    <div className="py-8 text-center">
                        <p className="text-sm text-[#98A2B3]">
                            No recent transactions
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}