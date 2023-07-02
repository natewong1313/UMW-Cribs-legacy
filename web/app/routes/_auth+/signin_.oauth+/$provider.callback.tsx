import { LoaderArgs, redirect } from "@remix-run/cloudflare"
import { oauthStateCookie } from "@/lib/session.server"

export async function loader({ request, context }: LoaderArgs) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const storedState = await oauthStateCookie.parse(
    request.headers.get("Cookie") ?? ""
  )

  if (!storedState || storedState !== state || !code || !state) {
    return new Response(null, { status: 401 })
  }

  try {
    const { existingUser, providerUser, createUser } =
      await context.googleAuth.validateCallback(code)
    console.log(existingUser, providerUser, createUser)
    const getUser = async () => {
      if (existingUser) return existingUser
      // create a new user if the user does not exist
      console.log(providerUser.email)
      return await createUser({
        // attributes
        email: providerUser.email,
        avatar: providerUser.picture,
      })
    }
    const user = await getUser()
    console.log("user", user)
    const session = await context.auth.createSession(user.userId)
    const headers = new Headers()
    console.log(session)
    const authRequest = context.auth.handleRequest(request, headers)
    authRequest.setSession(session)
    return redirect("/", {
      headers, // IMPORTANT!
    })
  } catch (e) {
    // invalid code
    console.log(e)
    return new Response(null, {
      status: 500,
    })
  }
}
