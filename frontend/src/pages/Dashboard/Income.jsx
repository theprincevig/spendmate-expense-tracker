import { useEffect, useState } from "react";
import toast from 'react-hot-toast';

import { useIncomeStore } from "../../store/useIncomeStore";
import { useActiveCurrency } from "../../hooks/useActiveCurrency";
import { hasErrors, validateIncome } from "../../errors/errors";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import ExpenseNIncomeSkeleton from "../../components/skeletons/ExpenseNIncomeSkeleton";
import IncomeOverview from "../../components/income/IncomeOverview";
import IncomeList from "../../components/income/IncomeList";
import AddIncomeForm from "../../components/income/AddIncomeForm";
import DeleteAlert from "../../components/DeleteAlert";
import Modal from "../../components/Modal";

export default function Income() {
    const data = {
        source: "",
        amount: "",
        date: "",
        icon: ""
    };

    const [incomeFormData, setIncomeFormData] = useState(data);
    const [errors, setErrors] = useState(data);
    
    const [openAddIncomeModal, setOpenAddIncomeModal] = useState(false);
    const [openDeleteAlert, setOpenDeleteAlert] = useState({ show: false, data: null });

    const { 
        loading,
        incomeData,
        getIncome,
        addIncome,
        downloadIncomePdf,
        deleteIncome
    } = useIncomeStore();
    const activeCurrency = useActiveCurrency();

    useEffect(() => {
        getIncome();
    }, [getIncome]);

    async function handleAddIncome(e) {
        e.preventDefault();

        const newErrors = validateIncome({
            ...incomeFormData,
            icon: incomeFormData.icon
        });
        if (hasErrors(newErrors)) return setErrors(newErrors);

        try {
            await addIncome(incomeFormData);
            setErrors(data);
            setIncomeFormData(data);
            setOpenAddIncomeModal(false);
            toast.success("Income added successfully!");

        } catch (error) {
            console.error(error.message);
            toast.error(error.response?.data?.message || "Failed to add income.");
        }
    }

    async function handleDownloadIncomeDetails() {
        try {
            await downloadIncomePdf();
            toast.success("Income details PDF downloaded successfully!");
            
        } catch (error) {
            console.error(error.message);
            toast.error(error.response?.data?.message || "Failed to download PDF income details.");
        }
    }

    async function handleDeleteIncome(id) {
        try {
            await deleteIncome(id);
            setOpenDeleteAlert({ show: false, data: null });
            toast.success("Income details deleted successfully!");

        } catch (error) {
            console.error(error.message);
            toast.error(error.response?.data?.message || "Failed to delete income details.");
        }
    }

    return (
        <DashboardLayout activeMenu="Income">
            <div className="w-full max-w-[1500px] mx-auto py-2 md:py-4">
                {loading ? (
                    <ExpenseNIncomeSkeleton />
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-6">
                            <IncomeOverview 
                                currency={activeCurrency.code}
                                transactions={incomeData}
                                onAddIncome={() => setOpenAddIncomeModal(true)}
                            />

                            <IncomeList 
                                currency={activeCurrency.code}
                                transactions={incomeData} 
                                onDownloadPDF={handleDownloadIncomeDetails}
                                onDelete={(id) => setOpenDeleteAlert({ show: true, data: id })} 
                            />
                        </div>

                        <Modal
                            isOpen={openAddIncomeModal}
                            onClose={() => setOpenAddIncomeModal(false)}
                            title="Add Income"
                        >
                            <AddIncomeForm 
                                data={incomeFormData}
                                setData={setIncomeFormData}
                                onAddIncome={handleAddIncome}
                                errors={errors}
                                setErrors={setErrors}
                            />
                        </Modal>

                        <Modal 
                            isOpen={openDeleteAlert.show}
                            onClose={() => setOpenDeleteAlert({ show: false, data: null })}
                            title="Delete Income"
                        >
                            <DeleteAlert 
                                content="Are you sure you want to delete this income details?"
                                onDelete={() => handleDeleteIncome(openDeleteAlert.data)}
                            />
                        </Modal>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}