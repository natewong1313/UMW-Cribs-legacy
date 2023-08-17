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
import { cnMerge } from "@/lib/utils"

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
  let whereStatement
  const numOfBedrooms = url.searchParams.get("bedrooms")
  if (numOfBedrooms) {
    whereStatement = sql`${dbListing.bedrooms} = ${numOfBedrooms}`
  }
  const numOfBathrooms = url.searchParams.get("bathrooms")
  if (numOfBathrooms) {
    if (whereStatement) whereStatement = sql`${whereStatement} and `
    whereStatement = sql`${whereStatement}${dbListing.bathrooms} = ${numOfBathrooms}`
  }
  const minPrice = url.searchParams.get("minPrice")
  if (minPrice) {
    if (whereStatement) whereStatement = sql`${whereStatement} and `
    whereStatement = sql`${whereStatement}${dbListing.price} >= ${minPrice}`
  }
  const maxPrice = url.searchParams.get("maxPrice")
  if (maxPrice) {
    if (whereStatement) whereStatement = sql`${whereStatement} and `
    whereStatement = sql`${whereStatement}${dbListing.price} <= ${maxPrice}`
  }
  const listings = await context.db
    .select()
    .from(dbListing)
    .where(whereStatement)
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
  const [filtersFormDirty, setFiltersFormDirty] = useState(false)
  const [numOfBedrooms, setNumOfBedrooms] = useState(
    searchParams.get("bedrooms") ?? ""
  )
  const [numOfBathrooms, setNumOfBathrooms] = useState(
    searchParams.get("bathrooms") ?? ""
  )
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "")
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "")
  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    params.set("bedrooms", numOfBedrooms)
    if (numOfBedrooms === "") params.delete("bedrooms")
    params.set("bathrooms", numOfBathrooms)
    if (numOfBathrooms === "") params.delete("bathrooms")
    params.set("minPrice", minPrice)
    if (minPrice === "") params.delete("minPrice")
    params.set("maxPrice", maxPrice)
    if (maxPrice === "") params.delete("maxPrice")
    setSearchParams(params)
    setFiltersModalOpen(false)
    setFiltersFormDirty(false)
  }
  const numberOfFiltersApplied = useMemo(() => {
    let amount = 0
    if (searchParams.get("bedrooms")) amount++
    if (searchParams.get("bathrooms")) amount++
    if (searchParams.get("minPrice")) amount++
    if (searchParams.get("maxPrice")) amount++
    return amount
  }, [searchParams])
  return (
    <div>
      <Navbar user={user} />
      <Container>
        <div className="flex items-center justify-between pb-3">
          <div className="hidden sm:block">
            <h1 className="text-2xl font-bold sm:block">Browse Listings</h1>
          </div>
          <div className="grid w-full grid-cols-2 items-center gap-2 sm:flex sm:w-fit sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setFiltersModalOpen(true)}
              className={
                numberOfFiltersApplied > 0
                  ? "border-blue-300 bg-blue-50 text-blue-500 hover:bg-blue-100 active:bg-blue-100"
                  : ""
              }
            >
              <span
                className={cnMerge(
                  "mr-1.5",
                  numberOfFiltersApplied > 0
                    ? "text-blue-500"
                    : " text-gray-400"
                )}
              >
                <IconAdjustments size={18} />
              </span>
              Adjust filters{" "}
              {numberOfFiltersApplied > 0 && `(${numberOfFiltersApplied})`}
            </Button>
            {/* <div className="sm:hidden">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setFiltersModalOpen(true)}
              >
                <span className="text-gray-400">
                  <IconAdjustments size={18} />
                </span>
              </Button>
            </div> */}
            {/* <Select
              placeholder="Select view"
              value={view}
              setValue={(value) => setView(value)}
              className="sm:hidden"
            >
              <SelectOption title="Listings view" value="listingsView" />
              <SelectOption title="Map view" value="mapView" />
            </Select> */}
            <Select
              placeholder="Sort by"
              className="w-full sm:w-fit"
              value={sortBy}
              setValue={(value) => {
                const params = new URLSearchParams(searchParams)
                params.set("sortBy", value)
                setSearchParams(params)
              }}
            >
              <SelectOption title="Most recent" value="mostRecent" />
              <SelectOption title="Price: Low to high" value="lowToHigh" />
              <SelectOption title="Price: High to low" value="highToLow" />
            </Select>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-7">
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
          <div className="col-span-3 hidden h-full sm:block">
            <ClientOnly fallback={<div style={{ height: "400px" }} />}>
              {/* @ts-ignore */}
              {() => <MapView listings={listings} />}
            </ClientOnly>
          </div>
        </div>
      </Container>
      <Modal
        isOpen={filtersModalOpen}
        setIsOpen={setFiltersModalOpen}
        title="Filters"
      >
        <form
          className="mt-3 flex flex-col divide-y divide-gray-200"
          onSubmit={applyFilters}
          onChange={() => setFiltersFormDirty(true)}
        >
          <div className="flex flex-col">
            <h1 className="font-medium">Number of Bedrooms</h1>
            <ButtonGroup
              className="mt-2"
              defaultLabel="Any"
              options={["", "1", "2", "3", "4", "5+"]}
              value={numOfBedrooms}
              setValue={(value) => {
                setNumOfBedrooms(value)
                setFiltersFormDirty(true)
              }}
            />
          </div>
          <div className="mt-3 flex flex-col pt-2">
            <h1 className="font-medium">Number of Bathrooms</h1>
            <ButtonGroup
              className="mt-2"
              defaultLabel="Any"
              options={["", "1", "1.5", "2", "2.5", "3+"]}
              value={numOfBathrooms}
              setValue={(value) => {
                setNumOfBathrooms(value)
                setFiltersFormDirty(true)
              }}
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
                onChange={(e) => setMinPrice(e.target.value)}
                icon={<IconCurrencyDollar size={18} />}
              />
              <span className="text-gray-400">-</span>
              <Input
                type="number"
                placeholder="Max price"
                className="w-32"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                icon={<IconCurrencyDollar size={18} />}
              />
            </div>
          </div>
          <div className="mt-3 pt-2">
            <Button className="mt-2 w-full" disabled={!filtersFormDirty}>
              Apply filters
            </Button>
          </div>
        </form>
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
  // const isNew = useMemo(() => {
  //   // check if last update at was less than a day ago
  //   const lastUpdatedAt = new Date(listing.lastUpdatedAt)
  //   const now = new Date()
  //   const diff = now.getTime() - lastUpdatedAt.getTime()
  //   const diffInDays = diff / (1000 * 3600 * 24)
  //   console.log(listing.lastUpdatedAt)
  //   return diffInDays < 1
  // }, [listing.lastUpdatedAt])
  return (
    <Link to={"/listings/" + listing.id} className="group w-fit">
      <div className="relative flex aspect-[4/3] w-full overflow-hidden rounded-lg">
        <img
          src={imageUrl}
          alt={listing.addressLineOne}
          width={0}
          height={0}
          className="object-fit h-full w-full"
        />
        {/* {isNew && (
          <div className="absolute ml-1 mt-1">
            <div className="w-fit rounded-md bg-blue-500 px-2 py-1 text-sm text-white">
              New
            </div>
          </div>
        )} */}
      </div>
      <div className="py-2">
        <div className="relative flex justify-end">
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
