import { type LoaderArgs, redirect } from "@remix-run/cloudflare"

export async function loader({ request, params, context }: LoaderArgs) {
  const oauthSession = await context.oauthSession.get(
    request.headers.get("Cookie")
  )
  const refererPath =
    new URL(request.url).searchParams.get("referer") || "/signin"
  let url: URL
  let state = ""
  if (params.provider === "google") {
    ;[url, state] = await context.googleAuth.getAuthorizationUrl()
  } else {
    return redirect(refererPath)
  }
  oauthSession.set("state", state)
  oauthSession.set("referer", refererPath)

  return redirect(url.toString(), {
    headers: { "Set-Cookie": await context.oauthSession.commit(oauthSession) },
  })
}
