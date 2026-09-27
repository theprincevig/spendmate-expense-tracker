import Input from "../inputs/Input";
import EmojiPickerPopup from "../EmojiPickerPopup";
import { Plus } from "lucide-react";

export default function AddIncomeForm({
    data,
    setData,
    onAddIncome,
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
                placeholder="Freelance, Salary, etc."
                value={data.source}
                label="Income Source"
                onChange={handleChange("source")}
                error={errors.source}
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
                error={errors.data}
            />

            <div className="flex justify-end mt-6">
                <button
                    type="button"
                    onClick={onAddIncome}
                    className="income-btn"
                >
                    Add <Plus size={14} />
                </button>
            </div>
        </>
    );
}