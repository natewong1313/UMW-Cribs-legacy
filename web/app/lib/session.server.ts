import { createCookieSessionStorage } from "@remix-run/cloudflare"

type SessionData = {}

type SessionFlashData = {
  message: string
  isErrorMessage: boolean
}

export const createSessionStorage = (sessionSecret: string) => {
  const sessionStorage = createCookieSessionStorage<
    SessionData,
    SessionFlashData
  >({
    cookie: {
      name: "__session",
      httpOnly: true,
      maxAge: 60,
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
export type SessionStorage = ReturnType<typeof createSessionStorage>
