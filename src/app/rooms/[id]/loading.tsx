export default function Loading() {
    return (
        <div className="h-full w-full flex items-center justify-center bg-[#0E0E0E]">
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-16 h-16">
                    {/* Spinning loader */}
                    <div className="absolute inset-0 rounded-full border-4 border-[#1B1B1B]"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
                </div>
                <p className="text-sm text-muted-foreground animate-pulse">Ładowanie pomieszczenia...</p>
            </div>
        </div>
    );
}
