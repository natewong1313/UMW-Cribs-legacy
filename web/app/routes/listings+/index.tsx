import { ActionArgs, json, type LoaderArgs } from "@remix-run/cloudflare"
import { Form, Link, useLoaderData } from "@remix-run/react"
import {
  type Listing as DbListing,
  listing as dbListing,
  userLikedListings,
} from "@umw-cribs/db/schema.server"
import { eq } from "drizzle-orm"
import Container from "@/components/Container"
import Navbar from "@/components/Navbar"

export const loader = async ({ request, context }: LoaderArgs) => {
  const headers = new Headers()
  const listings = await context.db.select().from(dbListing)
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
      <Navbar />
      <Container>
        <h1 className="text-center text-2xl font-bold">
          Browse the latest listings
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {listings.map((listing) => (
            //@ts-ignore
            <Listing key={listing.id} listing={listing} />
          ))}
        </div>
      </Container>
    </div>
  )
}

type ListingProps = {
  listing: DbListing
}
const Listing = ({ listing }: ListingProps) => {
  const imageUrls = listing.imageUrls as string[]
  const imageUrl = listing.mainImage
    ? listing.mainImage
    : imageUrls.length > 0
    ? imageUrls[0]
    : ""
  return (
    <Link to={"/listings/" + listing.id} className="w-fit">
      <div>
        <div className="aspect-[4/3] w-full overflow-hidden rounded-lg">
          <img
            src={imageUrl}
            alt={listing.addressLineOne}
            width={0}
            height={0}
            className="object-fit h-full w-full transition duration-200 ease-in-out group-hover:scale-110"
          />
        </div>
        <div className="py-2">
          <h1 className="text-xl font-semibold">
            ${listing.price}{" "}
            <span className="text-base font-medium text-gray-500">/month</span>
          </h1>
          <p className="text-gray-500">2 bds • 1.5 bths • 2,000 sqft</p>
          <p>
            {listing.addressLineOne} {listing.addressLineTwo}
          </p>
        </div>
      </div>
    </Link>
  )
}
