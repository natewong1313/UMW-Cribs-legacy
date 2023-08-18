import { connect } from "@planetscale/database"
import { listing as dbListing } from "@umw-cribs/db/schema.server"
import { eq, inArray } from "drizzle-orm"
import { drizzle } from "drizzle-orm/planetscale-serverless"
import { v4 as uuid } from "uuid"
import { ApartmentsDotComScraper } from "./sites/apartments-dot-com"
import { ZillowScraper } from "./sites/zillow"
import { combineAndFilterListings } from "./utils"

export interface Env {
  DATABASE_URL: string
}

export default {
  // The scheduled handler is invoked at the interval set in our wrangler.toml's
  // [[triggers]] configuration.
  async scheduled(
    event: ScheduledEvent,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    // // A Cron Trigger can make requests to other endpoints on the Internet,
    // // publish to a Queue, query a D1 Database, and much more.
    // //
    // // We'll keep it simple and make an API call to a Cloudflare API:
    // const resp = await fetch("https://api.cloudflare.com/client/v4/ips")
    // console.log(await resp.json())
    // const wasSuccessful = resp.ok ? "success" : "fail"

    // // You could store this result in KV, write to a D1 Database, or publish to a Queue.
    // // In this template, we'll just log the result:
    // console.info(`trigger fired at ${event.cron}: ${wasSuccessful}`)
    const dbConnection = connect({
      url: env.DATABASE_URL,
      fetch: (url: string, init: any) => {
        delete (init as any)["cache"]
        return fetch(url, init)
      },
    })
    const db = drizzle(dbConnection)

    const zillowScraper = new ZillowScraper()
    const apartmentsDotComScraper = new ApartmentsDotComScraper()
    const zillowListings = await zillowScraper.start()
    const apartmentsDotComListings = await apartmentsDotComScraper.start()
    let listings = combineAndFilterListings([
      ...zillowListings,
      ...apartmentsDotComListings,
    ])
    const previousListings = await db.select().from(dbListing)
    console.log(listings)
    console.log(previousListings)

    //update any listings that are in previousListings and change the id
    const listingIds: string[] = []
    listings = listings.map((listing) => {
      const previousListing = previousListings.find((previousListing) => {
        return (
          `${previousListing.addressLineOne} ${
            previousListing.addressLineTwo || ""
          }` === `${listing.address.lineOne} ${listing.address.lineTwo || ""}`
          // previousListing.addressLineOne === listing.address.lineOne &&
          // previousListing.addressLineTwo === listing.address.lineTwo
        )
      })
      if (previousListing) listingIds.push(previousListing.id)
      return {
        ...listing,
        id: previousListing ? previousListing.id : "",
      }
    })

    const unavailableIds = previousListings
      .filter((previousListing) => {
        return !listingIds.includes(previousListing.id)
      })
      .map((listing) => listing.id)
    if (unavailableIds.length > 0) {
      // set any listings that are no longer available to unavailable
      await db
        .update(dbListing)
        .set({
          isAvailable: false,
        })
        .where(inArray(dbListing.id, unavailableIds))
    }

    const existingListings = listings.filter((listing) => listing.id !== "")
    if (existingListings.length > 0) {
      // update any existing listings
      await db.transaction(async (tx) => {
        existingListings.forEach(async (listing) => {
          await tx
            .update(dbListing)
            .set({
              price: listing.price,
              bedrooms: listing.bedrooms,
              bathrooms: listing.bathrooms,
              sqft: listing.sqft,
              addressLineOne: listing.address.lineOne,
              addressLineTwo: listing.address.lineTwo,
              city: listing.address.city,
              state: listing.address.state,
              zip: listing.address.zip,
              latitude: listing.latitude,
              longitude: listing.longitude,

              availabilityDate: listing.availabilityDate,
              lastUpdatedAt: listing.lastUpdatedAt,
              listingUrl: listing.listingUrl,
              listingSource: listing.listingSource,
              description: listing.description,
              contactInfoEmail: listing.contactInfo.email,
              contactInfoPhone: listing.contactInfo.phone,
              imageUrls: listing.imageUrls,
              mainImage: listing.mainImage,
              isPreferredImageSource: listing.isPreferredImageSource,
              isAvailable: true,
            })
            .where(eq(dbListing.id, listing.id))
        })
      })
    }

    const newListings = listings.filter((listing) => listing.id === "")
    if (newListings.length > 0) {
      await db.insert(dbListing).values(
        newListings
          .filter((listing) => !listing.id)
          .map((listing: Listing) => ({
            id: uuid(),
            price: listing.price,
            bedrooms: listing.bedrooms,
            bathrooms: listing.bathrooms,
            sqft: listing.sqft,
            addressLineOne: listing.address.lineOne,
            addressLineTwo: listing.address.lineTwo,
            city: listing.address.city,
            state: listing.address.state,
            zip: listing.address.zip,
            latitude: listing.latitude,
            longitude: listing.longitude,
            availabilityDate: listing.availabilityDate,
            lastUpdatedAt: listing.lastUpdatedAt,
            listingUrl: listing.listingUrl,
            listingSource: listing.listingSource,
            description: listing.description,
            contactInfoEmail: listing.contactInfo.email,
            contactInfoPhone: listing.contactInfo.phone,
            imageUrls: listing.imageUrls,
            mainImage: listing.mainImage,
            isPreferredImageSource: listing.isPreferredImageSource,
            isAvailable: true,
          }))
      )
    }

    // // delete listings that weren't found
    // if (idsToDelete.length > 0) {
    //   await db.delete(dbListing).where(inArray(dbListing.id, idsToDelete))
    // }

    // await db.transaction(async (tx) => {
    //   await tx.delete(dbListing).where(inArray(dbListing.id, idsToDelete))
    //   // update listings that were found
    //   existingListings.forEach(async (listing) => {
    //     await tx
    //       .update(dbListing)
    //       .set({
    //         price: listing.price,
    //         bedrooms: listing.bedrooms,
    //         bathrooms: listing.bathrooms,
    //         sqft: listing.sqft,
    //         addressLineOne: listing.address.lineOne,
    //         addressLineTwo: listing.address.lineTwo,
    //         city: listing.address.city,
    //         state: listing.address.state,
    //         zip: listing.address.zip,
    //         latitude: listing.latitude,
    //         longitude: listing.longitude,
    //         availabilityDate: listing.availabilityDate,
    //         lastUpdatedAt: listing.lastUpdatedAt,
    //         listingUrl: listing.listingUrl,
    //         listingSource: listing.listingSource,
    //         description: listing.description,
    //         contactInfoEmail: listing.contactInfo.email,
    //         contactInfoPhone: listing.contactInfo.phone,
    //         imageUrls: listing.imageUrls,
    //         mainImage: listing.mainImage,
    //         isPreferredImageSource: listing.isPreferredImageSource,
    //       })
    //       .where(eq(dbListing.id, listing.id))
    //   })
    //   if (newListings.length > 0) {
    //     // insert new listings
    //     await tx.insert(dbListing).values(
    //       newListings.map((listing: Listing) => ({
    //         id: uuid(),
    //         price: listing.price,
    //         bedrooms: listing.bedrooms,
    //         bathrooms: listing.bathrooms,
    //         sqft: listing.sqft,
    //         addressLineOne: listing.address.lineOne,
    //         addressLineTwo: listing.address.lineTwo,
    //         city: listing.address.city,
    //         state: listing.address.state,
    //         zip: listing.address.zip,
    //         latitude: listing.latitude,
    //         longitude: listing.longitude,
    //         availabilityDate: listing.availabilityDate,
    //         lastUpdatedAt: listing.lastUpdatedAt,
    //         listingUrl: listing.listingUrl,
    //         listingSource: listing.listingSource,
    //         description: listing.description,
    //         contactInfoEmail: listing.contactInfo.email,
    //         contactInfoPhone: listing.contactInfo.phone,
    //         imageUrls: listing.imageUrls,
    //         mainImage: listing.mainImage,
    //         isPreferredImageSource: listing.isPreferredImageSource,
    //       }))
    //     )
    //   }
    // })

    // console.log(listings)
    // await db.transaction(async (tx) => {
    //   await tx.delete(dbListing)
    //   await tx.insert(dbListing).values(
    //     listings.map((listing: Listing) => ({
    //       id: listing.id ? listing.id : uuid(),
    //       price: listing.price,
    //       bedrooms: listing.bedrooms,
    //       bathrooms: listing.bathrooms,
    //       sqft: listing.sqft,
    //       addressLineOne: listing.address.lineOne,
    //       addressLineTwo: listing.address.lineTwo,
    //       city: listing.address.city,
    //       state: listing.address.state,
    //       zip: listing.address.zip,
    //       latitude: listing.latitude,
    //       longitude: listing.longitude,
    //       availabilityDate: listing.availabilityDate,
    //       lastUpdatedAt: listing.lastUpdatedAt,
    //       listingUrl: listing.listingUrl,
    //       listingSource: listing.listingSource,
    //       description: listing.description,
    //       contactInfoEmail: listing.contactInfo.email,
    //       contactInfoPhone: listing.contactInfo.phone,
    //       imageUrls: listing.imageUrls,
    //       mainImage: listing.mainImage,
    //       isPreferredImageSource: listing.isPreferredImageSource,
    //     }))
    //   )
    // })

    // find any previousListings that arent in the new listings
    // const deletedListingIds = previousListings
    //   .filter((previousListing) => {
    //     return !listings.find((listing) => {
    //       return (
    //         previousListing.addressLineOne === listing.address.lineOne &&
    //         previousListing.addressLineTwo === listing.address.lineTwo
    //       )
    //     })
    //   })
    //   .filter((listing) => listing.listingSource === "zillow")
    //   .map((listing) => listing.id)
    // console.log(deletedListingIds)
    // if (deletedListingIds.length > 0) {
    //   await db.delete(dbListing).where(inArray(dbListing.id, deletedListingIds))
    //   listings = listings.filter(
    //     (listing) => !deletedListingIds.includes(listing.id as string)
    //   )
    // }
    // // update the db with any listings that id isnt null
    // listings.forEach(async (listing) => {
    //   if (listing.id) {
    //     await db
    //       .update(dbListing)
    //       .set({
    //         price: listing.price,
    //         bedrooms: listing.bedrooms,
    //         bathrooms: listing.bathrooms,
    //         sqft: listing.sqft,
    //         addressLineOne: listing.address.lineOne,
    //         addressLineTwo: listing.address.lineTwo,
    //         city: listing.address.city,
    //         state: listing.address.state,
    //         zip: listing.address.zip,
    //         latitude: listing.latitude,
    //         longitude: listing.longitude,
    //         availabilityDate: listing.availabilityDate,
    //         lastUpdatedAt: listing.lastUpdatedAt,
    //         listingUrl: listing.listingUrl,
    //         listingSource: listing.listingSource,
    //         description: listing.description,
    //         contactInfoEmail: listing.contactInfo.email,
    //         contactInfoPhone: listing.contactInfo.phone,
    //         imageUrls: listing.imageUrls,
    //         mainImage: listing.mainImage,
    //         isPreferredImageSource: listing.isPreferredImageSource,
    //       })
    //       .where(eq(dbListing.id, listing.id))
    //   }
    // })
    // // add in any new listings
    // const newListings = listings.filter((listing) => !listing.id)
    // if (newListings.length > 0) {
    //   await db.insert(dbListing).values(
    //     newListings
    //       .filter((listing) => !listing.id)
    //       .map((listing: Listing) => ({
    //         id: uuid(),
    //         price: listing.price,
    //         bedrooms: listing.bedrooms,
    //         bathrooms: listing.bathrooms,
    //         sqft: listing.sqft,
    //         addressLineOne: listing.address.lineOne,
    //         addressLineTwo: listing.address.lineTwo,
    //         city: listing.address.city,
    //         state: listing.address.state,
    //         zip: listing.address.zip,
    //         latitude: listing.latitude,
    //         longitude: listing.longitude,
    //         availabilityDate: listing.availabilityDate,
    //         lastUpdatedAt: listing.lastUpdatedAt,
    //         listingUrl: listing.listingUrl,
    //         listingSource: listing.listingSource,
    //         description: listing.description,
    //         contactInfoEmail: listing.contactInfo.email,
    //         contactInfoPhone: listing.contactInfo.phone,
    //         imageUrls: listing.imageUrls,
    //         mainImage: listing.mainImage,
    //         isPreferredImageSource: listing.isPreferredImageSource,
    //       }))
    //   )
    // }
  },
}
