import { getAssetFromKV } from "@cloudflare/kv-asset-handler"
import {
  createRequestHandler,
  logDevReady,
  type AppLoadContext,
} from "@remix-run/cloudflare"
import * as build from "@remix-run/dev/server-build"
import __STATIC_CONTENT_MANIFEST from "__STATIC_CONTENT_MANIFEST"
import { drizzle } from "drizzle-orm/planetscale-serverless"
import type { TypesafeEnv } from "@/app"
import {
  createAuthenticator,
  createGoogleAuthenticator, // createPasswordResetTokenHandler,
} from "@/lib/auth.server"
import { createDbConnection } from "@/lib/db.server"
import { createOauthSessionStorage } from "@/lib/oauth-session.server"
import { createSessionStorage } from "@/lib/session.server"

const MANIFEST = JSON.parse(__STATIC_CONTENT_MANIFEST)
const handleRemixRequest = createRequestHandler(build, process.env.NODE_ENV)

if (build.dev) {
  logDevReady(build)
}

export default {
  async fetch(
    request: Request,
    env: TypesafeEnv,
    ctx: ExecutionContext
  ): Promise<Response> {
    try {
      const url = new URL(request.url)
      const ttl = url.pathname.startsWith("/build/")
        ? 60 * 60 * 24 * 365 // 1 year
        : 60 * 5 // 5 minutes
      return await getAssetFromKV(
        {
          request,
          waitUntil: ctx.waitUntil.bind(ctx),
        } as FetchEvent,
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: MANIFEST,
          cacheControl: {
            browserTTL: ttl,
            edgeTTL: ttl,
          },
        }
      )
    } catch (error) {}

    try {
      const dbConnection = createDbConnection(env.DATABASE_URL)
      const isDev = !!build.dev
      const auth = createAuthenticator(dbConnection, isDev)
      const loadContext: AppLoadContext = {
        env,
        db: drizzle(dbConnection),
        auth,
        // passwordResetToken: createPasswordResetTokenHandler(auth),
        googleAuth: createGoogleAuthenticator(
          auth,
          env.GOOGLE_CLIENT_ID,
          env.GOOGLE_CLIENT_SECRET,
          env.GOOGLE_CLIENT_REDIRECTURI
        ),
        is_dev: isDev,
        session: createSessionStorage(env.SESSION_SECRET),
        oauthSession: createOauthSessionStorage(env.SESSION_SECRET),
      }
      return await handleRemixRequest(request, loadContext)
    } catch (error) {
      console.log(error)
      return new Response("An unexpected error occurred", { status: 500 })
    }
  },
}
