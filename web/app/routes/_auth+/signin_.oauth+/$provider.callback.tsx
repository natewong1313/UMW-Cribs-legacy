import { type LoaderArgs, redirect } from "@remix-run/cloudflare"
import { LuciaError } from "lucia-auth"

export async function loader({ request, context }: LoaderArgs) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const oauthSession = await context.oauthSession.get(
    request.headers.get("Cookie")
  )
  const storedState = oauthSession.get("state")
  const refererPath = oauthSession.get("referer") as string
  console.log("Recieved", code, state, storedState, refererPath)
  if (!storedState || storedState !== state || !code || !state) {
    return new Response(null, { status: 401 })
  }

  try {
    const { existingUser, providerUser, createUser } =
      await context.googleAuth.validateCallback(code)

    const getUser = async () => {
      if (existingUser) return existingUser
      // create a new user if the user does not exist
      return await createUser({
        email: providerUser.email,
        avatar: providerUser.picture,
      })
    }
    const user = await getUser()
    const session = await context.auth.createSession(user.userId)
    const headers = new Headers()
    const authRequest = context.auth.handleRequest(request, headers)
    authRequest.setSession(session)
    return redirect("/", { headers })
  } catch (e) {
    const session = await context.session.get(request.headers.get("Cookie"))
    const errorMessage =
      e instanceof LuciaError || e instanceof Error
        ? e.message
        : "Unknown error occured"
    session.flash("isErrorMessage", true)
    session.flash("message", errorMessage)
    return redirect(refererPath, {
      headers: { "Set-Cookie": await context.session.commit(session) },
    })
  }
}
