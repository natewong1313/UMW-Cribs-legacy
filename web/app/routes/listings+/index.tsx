import { Bookmark, BookmarkSimple, Heart } from "@phosphor-icons/react"
import { ActionArgs, json, type LoaderArgs } from "@remix-run/cloudflare"
import { Link, useLoaderData, useRevalidator } from "@remix-run/react"
import { IconBookmark, IconBookmarkFilled } from "@tabler/icons-react"
import {
  type Listing as DbListing,
  listing as dbListing,
  userLikedListings,
} from "@umw-cribs/db/schema.server"
import { eq, sql } from "drizzle-orm"
import { useMemo } from "react"
import Container from "@/components/Container"
import Navbar from "@/components/Navbar"
import { Select, SelectOption } from "@/components/ui/Select"

export const loader = async ({ request, context }: LoaderArgs) => {
  const headers = new Headers()
  const listings = await context.db.select().from(dbListing)
  const authRequest = context.auth.handleRequest(request)
  const session = await authRequest.validate()
  let likedListingIds: string[] = []
  if (session) {
    const likedListings = await context.db
      .select()
      .from(userLikedListings)
      .where(eq(userLikedListings.userId, session.user.userId))
    likedListingIds = likedListings.map((l) => l.listingId)
  }
  return json(
    { listings, likedListingIds, user: session?.user ?? null },
    { headers }
  )
}

export const action = async ({ request, context }: ActionArgs) => {
  const headers = new Headers()
  const body = await request.formData()
  const listingId = body.get("id")
  if (!listingId) return json(null, { headers })
  const authRequest = context.auth.handleRequest(request)
  const session = await authRequest.validate()
  if (!session) return json(null, { headers })

  if (body.get("type") === "like") {
    const hasAlreadyLiked = await context.db
      .select()
      .from(userLikedListings)
      .where(eq(userLikedListings.userId, session.user.userId))
      .where(eq(userLikedListings.listingId, listingId.toString()))
    if (hasAlreadyLiked.length === 0) {
      await context.db.insert(userLikedListings).values({
        userId: session.user.userId,
        listingId: listingId.toString(),
      })
    }
  } else if (body.get("type") === "unlike") {
    await context.db.execute(
      sql`delete from ${userLikedListings} where ${userLikedListings.userId} = ${session.user.userId} and ${userLikedListings.listingId} = ${listingId}`
    )
  }
  return json(null, { headers })
}

export default function ListingsPage() {
  const { listings, likedListingIds, user } = useLoaderData<typeof loader>()
  return (
    <div>
      <Navbar user={user} />
      <Container>
        <h1 className="mb-8 mt-4 text-center text-2xl font-bold">
          Browse the latest listings
        </h1>
        <Select placeholder="Filter by">
          <SelectOption title="Most recent" value="all" />
          <SelectOption title="Price: Low to high" value="low" />
        </Select>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {listings.map((listing) => (
            <Listing
              key={listing.id}
              //@ts-ignore
              listing={listing}
              likedListingIds={likedListingIds}
            />
          ))}
        </div>
      </Container>
    </div>
  )
}

type ListingProps = {
  listing: DbListing
  likedListingIds: string[]
}
const Listing = ({ listing, likedListingIds }: ListingProps) => {
  const revalidator = useRevalidator()
  const imageUrls = listing.imageUrls as string[]
  const imageUrl = listing.mainImage
    ? listing.mainImage
    : imageUrls.length > 0
    ? imageUrls[0]
    : ""
  const isLiked = useMemo(
    () => likedListingIds.includes(listing.id),
    [listing.id, likedListingIds]
  )

  const updateListingLikedStatus = async (type: string) => {
    let formData = new FormData()
    formData.append("id", listing.id)
    formData.append("type", type)
    await fetch("/listings", {
      body: formData,
      method: "post",
    })
    revalidator.revalidate()
  }
  return (
    <Link to={"/listings/" + listing.id} className="group w-fit">
      <div className="aspect-[4/3] w-full overflow-hidden rounded-lg">
        <img
          src={imageUrl}
          alt={listing.addressLineOne}
          width={0}
          height={0}
          className="object-fit h-full w-full"
        />
      </div>
      <div className="py-2">
        <div className="flex justify-end">
          {isLiked ? (
            <button
              className="absolute z-10 text-blue-500"
              onClick={(e) => {
                e.preventDefault()
                updateListingLikedStatus("unlike")
              }}
            >
              <IconBookmarkFilled size={24} />
            </button>
          ) : (
            <button
              className="absolute z-10 text-gray-400"
              onClick={(e) => {
                e.preventDefault()
                updateListingLikedStatus("like")
              }}
            >
              <IconBookmark size={24} />
            </button>
          )}
        </div>
        <h1 className="text-xl font-semibold">
          ${listing.price}{" "}
          <span className="text-base font-medium text-gray-500">/month</span>
        </h1>
        <p className="text-gray-500">
          {listing.bedrooms} {listing.bedrooms > 1 ? "bds" : "bed"} •{" "}
          {listing.bathrooms} {listing.bathrooms > 1 ? "bths" : "bath"}
          {listing.sqft && listing.sqft > -1 && " • " + listing.sqft + " sqft"}
        </p>
        <p className="font-medium">
          {listing.addressLineOne} {listing.addressLineTwo}
        </p>
      </div>
    </Link>
  )
}
