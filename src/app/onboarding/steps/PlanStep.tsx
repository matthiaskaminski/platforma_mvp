'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Check, User, Building, Home, Briefcase } from 'lucide-react'
import { updateSubscription } from '../actions'

interface PlanStepProps {
    onNext: () => void
}

const PLANS = [
    {
        id: 'private',
        name: 'Osoba prywatna',
        price: '49.99',
        icon: User,
        features: ['1 projekt', 'Dysk 2GB dla projektu', 'Szukanie produktów AI', 'Ograniczona funkcjonalność']
    },
    {
        id: 'designer',
        name: 'Projektant wnętrz',
        price: '149.99',
        icon: Briefcase,
        popular: true,
        features: ['10 projektów + rozszerzenia', 'Dysk 50GB dla projektu + rozszerzenia', 'Szukanie produktów AI', 'Możliwość wgrania własnego logotypu', 'Integracja poczty Gmail/Outlook', 'Pełna funkcjonalność']
    },
    {
        id: 'studio',
        name: 'Studio projektowe',
        price: '379.99',
        icon: Building,
        features: ['10 projektów na pracownika + rozszerzenia', 'Dysk 5TB dla projektu + rozszerzenia', 'Szukanie produktów AI', 'Możliwość wgrania własnego logotypu', 'Integracja poczty Gmail/Outlook', 'Pełna funkcjonalność']
    }
]

export default function PlanStep({ onNext }: PlanStepProps) {
    const [loading, setLoading] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState('designer') // Default to designer
    const [isYearly, setIsYearly] = useState(true)

    const handleSubmit = async () => {
        setLoading(true)
        try {
            await updateSubscription(selectedPlan)
            onNext()
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto w-full">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Wybierz rodzaj konta aby<br />dostosować funkcje platformy</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PLANS.map((plan) => (
                    <Card
                        key={plan.id}
                        className={`relative p-6 cursor-pointer transition-all duration-200 border-2 hover:border-white/20 flex flex-col ${selectedPlan === plan.id
                                ? 'bg-[#1A1A1A] border-white text-white'
                                : 'bg-[#0F0F0F] border-white/5 text-gray-400 hover:bg-[#1A1A1A]'
                            }`}
                        onClick={() => setSelectedPlan(plan.id)}
                    >
                        {plan.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black px-3 py-1 text-xs font-bold rounded-full">
                                POLECANY
                            </div>
                        )}

                        <div className="mb-4">
                            <h3 className="flex items-center gap-2 font-medium mb-1 text-lg">
                                <plan.icon className="w-4 h-4" />
                                {plan.name}
                            </h3>
                            <p className="text-xs text-gray-500">Zarządzaj kilkoma projektami jednocześnie i utrzymuj kontakt...</p>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-white">{plan.price} zł</span>
                                <span className="text-xs text-gray-500">/miesiąc</span>
                            </div>
                            <div className="mt-2 flex items-center gap-2 text-xs">
                                <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isYearly ? 'bg-white' : 'bg-gray-700'}`}>
                                    <div className={`w-3 h-3 rounded-full bg-black transition-transform ${isYearly ? 'translate-x-4' : 'translate-x-0'}`} />
                                </div>
                                <span className="text-gray-400">Rozliczenie roczne <span className="bg-white/10 text-white px-1 rounded">-20%</span></span>
                            </div>
                        </div>

                        <div className="space-y-3 flex-1">
                            {plan.features.map((feature, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs">
                                    <Check className="w-3 h-3 text-white mt-0.5 shrink-0" />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>

                        <Button
                            className={`w-full mt-6 ${selectedPlan === plan.id ? 'bg-white text-black hover:bg-gray-200' : 'bg-white/10 text-white hover:bg-white/20'}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPlan(plan.id);
                                if (selectedPlan === plan.id) handleSubmit();
                            }}
                            disabled={loading && selectedPlan === plan.id}
                        >
                            {loading && selectedPlan === plan.id ? 'Wybieranie...' : 'Rozpocznij 7-dniowy okres próbny'}
                        </Button>
                    </Card>
                ))}
            </div>
        </div>
    )
}
