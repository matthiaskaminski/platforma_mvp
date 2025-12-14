import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-[48px] w-full rounded-lg bg-[#1B1B1B] px-4 py-2 text-sm text-[#EDEDED] border border-transparent ring-offset-transparent file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#6E6E6E] focus-visible:outline-none focus-visible:border-[#262626] focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#252525] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-datetime-edit]:text-[#EDEDED]",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
