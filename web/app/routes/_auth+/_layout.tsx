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
    <div className="flex min-h-screen flex-col items-center bg-gray-100 px-4 py-20 sm:py-32">
      <Outlet />
    </div>
  )
}
