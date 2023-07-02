import { type LoaderArgs, redirect } from "@remix-run/cloudflare"
import { oauthStateCookie } from "@/lib/session.server"

export async function loader({ params, context }: LoaderArgs) {
  let url: URL
  let state = ""
  if (params.provider === "google") {
    ;[url, state] = await context.googleAuth.getAuthorizationUrl()
  } else {
    return redirect("/signin")
  }
  return redirect(url.toString(), {
    headers: {
      "Set-Cookie": await oauthStateCookie.serialize(state),
    },
  })
}
