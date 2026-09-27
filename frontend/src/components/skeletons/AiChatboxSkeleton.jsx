export default function AiChatboxSkeleton() {
    return (
        <div className="w-full h-full flex flex-col overflow-hidden bg-[#F6F8FA]/60">

            {/* Messages Skeleton */}
            <div className="flex-1 space-y-4 p-4 sm:p-6 overflow-hidden">

                {/* Date */}
                <div className="flex justify-center">
                    <div
                        className="
                            h-6 w-24
                            rounded-full
                            bg-white/70
                            border border-white/80
                            shimmer
                        "
                    />
                </div>

                {/* AI message */}
                <div className="flex justify-start">
                    <div
                        className="
                            h-12 w-2/3
                            rounded-2xl rounded-bl-md
                            bg-white/75
                            border border-white/80
                            shimmer
                        "
                    />
                </div>

                {/* User message */}
                <div className="flex justify-end">
                    <div
                        className="
                            h-10 w-1/2
                            rounded-2xl rounded-br-md
                            bg-[#00BFA6]/25
                            shimmer
                        "
                    />
                </div>

                {/* AI message */}
                <div className="flex justify-start">
                    <div
                        className="
                            h-16 w-3/4
                            rounded-2xl rounded-bl-md
                            bg-white/75
                            border border-white/80
                            shimmer
                        "
                    />
                </div>

                {/* User message */}
                <div className="flex justify-end">
                    <div
                        className="
                            h-10 w-1/3
                            rounded-2xl rounded-br-md
                            bg-[#00BFA6]/25
                            shimmer
                        "
                    />
                </div>
            </div>

            {/* Input Skeleton */}
            <div
                className="
                    w-full
                    p-4
                    sm:p-5
                    space-y-3
                    bg-white/70
                    border-t border-white/80
                    backdrop-blur-xl
                "
            >

                {/* Quick actions */}
                <div className="flex gap-2 overflow-hidden">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="
                                h-8 w-28
                                shrink-0
                                rounded-full
                                bg-white/70
                                border border-white/80
                                shimmer
                            "
                        />
                    ))}
                </div>

                {/* Input */}
                <div className="flex gap-2">
                    <div
                        className="
                            flex-1
                            h-11
                            rounded-full
                            bg-white/70
                            border border-white/80
                            shimmer
                        "
                    />

                    <div
                        className="
                            h-11 w-11
                            shrink-0
                            rounded-full
                            bg-[#00BFA6]/30
                            shimmer
                        "
                    />
                </div>
            </div>
        </div>
    );
}