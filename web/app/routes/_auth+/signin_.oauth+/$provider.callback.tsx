import { type LoaderArgs, redirect } from "@remix-run/cloudflare"
import { LuciaError } from "lucia"

export async function loader({ request, context }: LoaderArgs) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const oauthSession = await context.oauthSession.get(
    request.headers.get("Cookie")
  )
  const storedState = oauthSession.get("state")
  const refererPath = oauthSession.get("referer") as string
  if (!storedState || storedState !== state || !code || !state) {
    return new Response(null, { status: 401 })
  }

  try {
    const { existingUser, googleUser, createUser } =
      await context.googleAuth.validateCallback(code)

    const getUser = async () => {
      if (existingUser) return existingUser
      // create a new user if the user does not exist
      return await createUser({
        attributes: {
          email: googleUser.email,
          firstName: googleUser.given_name,
          lastName: googleUser.family_name,
        },
      })
    }
    const user = await getUser()
    const authSession = await context.auth.createSession({
      userId: user.userId,
      attributes: {},
    })
    const sessionCookie = context.auth.createSessionCookie(authSession)
    return redirect("/", {
      headers: { "Set-Cookie": sessionCookie.serialize() },
    })
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
