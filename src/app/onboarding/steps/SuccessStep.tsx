'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Check, Plus } from 'lucide-react'
import { completeOnboarding } from '../actions'

export default function SuccessStep() {
    const [loading, setLoading] = useState(false)

    const handleComplete = async () => {
        setLoading(true)
        try {
            await completeOnboarding()
            // Redirect happens in action
        } catch (error) {
            console.error(error)
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 bg-white text-black rounded-lg flex items-center justify-center mb-4">
                {/* Using a custom icon or shape resembling the logo in the screenshot */}
                <Check className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-bold tracking-tight">Twoje konto zostało utworzone</h2>
            <p className="text-muted-foreground text-sm max-w-md">
                Już teraz możesz utworzyć swój pierwszy projekt i dodać dane klienta.
            </p>

            <Button
                className="bg-white text-black hover:bg-gray-200 h-12 px-8"
                onClick={handleComplete}
                disabled={loading}
            >
                {loading ? 'Tworzenie...' : (
                    <span className="flex items-center gap-2">
                        Utwórz pierwszy projekt <Plus className="w-4 h-4" />
                    </span>
                )}
            </Button>
        </div>
    )
}
