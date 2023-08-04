import { flatRoutes } from "remix-flat-routes"

/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  // ignore all files in routes folder to prevent
  // default remix convention from picking up routes
  // ignoredRouteFiles: ["**/*"],
  routes: async (defineRoutes) => {
    return flatRoutes("routes", defineRoutes)
  },
  server: "./server.ts",
  serverConditions: ["worker"],
  serverDependenciesToBundle: [
    "lucia",
    "lucia/middleware",
    "@lucia-auth/adapter-mysql",
    "lucia/polyfill/node",
    "@lucia-auth/oauth",
    "@lucia-auth/oauth/providers",
    "@umw-cribs/db/schema.server",
    // bundle verything except the virtual module for the static content manifest provided by wrangler
    /^(?!.*\b__STATIC_CONTENT_MANIFEST\b).*$/,
  ],
  serverMainFields: ["browser", "module", "main"],
  serverMinify: true,
  serverModuleFormat: "esm",
  serverPlatform: "neutral",
  tailwind: true,
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
  future: {
    v2_dev: true,
    v2_errorBoundary: true,
    v2_headers: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: true,
  },
}
