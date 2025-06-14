import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/document/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authed/document/"!</div>
}
