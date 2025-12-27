import { getStyleQuizzes } from '@/app/actions/styles'
import { getUserProjects } from '@/app/actions/projects'
import StylesClient from './StylesClient'

export const dynamic = 'force-dynamic'

export default async function StylesPage() {
    const projects = await getUserProjects()

    // Get style quizzes from the first active project if available
    const activeProject = projects.find(p => p.status === 'ACTIVE') || projects[0]
    const quizzes = activeProject ? await getStyleQuizzes(activeProject.id) : []

    return (
        <StylesClient
            initialQuizzes={quizzes}
            projects={projects}
            initialProjectId={activeProject?.id || null}
        />
    )
}
