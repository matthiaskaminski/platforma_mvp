import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center gap-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default: "text-[#EDEDED]",
                secondary: "text-[#6E6E6E]",
                outline: "text-[#EDEDED]",
            },
            status: {
                none: "",
                finished: "text-zinc-400 [&_span]:bg-zinc-400",
                in_progress: "text-[#EDEDED] [&_span]:bg-[#91E8B2]",
                not_started: "text-[#EDEDED] [&_span]:bg-[#91A3E8]",
                overdue: "text-[#EDEDED] [&_span]:bg-[#E8B491]",
                completed: "text-[#B2B2B2] [&_span]:bg-[#B2B2B2]",
            },
        },
        defaultVariants: {
            variant: "default",
            status: "none",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
    dot?: boolean;
}

function Badge({ className, variant, status, dot = true, children, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant, status }), className)} {...props}>
            {dot && status !== 'none' && (
                <span className={cn("w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]")} />
            )}
            {children}
        </div>
    )
}

export { Badge, badgeVariants }
