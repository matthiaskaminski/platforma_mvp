"use client";

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"

interface SheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    children: React.ReactNode
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
    // Prevent scrolling when sheet is open
    React.useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; }
    }, [open]);

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                        onClick={() => onOpenChange(false)}
                    />

                    {/* Panel Container */}
                    <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
                        {/* Panel */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="pointer-events-auto relative w-full max-w-md h-full bg-[#151515] border-l border-[#262626] shadow-2xl p-6 overflow-y-auto"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => onOpenChange(false)}
                                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            {children}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}

export function SheetHeader({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={cn("mb-8", className)}>{children}</div>
}

export function SheetTitle({ children, className }: { children: React.ReactNode, className?: string }) {
    return <h2 className={cn("text-xl font-bold text-white", className)}>{children}</h2>
}

export function SheetDescription({ children, className }: { children: React.ReactNode, className?: string }) {
    return <p className={cn("text-sm text-zinc-400 mt-2", className)}>{children}</p>
}
