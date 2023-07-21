import { json, type LoaderArgs } from "@remix-run/cloudflare"
import { Link, useLoaderData } from "@remix-run/react"
import { listing } from "@umw-cribs/db/schema.server"

export const loader = async ({ request, context }: LoaderArgs) => {
  const listings = await context.db.select().from(listing)
  return json({ listings })
}

export default function ListingsPage() {
  const { listings } = useLoaderData<typeof loader>()
  return (
    <div>
      ListingsPage
      <ul>
        {listings.map((listing) => (
          <li key={listing.id}>
            <Link to={`/listings/${listing.id}`}>
              {listing.addressLineOne} {listing.addressLineTwo}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
