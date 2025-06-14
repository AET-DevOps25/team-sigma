import { createFileRoute } from '@tanstack/react-router'
import { ApiDemo } from '../../components/ApiDemo'

export const Route = createFileRoute('/_authed/api-demo')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ApiDemo />
} 