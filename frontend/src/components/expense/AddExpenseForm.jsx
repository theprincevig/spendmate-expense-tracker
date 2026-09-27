import { Plus } from "lucide-react";
import EmojiPickerPopup from "../EmojiPickerPopup";
import Input from "../inputs/Input";

export default function AddExpenseForm({
    data,
    setData,
    onAddExpense,
    errors,
    setErrors
}) {
    const handleChange = (field) => (e) => {
        setData(prev => ({
            ...prev,
            [field]: e.target.value
        }));
        
        setErrors(prev => ({
            ...prev,
            [field]: ""
        }));
    };
    
    return (
        <>
            <EmojiPickerPopup 
                icon={data.icon}
                onSelected={(selectedIcon) => {
                    setData((prev) => ({
                        ...prev,
                        icon: selectedIcon
                    }));

                    setErrors((prev) => ({
                        ...prev,
                        icon: ""
                    }));
                }}
            />

            <Input 
                type="text"
                placeholder="Rent, Groceries, Clothes, etc."
                value={data.category}
                label="Expense Category"
                onChange={handleChange("category")}
                error={errors.category}
            />

            <Input 
                type="number"
                placeholder="Add Amount"
                value={data.amount}
                label="Amount"
                onChange={handleChange("amount")}
                error={errors.amount}
            />

            <Input 
                type="date"
                placeholder=""
                value={data.date}
                label="Date"
                onChange={handleChange("date")}
                error={errors.date}
            />
            
            <div className="flex justify-end mt-6">
                <button
                    type="button"
                    onClick={onAddExpense}
                    className="expense-btn"
                >
                    Add <Plus size={14} />
                </button>
            </div>
        </>
    );
}