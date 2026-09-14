import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { useActiveCurrency } from "../../hooks/useActiveCurrency";
import { useAiChatStore } from "../../store/useAiChatStore";
import { useExpenseStore } from "../../store/useExpenseStore";
import { hasErrors, validateExpense } from "../../errors/errors";

import ExpenseNIncomeSkeleton from "../../components/skeletons/ExpenseNIncomeSkeleton";
import ExpenseOverview from "../../components/expense/ExpenseOverview";
import ExpenseList from "../../components/expense/ExpenseList";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import AddExpenseForm from "../../components/expense/AddExpenseForm";
import AiFloatingButton from "../../components/chats/AiFloatingButton";
import AiModal from "../../components/AiModal";
import AiChatbox from "./AiChatbox";
import DeleteAlert from "../../components/DeleteAlert";
import Modal from "../../components/Modal";

export default function Expense() {
    const data = {
        category: "",
        amount: "",
        date: "",
        icon: ""
    };

    const [expenseFormData, setExpenseFormData] = useState(data);
    const [errors, setErrors] = useState(data);

    const [openAddExpenseModal, setOpenAddExpenseModal] = useState(false);
    const [openDeleteAlert, setOpenDeleteAlert] = useState({ show: false, data: null });

    const { isAiModalOpen, openAiModal, closeAiModal } = useAiChatStore();
    const activeCurrency = useActiveCurrency();

    const { 
        loading,
        expenseData,
        getExpense,
        addExpense,
        downloadExpensePdf,
        deleteExpense
    } = useExpenseStore();

    useEffect(() => {
        getExpense();
        return () => {};
    }, []);

    async function handleAddExpense(e) {
        e.preventDefault();

        const newErrors = validateExpense({
            ...expenseFormData,
            icon: expenseFormData.icon
        });
        if (hasErrors(newErrors)) return setErrors(newErrors);

        try {
            await addExpense(expenseFormData);
            setErrors(data);
            setExpenseFormData(data);
            setOpenAddExpenseModal(false);
            toast.success("Expense added successfully!");

        } catch (error) {
            console.error(error.message);
            toast.error(error.response?.data?.message || "Failed to add expense.");
        }
    }

    async function handleDownloadExpenseDetails() {
        try {
            await downloadExpensePdf();
            toast.success("Expense details PDF downloaded successfully!");

        } catch (error) {
            console.error(error.message);
            toast.error(error.response?.data?.message || "Failed to download PDF expense details.");
        }
    }

    async function handleDeleteExpense(id) {
        try {
            await deleteExpense(id);
            setOpenDeleteAlert({ show: false, data: null });
            toast.success("Expense details deleted successfully!");

        } catch (error) {
            console.error(error.message);
            toast.error(error.response?.data?.message || "Failed to delete expense details.");
        }
    }


    return (
        <DashboardLayout activeMenu="Expense">
            <div className="w-full max-w-[1500px] mx-auto py-2 md:py-4">
                {loading ? (
                    <ExpenseNIncomeSkeleton />
                ) : (
                    <>
                        <AiFloatingButton 
                            onClick={openAiModal}
                        />

                        <div className="grid grid-cols-1 gap-6">
                            <ExpenseOverview 
                                currency={activeCurrency.code}
                                transactions={expenseData}
                                onAddExpense={() => setOpenAddExpenseModal(true)}
                            />

                            <ExpenseList 
                                currency={activeCurrency.code}
                                transactions={expenseData} 
                                onDownloadPDF={handleDownloadExpenseDetails}
                                onDelete={(id) => setOpenDeleteAlert({ show: true, data: id })} 
                            />
                        </div>

                        
                        <AiModal
                            chatboxOpen={isAiModalOpen}
                            chatboxClose={closeAiModal}
                            chatboxTitle="AI Expense Assistant"
                        >
                            <AiChatbox />
                        </AiModal>

                        <Modal
                            isOpen={openAddExpenseModal}
                            onClose={() => setOpenAddExpenseModal(false)}
                            title="Add Expense"
                        >
                            <AddExpenseForm 
                                data={expenseFormData}
                                setData={setExpenseFormData}
                                onAddExpense={handleAddExpense} 
                                errors={errors}
                                setErrors={setErrors}
                            />
                        </Modal>

                        <Modal 
                            isOpen={openDeleteAlert.show}
                            onClose={() => setOpenDeleteAlert({ show: false, data: null })}
                            title="Delete Expense"
                        >
                            <DeleteAlert 
                                content="Are you sure, you want to delete this expense details?"
                                onDelete={() => handleDeleteExpense(openDeleteAlert.data)}
                            />
                        </Modal>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}