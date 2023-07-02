import { planetscale } from "@lucia-auth/adapter-mysql"
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
