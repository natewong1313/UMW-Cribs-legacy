import type { PlanetScaleDatabase } from "drizzle-orm/planetscale-serverless"
import type {
  Authenticator,
  GoogleAuthenticator, // PasswordResetTokenHandler,
} from "@/lib/auth.server"
import { OAuthSessionStorage } from "./lib/oauth-session.server"
import { SessionStorage } from "./lib/session.server"

export type TypesafeEnv = {
  __STATIC_CONTENT: Fetcher
  EMAIL_API_SERVICE: Fetcher
  IS_DEV: boolean
  DATABASE_URL: string
  SESSION_SECRET: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  GOOGLE_CLIENT_REDIRECTURI: string
  BASE_URL: string
  EMAIL_API_KEY: string
}

declare module "@remix-run/cloudflare" {
  export interface AppLoadContext {
    env: TypesafeEnv
    db: PlanetScaleDatabase<Record<string, never>>
    auth: Authenticator
    googleAuth: GoogleAuthenticator
    is_dev: boolean
    session: SessionStorage
    oauthSession: OAuthSessionStorage
  }
}
