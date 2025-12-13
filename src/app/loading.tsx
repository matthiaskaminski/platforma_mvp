export default function Loading() {
    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500 overflow-hidden p-0 space-y-3">
            {/* Header Skeleton */}
            <div className="h-[80px] w-full rounded-xl bg-[#1B1B1B] animate-pulse shrink-0 border border-white/5" />

            {/* Grid Layout Skeleton */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 flex-1 min-h-0">

                {/* Left Column (3) */}
                <div className="xl:col-span-3 flex flex-col gap-3 h-full min-h-0">
                    {/* Tiles Grid Skeleton */}
                    <div className="grid grid-cols-2 gap-2 flex-1 min-h-0">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-full rounded-2xl bg-[#1B1B1B] animate-pulse border border-white/5" />
                        ))}
                    </div>
                    {/* Calendar Skeleton */}
                    <div className="h-[340px] rounded-xl bg-[#1B1B1B] animate-pulse shrink-0 border border-white/5" />
                </div>

                {/* Right Column (9) */}
                <div className="xl:col-span-9 flex flex-col gap-3 h-full min-h-0">

                    {/* Budget Widget Skeleton */}
                    <div className="flex-1 min-h-[200px] rounded-xl bg-[#1B1B1B] animate-pulse border border-white/5" />

                    {/* Middle Row: Tasks & Interactions */}
                    <div className="grid grid-cols-2 gap-3 flex-[1.4] min-h-0">
                        <div className="h-full rounded-xl bg-[#1B1B1B] animate-pulse border border-white/5" />
                        <div className="h-full rounded-xl bg-[#1B1B1B] animate-pulse border border-white/5" />
                    </div>

                    {/* Bottom Row: Products & Viz */}
                    <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
                        <div className="h-full rounded-xl bg-[#1B1B1B] animate-pulse border border-white/5" />
                        <div className="h-full rounded-xl bg-[#1B1B1B] animate-pulse border border-white/5" />
                    </div>
                </div>
            </div>
        </div>
    )
}
