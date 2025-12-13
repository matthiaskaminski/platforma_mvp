'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Upload } from 'lucide-react'
import { updateTheme } from '../actions'

interface ThemeStepProps {
    onNext: () => void
}

export default function ThemeStep({ onNext }: ThemeStepProps) {
    const [loading, setLoading] = useState(false)
    const [accentColor, setAccentColor] = useState('#8B5CF6') // Purple
    const [applyToAll, setApplyToAll] = useState(false)

    const handleSubmit = async () => {
        setLoading(true)
        try {
            await updateTheme({ accentColor, applyToAll, theme: 'dark' })
            onNext()
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col lg:flex-row gap-12 items-center animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-6xl">
            {/* Left Column: Controls */}
            <div className="w-full lg:w-1/3 space-y-8">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">Dostosuj wygląd platformy</h2>
                </div>

                <div className="space-y-4">
                    <div className="p-6 bg-[#151515] rounded-xl border border-white/5 space-y-4">
                        <h3 className="font-medium text-sm">Wgraj swój logotyp</h3>
                        <p className="text-xs text-gray-500">
                            Wgraj logotyp który będzie widoczny w dokumentacji którą wysyłasz swojemu klientowi.
                            <br />PNG lub SVG, maksymalnie 2mb
                        </p>
                        <div className="flex gap-4">
                            <button className="flex-1 aspect-square bg-[#0A0A0A] border border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-[#1A1A1A] transition-colors group">
                                <span className="text-xs font-medium text-gray-400 group-hover:text-white">Logotyp ciemny</span>
                                <Upload className="w-4 h-4 text-gray-600 group-hover:text-white" />
                            </button>
                            <button className="flex-1 aspect-square bg-white border border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors group">
                                <span className="text-xs font-medium text-gray-600 group-hover:text-black">Logotyp jasny</span>
                                <Upload className="w-4 h-4 text-gray-400 group-hover:text-black" />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        <h3 className="font-medium">Wybierz motyw</h3>
                        <p className="text-xs text-gray-500">Dostosuj motyw kolorystyczny do własnej identyfikacji wizualnej.</p>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Kolor akcentu</span>
                            <div className="flex gap-2">
                                {['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'].map(color => (
                                    <button
                                        key={color}
                                        className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${accentColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setAccentColor(color)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Zastosuj do wszystkich elementów</span>
                            <button
                                className={`w-10 h-6 rounded-full transition-colors relative ${applyToAll ? 'bg-white' : 'bg-gray-700'}`}
                                onClick={() => setApplyToAll(!applyToAll)}
                            >
                                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-black transition-transform ${applyToAll ? 'translate-x-4' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                <Button
                    className="w-full bg-white text-black hover:bg-gray-200 h-12"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? 'Zapisywanie...' : 'Kontynuuj →'}
                </Button>
            </div>

            {/* Right Column: Preview */}
            <div className="flex-1 w-full bg-[#151515] aspect-video rounded-2xl border border-white/5 p-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="h-full w-full flex items-center justify-center border border-dashed border-white/10 rounded-lg">
                    <span className="text-xs text-gray-600 font-mono">WIDOK DASHBOARDU</span>
                </div>

                {/* Simulated UI Elements to show accent color */}
                <div className="absolute top-8 left-8 right-8 flex gap-4 opacity-50">
                    <div className="w-16 h-16 bg-[#0A0A0A] rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                        <div className="w-1/3 h-4 bg-[#0A0A0A] rounded"></div>
                        <div className="w-1/2 h-4 bg-[#0A0A0A] rounded"></div>
                    </div>
                </div>

                <div
                    className="absolute bottom-8 right-8 px-4 py-2 rounded text-xs font-bold text-white shadow-lg transition-colors"
                    style={{ backgroundColor: accentColor }}
                >
                    Przykładowy Przycisk
                </div>
            </div>
        </div>
    )
}
