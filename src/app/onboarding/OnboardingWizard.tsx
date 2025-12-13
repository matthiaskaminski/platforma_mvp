'use client'
import { Button } from '@/components/ui/Button'
import { Check, Plus, FolderPlus } from 'lucide-react'
import ProfileStep from './steps/ProfileStep'
import SuccessStep from './steps/SuccessStep'
import ProjectBasicStep from './steps/ProjectBasicStep'
import ClientStep from './steps/ClientStep'
import ProjectDetailsStep from './steps/ProjectDetailsStep'
import ProjectDatesStep from './steps/ProjectDatesStep'
import DocumentsStep from './steps/DocumentsStep'
import { createFirstProject } from './actions'
import { useRouter } from 'next/navigation'

export default function OnboardingWizard({ initialProfile }: { initialProfile: any }) {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // State to hold data from all steps before final submission
    const [wizardData, setWizardData] = useState({
        // Profile data is handled in step 1 directly to DB
        projectBasic: {},
        client: {},
        projectDetails: {},
        projectDates: {},
        documents: []
    })

    const nextStep = () => setCurrentStep(prev => prev + 1)

    const updateWizardData = (key: string, data: any) => {
        setWizardData(prev => {
            const newData = { ...prev, [key]: data }
            return newData
        })
        nextStep()
    }

    const handleFinalSubmit = async (documents: any) => {
        // We get documents from the last step, need to combine with existing state
        const finalData = { ...wizardData, documents }
        setIsSubmitting(true)
        try {
            await createFirstProject(finalData)
            nextStep() // Move to Final Success Step
        } catch (error) {
            console.error(error)
            // Handle error (toast or alert)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex">
            {/* Left Side - Content */}
            <div className="w-full lg:w-1/2 flex flex-col p-8 lg:p-12 xl:p-24 overflow-y-auto">
                <div className="mb-12">
                    {/* Logo */}
                    <div className="text-xl font-bold tracking-tighter">Liru.app</div>
                </div>

                <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">

                    {currentStep === 0 && (
                        <ProfileStep
                            onNext={nextStep}
                            initialData={initialProfile}
                        />
                    )}

                    {currentStep === 1 && (
                        <SuccessStep
                            title="Twoje konto zostało utworzone"
                            description="Możesz teraz utworzyć swój pierwszy projekt."
                            buttonText="Utwórz projekt"
                            icon={<Check className="w-8 h-8" />}
                            onNext={nextStep}
                        />
                    )}

                    {currentStep === 2 && (
                        <ProjectBasicStep
                            onNext={(data) => updateWizardData('projectBasic', data)}
                        />
                    )}

                    {currentStep === 3 && (
                        <ClientStep
                            onNext={(data) => updateWizardData('client', data)}
                        />
                    )}

                    {currentStep === 4 && (
                        <ProjectDetailsStep
                            onNext={(data) => updateWizardData('projectDetails', data)}
                        />
                    )}

                    {currentStep === 5 && (
                        <ProjectDatesStep
                            onNext={(data) => updateWizardData('projectDates', data)}
                        />
                    )}

                    {currentStep === 6 && (
                        <DocumentsStep
                            onNext={handleFinalSubmit}
                        />
                    )}

                    {currentStep === 7 && (
                        <SuccessStep
                            title="Projekt został utworzony!"
                            description="Wszystko gotowe. Przejdź do dashboardu aby zarządzać projektem."
                            buttonText="Przejdź do Dashboardu"
                            icon={<FolderPlus className="w-8 h-8" />}
                            onComplete={async () => router.push('/')}
                        />
                    )}

                </div>

                <div className="mt-12 text-xs text-gray-600">
                    © 2024 Liru App
                </div>
            </div>

            {/* Right Side - Image */}
            <div className="hidden lg:block w-1/2 relative bg-[#151515]">
                <img
                    src="https://fiofzeriduyhoarihrzt.supabase.co/storage/v1/object/sign/Pliki%20do%20MVP/app%20background.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lOWYwOGU5YS1lZDM4LTRmZWYtODg5Zi0yMjM3ZDY1ZjdhZjAiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJQbGlraSBkbyBNVlAvYXBwIGJhY2tncm91bmQucG5nIiwiaWF0IjoxNzY1NjM2MDk1LCJleHAiOjE3OTcxNzIwOTV9.wqUeJFCdaDTtjDKoA8FMroM2dNfzut30K7ZOXqVVr-I"
                    alt="Liru App Background"
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                />
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#0A0A0A] opacity-50" />
            </div>
        </div>
    )
}

