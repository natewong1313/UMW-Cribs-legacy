import { ActionArgs, json, type LoaderArgs } from "@remix-run/cloudflare"
import { Form, Link, useLoaderData } from "@remix-run/react"
import { listing, userLikedListings } from "@umw-cribs/db/schema.server"
import { eq } from "drizzle-orm"

export const loader = async ({ request, context }: LoaderArgs) => {
  const headers = new Headers()
  const listings = await context.db.select().from(listing)
  const authRequest = context.auth.handleRequest(request, headers)
  const { user } = await authRequest.validateUser()
  if (!user) return json({ listings, likedListingIds: [] }, { headers })
  const likedListings = await context.db
    .select()
    .from(userLikedListings)
    .where(eq(userLikedListings.userId, user.userId))
  return json(
    { listings, likedListingIds: likedListings.map((l) => l.listingId) },
    { headers }
  )
}

export const action = async ({ request, context }: ActionArgs) => {
  const headers = new Headers()
  const body = await request.formData()
  const listingId = body.get("id")
  if (!listingId) return json(null, { headers })
  const authRequest = context.auth.handleRequest(request, headers)
  const { user } = await authRequest.validateUser()
  if (!user) return json(null, { headers })
  console.log(user.userId)

  const hasAlreadyLiked = await context.db
    .select()
    .from(userLikedListings)
    .where(eq(userLikedListings.userId, user.userId))
    .where(eq(userLikedListings.listingId, listingId.toString()))
  if (hasAlreadyLiked.length === 0) {
    console.log("OK")
    await context.db.insert(userLikedListings).values({
      userId: user.userId,
      listingId: listingId.toString(),
    })
  }
  return json(null, { headers })
}

export default function ListingsPage() {
  const { listings, likedListingIds } = useLoaderData<typeof loader>()
  return (
    <div>
      ListingsPage
      <ul>
        {listings.map((listing) => (
          <li key={listing.id}>
            <Form
              method="post"
              className="flex flex-row items-center gap-10 space-y-2 border"
            >
              <Link to={`/listings/${listing.id}`}>
                {listing.addressLineOne} {listing.addressLineTwo}{" "}
                {listing.listingSource}
              </Link>
              <input name="id" type="hidden" value={listing.id} />
              {likedListingIds.includes(listing.id) ? (
                <button className="rounded bg-gray-500 px-2 py-1 text-white">
                  Unlike
                </button>
              ) : (
                <button className="rounded bg-blue-500 px-2 py-1 text-white">
                  Like
                </button>
              )}
            </Form>
          </li>
        ))}
      </ul>
    </div>
  )
}
