import { json, type LoaderArgs } from "@remix-run/cloudflare"
import { Link, useLoaderData } from "@remix-run/react"
import { listing } from "@umw-cribs/db/schema.server"

export const loader = async ({ request, context }: LoaderArgs) => {
  const listings = await context.db.select().from(listing)
  return json({ listings })
}

export default function ListingsPage() {
  const { listings } = useLoaderData<typeof loader>()
  const likePost = (listingId: string) => {}
  return (
    <div>
      ListingsPage
      <ul>
        {listings.map((listing) => (
          <li
            key={listing.id}
            className="flex flex-row items-center gap-10 space-y-2 border"
          >
            <Link to={`/listings/${listing.id}`}>
              {listing.addressLineOne} {listing.addressLineTwo}{" "}
              {listing.listingSource}
            </Link>
            <button
              onClick={() => likePost(listing.id)}
              className="rounded bg-blue-500 px-2 py-1 text-white"
            >
              Like
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
