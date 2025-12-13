'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'

interface SuccessStepProps {
    title: string
    description: string
    buttonText: string
    icon?: React.ReactNode
    onNext?: () => void
    onComplete?: () => Promise<void>
}

export default function SuccessStep({
    title,
    description,
    buttonText,
    icon,
    onNext,
    onComplete
}: SuccessStepProps) {
    const [loading, setLoading] = useState(false)

    const handleClick = async () => {
        setLoading(true)
        try {
            if (onComplete) {
                await onComplete()
            }
            if (onNext) {
                onNext()
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 bg-white text-black rounded-lg flex items-center justify-center mb-4">
                {icon || <Plus className="w-8 h-8" />}
            </div>

            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            <p className="text-muted-foreground text-sm max-w-md">
                {description}
            </p>

            <Button
                className="bg-white text-black hover:bg-gray-200 h-12 px-8"
                onClick={handleClick}
                disabled={loading}
            >
                {loading ? 'Przetwarzanie...' : (
                    <span className="flex items-center gap-2">
                        {buttonText} {onComplete && !onNext ? '' : '→'}
                    </span>
                )}
            </Button>
        </div>
    )
}
