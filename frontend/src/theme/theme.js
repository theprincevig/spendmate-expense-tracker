export const getCardTheme = (color) => {
    switch (color) {
        case "income":
            return {
                icon: "bg-linear-to-br from-brand-teal to-brand-lime",
                iconColor: "text-white",
                accent: "bg-brand-lime",
            };

        case "expense":
            return {
                icon: "bg-linear-to-br from-brand-red to-brand-coral",
                iconColor: "text-white",
                accent: "bg-brand-red",
            };

        case "balance":
        default:
            return {
                icon: "bg-brand-teal",
                iconColor: "text-white",
                accent: "bg-brand-teal",
            };
    }
};

export const COLOR_ARRAY = [
    "#00BFA6", // Balance
    "#7ED957", // Income
    "#FF304F", // Expenses
];
