import { createFileRoute } from '@tanstack/react-router'
import { DocumentManager } from '../../../components/DocumentManager'

export const Route = createFileRoute('/_authed/document/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <DocumentManager />
}
