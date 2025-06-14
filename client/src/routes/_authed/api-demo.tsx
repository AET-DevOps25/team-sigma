import { createFileRoute } from '@tanstack/react-router'
import { OpenApiDemo } from '../../components/OpenApiDemo'

export const Route = createFileRoute('/_authed/api-demo')({
  component: RouteComponent,
})

function RouteComponent() {
  return <OpenApiDemo />
} 