import {
    ArrowDownLeft,
    ArrowUpRight,
    TrendingUpDown
} from "lucide-react";


export default function AuthLayout({ children }) {

    return (
        <div className="min-h-screen flex">
            {/* ================================
                LEFT / AUTH SECTION
            ================================= */}

            <div className="w-screen min-h-screen md:w-[60vw]">
                <div className="p-2 md:p-3">
                    <img
                        src="/spendmate-logo.png"
                        alt="spendmate"
                        className="w-40 md:w-45 object-contain"
                    />
                </div>

                <div className="px-6 py-8 md:p-12">
                    {children}
                </div>
            </div>


            {/* ================================
                RIGHT / BRAND VISUAL
            ================================= */}

            <div className="
                relative
                hidden md:block
                w-[40vw]
                h-screen
                overflow-hidden
                p-8
            ">
                {/* Background Glass */}
                <div className="absolute inset-0 glass" />


                {/* Ambient Glows */}
                <div className="
                    absolute
                    w-80 h-80
                    rounded-full
                    bg-brand-red/20
                    blur-[100px]
                    -top-24 -right-24
                " />

                <div className="
                    absolute
                    w-80 h-80
                    rounded-full
                    bg-brand-teal/20
                    blur-[100px]
                    -bottom-24 -left-24
                " />

                <div className="
                    absolute
                    w-56 h-56
                    rounded-full
                    bg-brand-lime/20
                    blur-[90px]
                    top-[45%]
                    right-[15%]
                " />


                {/* ================================
                    Decorative Shapes
                ================================= */}

                <div className="
                    absolute
                    w-52 h-52
                    rounded-[45px]
                    -top-12 -left-12
                    rotate-12
                    bg-linear-to-br
                    from-brand-red/20
                    to-brand-coral/5
                " />

                <div className="
                    absolute
                    w-52 h-64
                    rounded-[45px]
                    top-[32%] -right-16
                    -rotate-12
                    bg-linear-to-br
                    from-brand-teal/20
                    to-brand-lime/5
                " />

                <div className="
                    absolute
                    w-44 h-44
                    rounded-[45px]
                    -bottom-16 -left-10
                    rotate-12
                    bg-linear-to-br
                    from-brand-lime/20
                    to-brand-teal/5
                " />


                {/* ================================
                    Content
                ================================= */}

                <div className="relative z-10 h-full flex flex-col">
                    {/* Stats */}
                    <div className="mt-20">

                        <StatsInfoCard
                            icon={<TrendingUpDown size={23} />}
                            label="Track your Income & Expenses"
                            value="Smart & Simple"
                        />

                    </div>

                    {/* Financial Flow */}
                    <div className="
                        flex-1
                        flex items-center justify-center
                    ">
                        <div className="relative">
                            {/* Main Glass Circle */}
                            <div className="
                                glass-strong
                                w-64 h-64
                                rounded-full
                                flex items-center justify-center
                            ">
                                <div className="
                                    glass
                                    w-44 h-44
                                    rounded-full
                                    flex items-center justify-center
                                ">

                                    <img
                                        src="/logo.png"
                                        alt="SpendMate icon"
                                        className="w-32 object-contain"
                                    />
                                </div>
                            </div>


                            {/* Income */}
                            <FlowCard
                                position="-top-8 -right-12"
                                icon={
                                    <ArrowUpRight size={18} />
                                }
                                iconClass="income-gradient"
                                label="Income"
                                value="Tracked"
                            />


                            {/* Expense */}
                            <FlowCard
                                position="-bottom-8 -left-12"
                                icon={
                                    <ArrowDownLeft size={18} />
                                }
                                iconClass="expense-gradient"
                                label="Expenses"
                                value="Organized"
                            />

                        </div>
                    </div>


                    {/* Bottom Message */}
                    <div className="mb-12 text-center">
                        <h1 className="
                            text-3xl lg:text-4xl
                            font-[Genos]
                            font-semibold
                            tracking-tight
                            text-(--text-primary)
                        ">
                            Your money.
                            <span className="brand-gradient-text">
                                {" "}Your control.
                            </span>
                        </h1>

                        <p className="
                            text-sm
                            font-[Basic]
                            text-(--text-secondary)
                        ">
                            Track, understand and manage your finances
                            effortlessly.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}


/* ==================================================
   Flow Card
   ================================================== */

const FlowCard = ({
    position,
    icon,
    iconClass,
    label,
    value
}) => {

    return (
        <div
            className={`
                glass-subtle
                absolute
                ${position}
                flex items-center gap-3
                px-4 py-3
                rounded-2xl
            `}
        >
            <div
                className={`
                    ${iconClass}
                    w-9 h-9
                    rounded-full
                    flex items-center justify-center
                    text-white
                `}
            >
                {icon}
            </div>

            <div>
                <p className="
                    text-[10px]
                    text-(--text-secondary)
                ">
                    {label}
                </p>

                <p className="
                    text-sm
                    font-[Basic]
                    font-semibold
                    tracking-wider
                    text-(--text-primary)
                ">
                    {value}
                </p>
            </div>
        </div>
    );
};


/* ==================================================
   Stats Info Card
   ================================================== */

const StatsInfoCard = ({
    icon,
    label,
    value
}) => {

    return (
        <div className="
            glass
            relative
            flex items-center gap-4
            w-full
            p-4
            rounded-2xl
        ">
            <div className="
                brand-gradient
                w-12 h-12
                shrink-0
                flex items-center justify-center
                text-white
                rounded-full
            ">
                {icon}
            </div>

            <div className="flex flex-col justify-center">
                <h6 className="
                    text-xs
                    text-(--text-secondary)
                ">
                    {label}
                </h6>

                <p className="
                    text-xl
                    font-semibold
                    font-[Genos]
                    text-(--text-primary)
                ">
                    {value}
                </p>
            </div>
        </div>
    );
};