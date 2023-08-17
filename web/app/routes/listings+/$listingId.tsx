import { json, redirect, type LoaderArgs } from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { listing as dbListing } from "@umw-cribs/db/schema.server"
import { eq } from "drizzle-orm"

export const loader = async ({ params, context }: LoaderArgs) => {
  if (!params.listingId) return redirect("/listings")
  const listing = await context.db
    .select()
    .from(dbListing)
    .where(eq(dbListing.id, params.listingId as string))
  if (listing.length === 0) return redirect("/listings")
  return json({ listing: listing[0] })
}

export default function ListingId() {
  const { listing } = useLoaderData<typeof loader>()
  return (
    <div>
      {listing.addressLineOne} {listing.addressLineTwo}
    </div>
  )
}
