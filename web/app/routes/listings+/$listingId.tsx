import {
  json,
  redirect,
  type LoaderArgs,
  V2_MetaFunction,
  LinksFunction,
} from "@remix-run/cloudflare"
import { Form, Link, useLoaderData } from "@remix-run/react"
import {
  IconArrowUpRight,
  IconBookmark,
  IconBookmarkFilled,
  IconChevronRight,
  IconMail,
  IconPhone,
  IconPhoto,
  IconShare2,
} from "@tabler/icons-react"
import {
  listing as dbListing,
  type Listing as DbListing,
  userLikedListings,
} from "@umw-cribs/db/schema.server"
import { eq, sql } from "drizzle-orm"
import { ClientOnly } from "@/components/ClientOnly"
import Container from "@/components/Container"
import Footer from "@/components/Footer"
import Map from "@/components/Map.client"
import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/Button"

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: data?.listing.addressLineOne + " | UMW Cribs" }]
}

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "https://unpkg.com/leaflet@1.0.1/dist/leaflet.css",
  },
]

export const loader = async ({ request, params, context }: LoaderArgs) => {
  if (!params.listingId) return redirect("/listings")
  const listing = await context.db
    .select()
    .from(dbListing)
    .where(eq(dbListing.id, params.listingId as string))
  if (listing.length === 0) return redirect("/listings")
  const authRequest = context.auth.handleRequest(request)
  const session = await authRequest.validate()
  let isLiked = false
  if (session) {
    const likedListing = await context.db
      .select()
      .from(userLikedListings)
      .where(eq(userLikedListings.userId, session.user.userId))
      .where(eq(userLikedListings.listingId, listing[0].id))
    if (likedListing.length > 0) {
      isLiked = true
    }
  }
  return json({
    listing: listing[0],
    isLiked,
    user: session?.user ?? null,
  })
}

export const action = async ({ request, context }: LoaderArgs) => {
  const body = await request.formData()
  const listingId = body.get("id")
  if (!listingId) return json(null)
  const authRequest = context.auth.handleRequest(request)
  const session = await authRequest.validate()
  if (!session) return json(null)
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
  } else {
    await context.db.execute(
      sql`delete from ${userLikedListings} where ${userLikedListings.userId} = ${session.user.userId} and ${userLikedListings.listingId} = ${listingId}`
    )
  }
  return json(null)
}

