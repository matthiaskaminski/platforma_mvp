import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "bg-[#151515] rounded-2xl p-4 text-[#EDEDED]",
            className
        )}
        {...props}
    />
))
Card.displayName = "Card"

export { Card }
