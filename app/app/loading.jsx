
export default function Loading() {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Hero Skeleton */}
            <div className="h-64 rounded-[2.5rem] bg-slate-200 w-full" />

            {/* Grid Skeleton */}
            <div className="space-y-4">
                <div className="flex justify-between px-2">
                    <div className="h-8 w-48 bg-slate-200 rounded-xl" />
                    <div className="h-6 w-24 bg-slate-200 rounded-xl" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="h-48 rounded-[2rem] bg-slate-200" />
                    <div className="h-48 rounded-[2rem] bg-slate-200" />
                    <div className="h-48 rounded-[2rem] bg-slate-200" />
                </div>
            </div>
        </div>
    );
}
