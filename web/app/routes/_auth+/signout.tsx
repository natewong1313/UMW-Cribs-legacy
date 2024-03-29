import { type LoaderArgs, redirect, json } from "@remix-run/cloudflare"

export async function loader({ request, context }: LoaderArgs) {
  const headers = new Headers()
  const authRequest = context.auth.handleRequest(request)
  const session = await authRequest.validate()
  if (!session) {
    return json(null, {
      status: 401,
      headers,
    })
  }
  await context.auth.invalidateSession(session.sessionId)
  authRequest.setSession(null)
  return redirect("/signin", {
    headers,
  })
}
