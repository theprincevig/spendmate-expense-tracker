import { PasswordShowcase } from "../password/PasswordShowcase";

export default function PasswordLayout({ children }) {
    return (
        <div className="min-h-screen flex">
            {/* ================================
                LEFT / FORM SECTION
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
                RIGHT / PASSWORD VISUAL
            ================================= */}
            <div className="
                relative
                hidden md:block
                w-[40vw]
                
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
                    {/* Headline */}
                    <div className="mt-16 text-center">
                        <h1 className="
                            text-3xl lg:text-4xl
                            font-[Genos]
                            font-semibold
                            tracking-tight
                            text-(--text-primary)
                        ">
                            Keep your account
                            <span className="brand-gradient-text"> secure.</span>
                        </h1>

                        <p className="
                            mt-2
                            text-sm
                            font-[Basic]
                            text-(--text-secondary)
                        ">
                            One flow for every password moment.
                        </p>
                    </div>

                    {/* Mock Password Card */}
                    <div className="
                        flex-1
                        flex items-center justify-center
                    ">
                        <PasswordShowcase />
                    </div>

                    {/* Bottom spacer to balance headline */}
                    <div className="mb-12" />
                </div>
            </div>
        </div>
    );
}