export default function ListingId() {
  const { listing, user, isLiked } = useLoaderData<typeof loader>()
  // check for duplicate images
  let imageUrls = listing.imageUrls || []
  //remove duplicate urls
  imageUrls = imageUrls.filter((url, index) => {
    return imageUrls.indexOf(url) === index
  })
  if (listing.listingSource === "zillow") {
    imageUrls.splice(1, 1)
  }
  console.log(isLiked)

  return (
    <div>
      <Navbar user={user} />
      <Container className="max-w-6xl">
        <div className="flex items-center">
          <Link to="/listings" className="font-medium text-blue-500">
            Listings
          </Link>
          <span className="mx-0.5 text-gray-400">
            <IconChevronRight size={18} />
          </span>
          <p className="text-gray-500">
            {listing.addressLineOne} {listing.addressLineTwo}
          </p>
        </div>
        <div className="mt-2 flex justify-between">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold">
              {listing.addressLineOne} {listing.addressLineTwo}
            </h1>
            <p className="text-gray-500">
              {listing.city}, {listing.state} {listing.zip}
            </p>
          </div>
          <div className="flex">
            <Form method="post">
              <input type="hidden" name="id" value={listing.id} />
              {isLiked ? (
                <Button
                  variant="primary-outline"
                  className="mr-2 w-10 sm:w-fit"
                  type="submit"
                >
                  <span className="text-blue-500 sm:mr-1.5">
                    <IconBookmarkFilled size={18} />
                  </span>
                  <p className="hidden sm:block">Saved</p>
                </Button>
              ) : (
                <Button variant="outline" className="mr-2 w-10 sm:w-fit">
                  <span className="text-gray-500 sm:mr-1.5">
                    <IconBookmark size={18} />
                  </span>
                  <p className="hidden sm:block">Save</p>
                </Button>
              )}
            </Form>

            <Button variant="outline" className="w-10 sm:w-fit">
              <span className="text-gray-500 sm:mr-1.5">
                <IconShare2 size={18} />
              </span>
              <p className="hidden sm:block">Share</p>
            </Button>
          </div>
        </div>
        <div className="relative mt-4 flex max-w-6xl items-end justify-end">
          <div className="grid w-full gap-4 sm:grid-cols-3">
            <div className="col-span-2 h-[28rem]">
              <img
                src={listing.mainImage ?? imageUrls[0]}
                alt={listing.addressLineOne}
                className="h-full w-full rounded-lg"
              />
            </div>
            <div className="col-span-1 hidden h-[28rem] grid-rows-2 gap-2 sm:grid">
              <img
                src={imageUrls[1]}
                alt="1"
                className="h-full w-full rounded-lg"
              />
              <img
                src={imageUrls[2]}
                alt="1"
                className="h-full w-full rounded-lg"
              />
            </div>
          </div>
          <div className="absolute p-2">
            <Button variant="secondary" className="text-sm shadow">
              <span className="mr-1.5 text-gray-500">
                <IconPhoto size={16} />
              </span>
              View all
            </Button>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="col-span-2 flex flex-col">
            <div className="flex space-x-4">
              <div className="flex flex-col">
                <h2 className="text-gray-500">Monthly Rent</h2>
                <p className="text-xl font-medium">${listing.price}</p>
              </div>
              <div className="flex flex-col">
                <h2 className="text-gray-500">Bedrooms</h2>
                <p className="text-xl font-medium">{listing.bedrooms}</p>
              </div>
              <div className="flex flex-col">
                <h2 className="text-gray-500">Bathrooms</h2>
                <p className="text-xl font-medium">{listing.bathrooms}</p>
              </div>
              {listing.sqft && (
                <div className="flex flex-col">
                  <h2 className="text-gray-500">Square Feet</h2>
                  <p className="text-xl font-medium">{listing.sqft}</p>
                </div>
              )}
              <div className="flex flex-col">
                <h2 className="text-gray-500">Move In Date</h2>
                <p className="text-lg font-medium">
                  {new Date(listing.availabilityDate) < new Date() ? (
                    <span className="text-blue-500">Available Now</span>
                  ) : (
                    new Date(listing.availabilityDate).toLocaleDateString()
                  )}
                </p>
              </div>
            </div>
            <div className="my-2.5 sm:hidden">
              {/* @ts-ignore */}
              <ListingContactButtons listing={listing} />
            </div>
            <div className="mt-4">
              <h1 className="text-lg font-semibold">
                About {listing.addressLineOne}
              </h1>
              <p className="mt-1 text-gray-500">{listing.description}</p>
            </div>
          </div>
          <div className="w-xs hidden h-fit rounded-md border border-gray-300 p-3 sm:block">
            <h1 className="text-lg font-bold">Contact Property</h1>
            <p className="my-1 text-gray-500">
              Contact the property to schedule a tour or get more information
            </p>
            {/* @ts-ignore */}
            <ListingContactButtons listing={listing} />
          </div>
        </div>
        <div className="mt-4">
          <h1 className="text-lg font-semibold">Where you'll be</h1>
          <div className="mt-2 block h-96 w-full">
            <ClientOnly
              fallback={<div className="h-96 w-full rounded-md bg-gray-200" />}
            >
              {() => (
                <Map
                  markerCoords={[listing.latitude, listing.longitude]}
                  address={
                    listing.addressLineOne + " " + listing.addressLineTwo
                  }
                />
              )}
            </ClientOnly>
          </div>
        </div>
      </Container>
      <Footer />
    </div>
  )
}

type ListingContactButtonsProps = {
  listing: DbListing
}
const ListingContactButtons = ({ listing }: ListingContactButtonsProps) => {
  return (
    <>
      {listing.contactInfoPhone && (
        <Button className="mt-2 w-full">
          <span className="mr-1.5 text-sky-200">
            <IconPhone size={18} />
          </span>
          {listing.contactInfoPhone}
        </Button>
      )}
      {listing.contactInfoEmail && (
        <Button className="mt-2 w-full">
          <span className="mr-1.5 text-sky-200">
            <IconMail size={18} />
          </span>
          {listing.contactInfoEmail}
        </Button>
      )}
      {!listing.contactInfoPhone && !listing.contactInfoEmail && (
        <Button asChild className="mt-2 w-full">
          <a href={listing.listingUrl} target="_blank" rel="noreferrer">
            <span className="mr-1.5 text-sky-200">
              <IconArrowUpRight size={18} />
            </span>
            Contact on{" "}
            {listing.listingSource.charAt(0).toUpperCase() +
              listing.listingSource.slice(1)}
          </a>
        </Button>
      )}
    </>
  )
}
