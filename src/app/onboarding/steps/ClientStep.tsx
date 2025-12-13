'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface ClientStepProps {
    onNext: (data: any) => void
    initialData?: any
}

export default function ClientStep({ onNext, initialData }: ClientStepProps) {
    const [formData, setFormData] = useState({
        name: initialData?.name || '', // Full Name
        email: initialData?.email || '',
        phone: initialData?.phone || '',
        companyName: initialData?.companyName || '',
        nip: initialData?.nip || '',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (formData.name && formData.email) {
            onNext(formData)
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2 text-center sm:text-left">
                <h2 className="text-2xl font-bold tracking-tight">Dane klienta</h2>
                <p className="text-muted-foreground">Wprowadź dane klienta dla którego realizujesz projekt.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Imię i nazwisko*</label>
                    <Input
                        required
                        placeholder="np. Jan Kowalski"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="bg-[#1A1A1A] border-white/5"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Adres e-mail*</label>
                    <Input
                        required
                        type="email"
                        placeholder="np. jan@example.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="bg-[#1A1A1A] border-white/5"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Numer telefonu</label>
                    <Input
                        placeholder="np. 500 600 700"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="bg-[#1A1A1A] border-white/5"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Nazwa działalności</label>
                    <Input
                        placeholder="Opcjonalnie"
                        value={formData.companyName}
                        onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                        className="bg-[#1A1A1A] border-white/5"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">NIP</label>
                    <Input
                        placeholder="Opcjonalnie"
                        value={formData.nip}
                        onChange={e => setFormData({ ...formData, nip: e.target.value })}
                        className="bg-[#1A1A1A] border-white/5"
                    />
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
