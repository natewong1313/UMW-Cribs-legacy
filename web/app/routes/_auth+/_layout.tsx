import { LoaderArgs, json, redirect } from "@remix-run/cloudflare"
import { Outlet } from "@remix-run/react"

export const loader = async ({ request, context }: LoaderArgs) => {
  const headers = new Headers()
  const authRequest = context.auth.handleRequest(request, headers)
  const { session } = await authRequest.validateUser()
  if (session) return redirect("/")
  return json(null, { headers })
}

export default function AuthLayout() {
  return (
    <div>
      <Outlet />
    </div>
  )
}
