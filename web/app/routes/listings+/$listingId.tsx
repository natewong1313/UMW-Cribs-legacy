import {
  json,
  redirect,
  type LoaderArgs,
  V2_MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { IconMail, IconRecordMail } from "@tabler/icons-react"
import { listing as dbListing } from "@umw-cribs/db/schema.server"
import { eq } from "drizzle-orm"
import { useState } from "react"
import Container from "@/components/Container"
import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/Button"
import { cnMerge } from "@/lib/utils"

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: data?.listing.addressLineOne + " | UMW Cribs" }]
}

export const loader = async ({ request, params, context }: LoaderArgs) => {
  if (!params.listingId) return redirect("/listings")
  const listing = await context.db
    .select()
    .from(dbListing)
    .where(eq(dbListing.id, params.listingId as string))
  if (listing.length === 0) return redirect("/listings")
  const authRequest = context.auth.handleRequest(request)
  const session = await authRequest.validate()
  return json({ listing: listing[0], user: session?.user ?? null })
}

export default function ListingId() {
  const { listing, user } = useLoaderData<typeof loader>()
  const [selectedImage, setSelectedImage] = useState(listing.mainImage)
  // check for duplicate images
  const imageUrls = listing.imageUrls || []
  if (imageUrls[1] === listing.mainImage) imageUrls.shift()
  return (
    <div>
      <Navbar user={user} />
      <Container className="mt-2">
        <div className="flex justify-between">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold">
              {listing.addressLineOne} {listing.addressLineTwo}
            </h1>
            <p className="text-gray-500">
              {listing.city}, {listing.state} {listing.zip}
            </p>
          </div>
          {/* display some listing details */}
          <div className="flex">
            <div className="flex flex-col">
              <h2 className="text-gray-500">Monthly Rent</h2>
              <p className="text-lg font-medium">${listing.price}</p>
            </div>
            <div className="ml-4 flex flex-col">
              <h2 className="text-gray-500">Bedrooms</h2>
              <p className="text-lg font-medium">{listing.bedrooms}</p>
            </div>
            <div className="ml-4 flex flex-col">
              <h2 className="text-gray-500">Bathrooms</h2>
              <p className="text-lg font-medium">{listing.bathrooms}</p>
            </div>
            <div className="ml-4 flex flex-col">
              <h2 className="text-gray-500">Square Feet</h2>
              <p className="text-lg font-medium">{listing.sqft}</p>
            </div>
          </div>

          {/* <Button>
            <span className="mr-1.5 text-sky-200">
              <IconMail size={18} />
            </span>
            Contact
          </Button> */}
        </div>
        <div className="mt-6 grid grid-cols-2">
          <div className="flex flex-col">
            <div className="h-[30rem]">
              <img
                src={selectedImage || ""}
                alt="1"
                className="h-full w-full rounded-lg"
              />
            </div>
            {/* image previews */}
            <div className="flex flex-row gap-2 overflow-x-scroll">
              {imageUrls.map((url, index) => {
                return (
                  <img
                    key={index}
                    src={url}
                    alt={index.toString()}
                    className={cnMerge(
                      "mt-2 h-28 w-28 rounded-lg",
                      selectedImage !== url && "opacity-50"
                    )}
                    onClick={() => setSelectedImage(url)}
                  />
                )
              })}
            </div>
          </div>
          {/* <img
            src={listing.imageUrls[0]}
            alt="Listing Image"
            className="rounded-lg"
            // width={500}
            height={300}
          /> */}
        </div>

        {/* <div className="flex justify-between">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold">Description</h2>
            <p className="text-gray-500">{listing.description}</p>
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-bold">Details</h2>
            <p className="text-gray-500">
              {listing.bedrooms} bedrooms, {listing.bathrooms} bathrooms
            </p>
            <p className="text-gray-500">{listing.sqft} square feet</p>
          </div>
        </div> */}
      </Container>
    </div>
  )
}
