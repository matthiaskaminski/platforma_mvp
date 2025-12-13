'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface ProjectDetailsStepProps {
    onNext: (data: any) => void
    initialData?: any
}

export default function ProjectDetailsStep({ onNext, initialData }: ProjectDetailsStepProps) {
    const [formData, setFormData] = useState({
        address: initialData?.address || '',
        totalArea: initialData?.totalArea || '',
        budgetGoal: initialData?.budgetGoal || '',
        roomsCount: initialData?.roomsCount || '',
        floorsCount: initialData?.floorsCount || '',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onNext(formData)
    }

    const handleSkip = () => {
        onNext({})
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2 text-center sm:text-left">
                <h2 className="text-2xl font-bold tracking-tight">Szczegóły projektu</h2>
                <p className="text-muted-foreground">Uzupełnij parametry techniczne. Możesz pominąć ten krok.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Lokalizacja / Adres</label>
                    <Input
                        placeholder="np. Warszawa, ul. Złota 44/10"
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                        className="bg-[#1A1A1A] border-white/5"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Metraż (m²)</label>
                        <Input
                            type="number"
                            placeholder="0"
                            value={formData.totalArea}
                            onChange={e => setFormData({ ...formData, totalArea: e.target.value })}
                            className="bg-[#1A1A1A] border-white/5"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Budżet (PLN)</label>
                        <Input
                            type="number"
                            placeholder="0"
                            value={formData.budgetGoal}
                            onChange={e => setFormData({ ...formData, budgetGoal: e.target.value })}
                            className="bg-[#1A1A1A] border-white/5"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Liczba pomieszczeń</label>
                        <Input
                            type="number"
                            placeholder="0"
                            value={formData.roomsCount}
                            onChange={e => setFormData({ ...formData, roomsCount: e.target.value })}
                            className="bg-[#1A1A1A] border-white/5"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Liczba pięter</label>
                        <Input
                            type="number"
                            placeholder="1"
                            value={formData.floorsCount}
                            onChange={e => setFormData({ ...formData, floorsCount: e.target.value })}
                            className="bg-[#1A1A1A] border-white/5"
                        />
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1 border-white/10 hover:bg-white/5"
                        onClick={handleSkip}
                    >
                        Pomiń
                    </Button>
                    <Button
                        type="submit"
                        className="flex-1 bg-white text-black hover:bg-gray-200"
                    >
                        Dalej
                    </Button>
                </div>
            </form>
        </div>
    )
}
