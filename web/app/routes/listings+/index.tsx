import * as ScrollArea from "@radix-ui/react-scroll-area"
import {
  ActionArgs,
  json,
  V2_MetaFunction,
  type LoaderArgs,
  LinksFunction,
} from "@remix-run/cloudflare"
import {
  Link,
  useLoaderData,
  useRevalidator,
  useSearchParams,
} from "@remix-run/react"
import {
  IconAdjustments,
  IconBookmark,
  IconBookmarkFilled,
  IconCurrencyDollar,
} from "@tabler/icons-react"
import {
  type Listing as DbListing,
  listing as dbListing,
  userLikedListings,
} from "@umw-cribs/db/schema.server"
import { eq, sql } from "drizzle-orm"
import { useMemo, useState } from "react"
import { ClientOnly } from "@/components/ClientOnly"
import Container from "@/components/Container"
import MapView from "@/components/MapView.client"
import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/Button"
import ButtonGroup from "@/components/ui/ButtonGroup"
import { Input } from "@/components/ui/Input"
import Modal from "@/components/ui/Modal"
import { Select, SelectOption } from "@/components/ui/Select"

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Browse Listings | UMW Cribs" },
    { name: "description", content: "Welcome to Remix!" },
  ]
}
export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "https://unpkg.com/leaflet@1.8.0/dist/leaflet.css",
  },
]

export const loader = async ({ request, context }: LoaderArgs) => {
  const url = new URL(request.url)
  const headers = new Headers()
  const sortBy = url.searchParams.get("sortBy") ?? "mostRecent"
  let orderByStatement = sql`${dbListing.lastUpdatedAt} desc`
  switch (sortBy) {
    case "lowToHigh":
      orderByStatement = sql`${dbListing.price} asc`
      break
    case "highToLow":
      orderByStatement = sql`${dbListing.price} desc`
      break
    default:
      break
  }
  const listings = await context.db
    .select()
    .from(dbListing)
    .orderBy(orderByStatement)

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
  const [searchParams, setSearchParams] = useSearchParams()
  const sortBy = searchParams.get("sortBy") ?? "mostRecent"
  const [filtersModalOpen, setFiltersModalOpen] = useState(false)
  const bedrooms = searchParams.get("bedrooms") ?? ""
  const bathrooms = searchParams.get("bathrooms") ?? ""
  const minPrice = searchParams.get("minPrice") ?? ""
  const maxPrice = searchParams.get("maxPrice") ?? ""
  const addSearchParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set(key, value)
    setSearchParams(params)
  }
  return (
    <div>
      <Navbar user={user} />
      <Container>
        <div className="flex items-center justify-between pb-3">
          <h1 className="text-2xl font-bold">Browse Listings</h1>
          <div className="flex items-center space-x-2">
            <div className="hidden sm:block">
              <Button
                variant="outline"
                onClick={() => setFiltersModalOpen(true)}
              >
                <span className="mr-1.5 text-gray-400">
                  <IconAdjustments size={18} />
                </span>
                Adjust filters
              </Button>
            </div>
            <div className="sm:hidden">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setFiltersModalOpen(true)}
              >
                <span className="text-gray-400">
                  <IconAdjustments size={18} />
                </span>
              </Button>
            </div>
            <div className="flex items-center">
              <Select
                placeholder="Sort by"
                className="ml-auto"
                value={sortBy}
                setValue={(value) =>
                  setSearchParams({ ...searchParams, sortBy: value })
                }
              >
                <SelectOption title="Most recent" value="mostRecent" />
                <SelectOption title="Price: Low to high" value="lowToHigh" />
                <SelectOption title="Price: High to low" value="highToLow" />
              </Select>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          <div
            className="col-span-4 grid grid-cols-1 gap-4 overflow-y-scroll sm:grid-cols-2 md:grid-cols-3"
            style={{ height: "calc(100vh - 164px)" }}
          >
            {listings.map((listing) => (
              <Listing
                key={listing.id}
                //@ts-ignore
                listing={listing}
                likedListingIds={likedListingIds}
              />
            ))}
          </div>
          <div className="col-span-3 h-full">
            <ClientOnly fallback={<div style={{ height: "400px" }} />}>
              {() => <MapView />}
            </ClientOnly>
          </div>
        </div>
        {/* <div className="">
          <div className="grid w-[65%] grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {listings.map((listing) => (
              <Listing
                key={listing.id}
                //@ts-ignore
                listing={listing}
                likedListingIds={likedListingIds}
              />
            ))}
          </div>
          <div className="fixed top-0 float-right h-full w-96">
            <ClientOnly fallback={<div style={{ height: "400px" }} />}>
              {() => <MapView />}
            </ClientOnly>
          </div>
        </div> */}
      </Container>
      {/* horizontally centered absolute div */}
      {/* <div className="absolute inset-x-0 bottom-0 flex justify-center pb-3">
        <div className="rounded-full bg-white px-4 py-2">
          <p>Toggle map view</p>
        </div>
      </div> */}

      <Modal
        isOpen={filtersModalOpen}
        setIsOpen={setFiltersModalOpen}
        title="Filters"
      >
        <div className="mt-3 flex flex-col divide-y divide-gray-200">
          <div className="flex flex-col">
            <h1 className="font-medium">Number of Bedrooms</h1>
            <ButtonGroup
              className="mt-2"
              options={["1", "2", "3", "4", "5+"]}
              value={bedrooms}
              setValue={(value) => addSearchParam("bedrooms", value)}
            />
          </div>
          <div className="mt-3 flex flex-col pt-2">
            <h1 className="font-medium">Number of Bathrooms</h1>
            <ButtonGroup
              className="mt-2"
              options={["1", "1.5", "2", "2.5", "3+"]}
              value={bathrooms}
              setValue={(value) => addSearchParam("bathrooms", value)}
            />
          </div>
          <div className="mt-3 flex flex-col pt-2">
            <h1 className="font-medium">Rent Price</h1>
            <div className="mt-2 flex items-center space-x-2">
              <Input
                type="number"
                placeholder="Min price"
                className="w-32"
                value={minPrice}
                onChange={(e) => addSearchParam("minPrice", e.target.value)}
                icon={<IconCurrencyDollar size={18} />}
              />
              <span className="text-gray-400">-</span>
              <Input
                type="number"
                placeholder="Max price"
                className="w-32"
                value={maxPrice}
                onChange={(e) => addSearchParam("maxPrice", e.target.value)}
                icon={<IconCurrencyDollar size={18} />}
              />
            </div>
          </div>
        </div>
      </Modal>
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
          {/* {isLiked ? (
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
          )} */}
        </div>
        <h1 className="text-xl font-semibold">
          ${listing.price}{" "}
          <span className="text-base font-medium text-gray-500">/month</span>
        </h1>
        <p className="text-gray-500">
          {listing.bedrooms} {listing.bedrooms !== 1 ? "bds" : "bed"} •{" "}
          {listing.bathrooms} {listing.bathrooms !== 1 ? "bths" : "bath"}
          {listing.sqft && listing.sqft > -1 && " • " + listing.sqft + " sqft"}
        </p>
        <p className="font-medium">
          {listing.addressLineOne} {listing.addressLineTwo}
        </p>
      </div>
    </Link>
  )
}
