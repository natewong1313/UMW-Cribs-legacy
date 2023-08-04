import { LoaderArgs, json, redirect } from "@remix-run/cloudflare"
import { Outlet } from "@remix-run/react"

export const loader = async ({ request, context }: LoaderArgs) => {
  const headers = new Headers()
  const authRequest = context.auth.handleRequest(request)
  const session = await authRequest.validate()
  if (session) return redirect("/")
  return json(null, { headers })
}

export default function AuthLayout() {
  return (
    <div>
      Auth
      <Outlet />
    </div>
  )
}
