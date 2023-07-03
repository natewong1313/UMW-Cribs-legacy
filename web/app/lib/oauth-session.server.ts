import { createCookieSessionStorage } from "@remix-run/cloudflare"

type SessionData = {
  state: string
  referer: string
}

export const createOauthSessionStorage = (sessionSecret: string) => {
  const sessionStorage = createCookieSessionStorage<SessionData>({
    cookie: {
      name: "oauth_session",
      httpOnly: true,
      maxAge: 60 * 60,
      secrets: [sessionSecret],
      secure: true,
    },
  })
  return {
    get: sessionStorage.getSession,
    commit: sessionStorage.commitSession,
    destroy: sessionStorage.destroySession,
  }
}
export type OAuthSessionStorage = ReturnType<typeof createOauthSessionStorage>
