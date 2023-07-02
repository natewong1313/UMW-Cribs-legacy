import { json } from "@remix-run/cloudflare"
import type { LoaderArgs, V2_MetaFunction } from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"

export const meta: V2_MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ]
}

export const loader = async ({ request, context }: LoaderArgs) => {
  const headers = new Headers()
  const authRequest = context.auth.handleRequest(request, headers)
  const { user } = await authRequest.validateUser()
  return json(
    { isDev: context.is_dev, user, dbUrl: context.env.DATABASE_URL },
    { headers }
  )
}

export default function Index() {
  const data = useLoaderData<typeof loader>()
  return (
    <div>
      <p>DB url: {data.dbUrl}</p>
      <h1 className="font-bold text-red-500">Is dev: {"" + data.isDev}</h1>
      <h2 className="font-bold text-blue-500">Signed in: {"" + !!data.user}</h2>
      {data.user && (
        <div>
          <h3 className="font-bold text-green-500">User:</h3>
          <pre>{JSON.stringify(data.user, null, 2)}</pre>
        </div>
      )}
      <ul>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/blog"
            rel="noreferrer"
          >
            15m Quickstart Blog Tutorial
          </a>
        </li>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/jokes"
            rel="noreferrer"
          >
            Deep Dive Jokes App Tutorial
          </a>
        </li>
        <li>
          <a target="_blank" href="https://remix.run/docs" rel="noreferrer">
            Remix Docs
          </a>
        </li>
      </ul>
    </div>
  )
}
