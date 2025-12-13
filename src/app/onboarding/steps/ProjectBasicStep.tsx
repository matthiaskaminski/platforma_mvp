'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Home, Settings, Building, Briefcase, User, Star, Box, Layout } from 'lucide-react'

interface ProjectBasicStepProps {
    onNext: (data: any) => void
    initialData?: any
}

const ICONS = [
    { id: 'Home', icon: Home },
    { id: 'Building', icon: Building },
    { id: 'Briefcase', icon: Briefcase },
    { id: 'Layout', icon: Layout },
    { id: 'Box', icon: Box },
    { id: 'Star', icon: Star },
]

const COLORS = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EF4444', '#14B8A6']

export default function ProjectBasicStep({ onNext, initialData }: ProjectBasicStepProps) {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        icon: initialData?.icon || 'Home',
        color: initialData?.color || '#8B5CF6',
        clientType: initialData?.clientType || 'PRIVATE' // PRIVATE or COMMERCIAL
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (formData.name) {
            onNext(formData)
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2 text-center sm:text-left">
                <h2 className="text-2xl font-bold tracking-tight">Utwórz projekt</h2>
                <p className="text-muted-foreground">Podstawowe informacje o nowym projekcie.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Nazwa projektu*</label>
                    <Input
                        required
                        placeholder="np. Apartament Złota 44"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="bg-[#1A1A1A] border-white/5"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Opis projektu</label>
                    <textarea
                        className="flex w-full rounded-md border border-white/5 bg-[#1A1A1A] px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                        placeholder="Krótki opis projektu..."
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium block">Ikona projektu</label>
                        <div className="grid grid-cols-3 gap-2">
                            {ICONS.map(({ id, icon: Icon }) => (
                                <button
                                    key={id}
                                    type="button"
                                    className={`aspect-square flex items-center justify-center rounded-lg border transition-all ${formData.icon === id
                                            ? 'bg-white text-black border-white'
                                            : 'bg-[#1A1A1A] border-white/5 text-gray-400 hover:bg-[#252525]'
                                        }`}
                                    onClick={() => setFormData({ ...formData, icon: id })}
                                >
                                    <Icon className="w-5 h-5" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium block">Kolor projektu</label>
                        <div className="grid grid-cols-4 gap-2">
                            {COLORS.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    className={`aspect-square rounded-full transition-transform hover:scale-110 relative ${formData.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''
                                        }`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setFormData({ ...formData, color })}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium block">Typ klienta</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            className={`p-4 rounded-xl border text-left transition-all ${formData.clientType === 'PRIVATE'
                                    ? 'bg-white text-black border-white'
                                    : 'bg-[#1A1A1A] border-white/5 text-gray-400 hover:bg-[#252525]'
                                }`}
                            onClick={() => setFormData({ ...formData, clientType: 'PRIVATE' })}
                        >
                            <User className="w-6 h-6 mb-2" />
                            <div className="font-bold">Prywatny</div>
                        </button>
                        <button
                            type="button"
                            className={`p-4 rounded-xl border text-left transition-all ${formData.clientType === 'COMMERCIAL'
                                    ? 'bg-white text-black border-white'
                                    : 'bg-[#1A1A1A] border-white/5 text-gray-400 hover:bg-[#252525]'
                                }`}
                            onClick={() => setFormData({ ...formData, clientType: 'COMMERCIAL' })}
                        >
                            <Building className="w-6 h-6 mb-2" />
                            <div className="font-bold">Komercyjny</div>
                        </button>
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full bg-white text-black hover:bg-gray-200 mt-4 h-12"
                >
                    Dalej
                </Button>
            </form>
        </div>
    )
}
