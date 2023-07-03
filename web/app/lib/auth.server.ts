import { planetscale } from "@lucia-auth/adapter-mysql"
import { google } from "@lucia-auth/oauth/providers"
import { idToken } from "@lucia-auth/tokens"
import type { Connection } from "@planetscale/database"
import lucia from "lucia-auth"
import { web } from "lucia-auth/middleware"

export const createAuthenticator = (
  dbConnection: Connection,
  isDev: boolean
) => {
  return lucia({
    // @ts-ignore
    adapter: planetscale(dbConnection),
    env: isDev ? "DEV" : "PROD",
    middleware: web(),
    transformDatabaseUser: (userData) => {
      return {
        userId: userData.id,
        email: userData.email,
        emailVerifiedAt: userData.emailVerifiedAt,
        createdAt: userData.createdAt,
        avatar: userData.avatar,
      }
    },
  })
}
export type Authenticator = ReturnType<typeof createAuthenticator>

export const createPasswordResetTokenHandler = (auth: Authenticator) =>
  // @ts-ignore
  idToken(auth, "password-reset", {
    expiresIn: 60 * 60,
  })
export type PasswordResetTokenHandler = ReturnType<
  typeof createPasswordResetTokenHandler
>

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
