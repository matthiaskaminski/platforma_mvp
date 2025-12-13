'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface ProjectDatesStepProps {
    onNext: (data: any) => void
    initialData?: any
}

export default function ProjectDatesStep({ onNext, initialData }: ProjectDatesStepProps) {
    const [formData, setFormData] = useState({
        status: initialData?.status || 'ACTIVE',
        startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
        deadline: initialData?.deadline || '',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onNext(formData)
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2 text-center sm:text-left">
                <h2 className="text-2xl font-bold tracking-tight">Terminy i status</h2>
                <p className="text-muted-foreground">Określ ramy czasowe projektu.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Status projektu</label>
                    <select
                        className="flex w-full rounded-md border border-white/5 bg-[#1A1A1A] px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                    >
                        <option value="ACTIVE">Aktywny</option>
                        <option value="ON_HOLD">Wstrzymany</option>
                        <option value="COMPLETED">Zakończony</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Data rozpoczęcia</label>
                        <Input
                            type="date"
                            required
                            value={formData.startDate}
                            onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                            className="bg-[#1A1A1A] border-white/5"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Planowane zakończenie</label>
                        <Input
                            type="date"
                            value={formData.deadline}
                            onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                            className="bg-[#1A1A1A] border-white/5"
                        />
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
