"use client";

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

// Simple Sheet Implementation for Slide-over
interface SheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    children: React.ReactNode
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={() => onOpenChange(false)}
            />
            {/* Panel */}
            <div className="relative z-50 w-full max-w-md h-full bg-[#151515] border-l border-[#262626] shadow-2xl animate-in slide-in-from-right duration-300 p-6 overflow-y-auto">
                {/* Close Button */}
                <button
                    onClick={() => onOpenChange(false)}
                    className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
                {children}
            </div>
        </div>
    )
}

export function SheetHeader({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={cn("mb-6", className)}>{children}</div>
}

export function SheetTitle({ children, className }: { children: React.ReactNode, className?: string }) {
    return <h2 className={cn("text-xl font-bold text-white", className)}>{children}</h2>
}

export function SheetDescription({ children, className }: { children: React.ReactNode, className?: string }) {
    return <p className={cn("text-sm text-zinc-400 mt-1", className)}>{children}</p>
}
