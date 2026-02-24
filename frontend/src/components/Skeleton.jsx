/**
 * Reusable skeleton loaders for loading states
 */
export function CardSkeleton() {
    return (
        <div className="glass-card p-6 space-y-4">
            <div className="skeleton h-4 w-1/3" />
            <div className="skeleton h-8 w-1/2" />
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-3/4" />
        </div>
    )
}

export function TableSkeleton({ rows = 5 }) {
    return (
        <div className="glass-card p-6 space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                    <div className="skeleton h-8 w-8 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="skeleton h-3 w-1/3" />
                        <div className="skeleton h-3 w-1/2" />
                    </div>
                    <div className="skeleton h-6 w-16 rounded-full" />
                </div>
            ))}
        </div>
    )
}
