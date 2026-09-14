export default function CustomLegend({ payload }) {
    return (
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-5">
            {payload.map((entry, index) => (
                <div
                    key={`legend-${index}`}
                    className="flex items-center gap-2"
                >
                    <div 
                        className="w-2.5 h-2.5 rounded-full shadow-sm"
                        style={{ background: entry.color }}
                    >

                    </div>

                    <span className="text-xs text-(--text-secondary) font-medium">
                        {entry.value}
                    </span>
                </div>
            ))}
        </div>
    );
}