import { getSurveyByToken } from '@/app/actions/surveys'
import { notFound } from 'next/navigation'
import SurveyClientPage from './SurveyClientPage'

export const dynamic = 'force-dynamic'

interface PageProps {
    params: Promise<{ token: string }>
}

export default async function ClientSurveyPage({ params }: PageProps) {
    const { token } = await params

    const result = await getSurveyByToken(token)

    if (!result.success || !result.data) {
        // Show appropriate error page
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-[#0F0F0F] rounded-2xl border border-white/10 p-8 text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-semibold text-white mb-2">
                        {result.error === 'Link expired' ? 'Link wygasl' :
                         result.error === 'Survey already completed' ? 'Ankieta juz wypelniona' :
                         'Link nie istnieje'}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {result.error === 'Link expired'
                            ? 'Ten link do ankiety wygasl. Skontaktuj sie z projektantem, aby otrzymac nowy link.'
                            : result.error === 'Survey already completed'
                            ? 'Ta ankieta zostala juz wypelniona. Dziekujemy za odpowiedzi!'
                            : 'Sprawdz czy link jest poprawny lub skontaktuj sie z projektantem.'
                        }
                    </p>
                </div>
            </div>
        )
    }

    return <SurveyClientPage surveyData={result.data} token={token} />
}
