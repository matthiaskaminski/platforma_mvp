'use client'

import { useState } from 'react'
import ProfileStep from './steps/ProfileStep'
import PlanStep from './steps/PlanStep'
import ThemeStep from './steps/ThemeStep'
import SuccessStep from './steps/SuccessStep'
import { Check } from 'lucide-react'

const STEPS = [
    { id: 0, title: 'Uzupełnij dane' },
    { id: 1, title: 'Wybierz plan' },
    { id: 2, title: 'Dostosuj platformę' },
    { id: 3, title: 'Utwórz pierwszy projekt' },
]

export default function OnboardingWizard({ initialProfile }: { initialProfile: any }) {
    const [currentStep, setCurrentStep] = useState(0)

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1))

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex">
            {/* Sidebar */}
            <div className="w-64 border-r border-white/5 p-8 hidden md:flex flex-col justify-between">
                <div>
                    <div className="mb-12">
                        {/* Logo Placeholder */}
                        <div className="text-xl font-bold tracking-tighter">Liru.app</div>
                    </div>

                    <div className="space-y-6">
                        {STEPS.map((step, index) => (
                            <div key={step.id} className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${index === currentStep ? 'border-white bg-white text-black' :
                                        index < currentStep ? 'border-white bg-white text-black' :
                                            'border-white/20 bg-transparent'
                                    }`}>
                                    {index < currentStep && <Check className="w-3 h-3" />}
                                    {index === currentStep && <div className="w-2 h-2 bg-black rounded-full" />}
                                </div>
                                <span className={`text-sm ${index === currentStep ? 'text-white font-medium' :
                                        index < currentStep ? 'text-gray-400' :
                                            'text-gray-600'
                                    }`}>
                                    {step.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-xs text-gray-600">
                    © 2024 Liru App
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
                    {currentStep === 0 && <ProfileStep onNext={nextStep} initialData={initialProfile} />}
                    {currentStep === 1 && <PlanStep onNext={nextStep} />}
                    {currentStep === 2 && <ThemeStep onNext={nextStep} />}
                    {currentStep === 3 && <SuccessStep />}
                </div>

                {currentStep < 3 && (
                    <div className="p-8 flex justify-end md:hidden">
                        <div className="text-xs text-gray-500">Krok {currentStep + 1} z 4</div>
                    </div>
                )}
            </div>

            {/* Background Gradient/Mesh (Right side abstract art from screenshot) */}
            {currentStep !== 3 && (
                <div className="hidden lg:block w-1/3 h-screen fixed right-0 top-0 bottom-0 -z-10 opacity-20 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-l from-[#ff8c00] via-purple-900 to-[#0A0A0A] mix-blend-screen opacity-30 blur-3xl" />
                </div>
            )}
        </div>
    )
}
