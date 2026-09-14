export default function ViewProfileSkeleton() {
    return (
        <div className="space-y-3 animate-pulse">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 md:gap-4">

                {/* ================================
                    Your Profile
                    ================================ */}
                <div className="glass card p-5 md:p-6">
                    {/* Heading */}
                    <div className="h-7 md:h-8 w-36 md:w-44 rounded-xl bg-gray-200 shimmer" />

                    {/* Profile content */}
                    <div className="flex flex-col items-center gap-2">

                        {/* Avatar */}
                        <div className="w-20 h-20 md:w-26 md:h-26 rounded-full bg-gray-200 shimmer" />

                        <div className="flex flex-col items-center">

                            {/* Name */}
                            <div className="h-7 md:h-8 w-36 md:w-48 rounded-xl bg-gray-200 shimmer" />

                            {/* DOB */}
                            <div className="flex items-center gap-2 mt-2">
                                <div className="h-4 w-4 rounded bg-gray-200 shimmer" />
                                <div className="h-4 w-28 md:w-32 rounded-lg bg-gray-200 shimmer" />
                            </div>

                            {/* Currency */}
                            <div className="h-9 w-24 md:w-28 rounded-full bg-gray-200 shimmer mt-4" />
                        </div>

                        {/* Edit button */}
                        <div className="w-full flex justify-end mt-2">
                            <div className="h-10 w-32 md:w-36 rounded-xl bg-gray-200 shimmer" />
                        </div>
                    </div>
                </div>


                {/* ================================
                    Account Details
                    ================================ */}
                <div className="glass card p-5 md:p-6">

                    {/* Heading */}
                    <div className="h-7 md:h-8 w-40 md:w-48 rounded-xl bg-gray-200 shimmer mb-6" />

                    {/* Info rows */}
                    <div className="space-y-4">

                        {[...Array(4)].map((_, index) => (
                            <div
                                key={index}
                                className="
                                    flex items-center gap-6
                                    text-sm md:text-base
                                    font-[Basic]
                                    tracking-wider
                                "
                            >
                                {/* Icon + label */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <div className="h-4 w-4 rounded bg-gray-200 shimmer" />
                                    <div className="h-4 w-20 md:w-24 rounded-lg bg-gray-200 shimmer" />
                                </div>

                                {/* Value */}
                                <div className="h-5 w-28 md:w-40 rounded-lg bg-gray-200 shimmer" />
                            </div>
                        ))}

                    </div>
                </div>
            </div>

            {/* ================================
                Advance Settings
                ================================ */}
            <div className="glass card p-5 md:p-6">
                <div className="flex items-center gap-3">
                    <div className="h-8 md:h-12 w-8 md:w-12 rounded-xl bg-gray-200 shimmer" />

                    <div className="flex flex-col gap-2">
                        <div className="h-2 md:h-3 w-10 md:w-20 rounded-xl bg-gray-200 shimmer" />
                        <div className="h-7 md:h-8 w-36 md:w-44 rounded-xl bg-gray-200 shimmer" />
                    </div>
                </div>
            </div>
        </div>
    );
}