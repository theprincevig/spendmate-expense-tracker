export default function DeleteAlert({ content, onDelete }) {
    return (
        <>
            <p className="text-base font-[Basic] tracking-wider text-(--text-secondary)">
                {content}
            </p>

            <div className="flex justify-end mt-6">
                <button 
                    type="button"
                    onClick={onDelete}
                    className="expense-btn"
                >
                    Delete
                </button>
            </div>
        </>
    );
}