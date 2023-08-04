import { planetscale } from "@lucia-auth/adapter-mysql"
import { google } from "@lucia-auth/oauth/providers"
import type { Connection } from "@planetscale/database"
import { lucia } from "lucia"
import { web } from "lucia/middleware"

export const createAuthenticator = (
  dbConnection: Connection,
  isDev: boolean
) => {
  return lucia({
    adapter: planetscale(dbConnection, {
      user: "auth_user",
      key: "auth_key",
      session: "auth_session",
    }),
    env: isDev ? "DEV" : "PROD",
    middleware: web(),
    sessionCookie: {
      expires: false,
    },
    getUserAttributes: (data) => {
      return {
        // IMPORTANT!!!!
        // `userId` included by default!!
        providerId: data.providerId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        emailVerifiedAt: data.emailVerifiedAt,
        createdAt: data.createdAt,
        avatar: data.avatar,
      }
    },
  })
}
export type Authenticator = ReturnType<typeof createAuthenticator>

export const createGoogleAuthenticator = (
  auth: Authenticator,
  clientId: string,
  clientSecret: string,
  redirectUri: string
) => {
  return google(auth, {
    clientId,
    clientSecret,
    redirectUri: redirectUri,
    scope: ["profile", "email"],
  })
}
export type GoogleAuthenticator = ReturnType<typeof createGoogleAuthenticator>
