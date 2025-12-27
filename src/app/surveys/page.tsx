import { getSurveys } from '@/app/actions/surveys'
import { getUserProjects } from '@/app/actions/projects'
import SurveysClient from './SurveysClient'

export const dynamic = 'force-dynamic'

export default async function SurveysPage() {
    const projects = await getUserProjects()

    // Get surveys from the first active project if available
    const activeProject = projects.find(p => p.status === 'ACTIVE') || projects[0]
    const surveys = activeProject ? await getSurveys(activeProject.id) : []

    return (
        <SurveysClient
            initialSurveys={surveys}
            projects={projects}
            initialProjectId={activeProject?.id || null}
        />
    )
}
