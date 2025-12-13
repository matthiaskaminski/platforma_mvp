'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { updateProfile } from '../actions'

interface ProfileStepProps {
    onNext: () => void
    initialData?: any
}

export default function ProfileStep({ onNext, initialData }: ProfileStepProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        firstName: initialData?.firstName || '',
        lastName: initialData?.lastName || '',
        studioName: initialData?.studioName || '',
        phone: initialData?.phone || '',
        nip: initialData?.nip || '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await updateProfile(formData)
            onNext()
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2 text-center sm:text-left">
                <h2 className="text-2xl font-bold tracking-tight">Uzupełnij swoje dane</h2>
                <p className="text-muted-foreground">Jesteś już kilka sekund od utworzenia swojego pierwszego projektu.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Imię</label>
                    <Input
                        required
                        placeholder="Wprowadź swoje imię"
                        value={formData.firstName}
                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                        className="bg-[#1A1A1A] border-white/5"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Nazwisko</label>
                    <Input
                        required
                        placeholder="Wprowadź swoje nazwisko"
                        value={formData.lastName}
                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                        className="bg-[#1A1A1A] border-white/5"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Numer telefonu</label>
                    <Input
                        placeholder="Wprowadź swój numer telefonu"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="bg-[#1A1A1A] border-white/5"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Nazwa działalności*</label>
                    <Input
                        required
                        placeholder="Wprowadź nazwę swojej działalności"
                        value={formData.studioName}
                        onChange={e => setFormData({ ...formData, studioName: e.target.value })}
                        className="bg-[#1A1A1A] border-white/5"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">NIP*</label>
                    <Input
                        required
                        placeholder="Wprowadź NIP"
                        value={formData.nip}
                        onChange={e => setFormData({ ...formData, nip: e.target.value })}
                        className="bg-[#1A1A1A] border-white/5"
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full bg-white text-black hover:bg-gray-200 mt-4 h-12"
                    disabled={loading}
                >
                    {loading ? 'Zapisywanie...' : 'Kontynuuj →'}
                </Button>
            </form>
        </div>
    )
}
