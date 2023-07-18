import { normalizeStreetName } from "@cityssm/street-name-normalize"

export function safeJsonParse(str: string): any {
  try {
    return JSON.parse(str)
  } catch (e) {
    return null
  }
}

export function combineAndFilterListings(listings: Listing[]) {
  const filteredListings: Listing[] = []
  for (const listing of listings) {
    const existingListing = findExisting(listing, filteredListings)
    if (!existingListing) {
      filteredListings.push(listing)
    } else {
      if (existingListing.lastUpdatedAt < listing.lastUpdatedAt) {
        filteredListings[filteredListings.indexOf(existingListing)] =
          mergeListing(listing, existingListing)
      }
    }
  }
  return filteredListings
}

const findExisting = (listing: Listing, filteredListings: Listing[]) => {
  for (const filteredListing of filteredListings) {
    if (isSameListing(listing, filteredListing)) {
      return filteredListing
    }
  }
  return null
}

const isSameListing = (listing: Listing, filteredListing: Listing) => {
  if (
    normalizeStreetName(listing.address.lineOne) ===
    normalizeStreetName(filteredListing.address.lineOne)
  ) {
    if (listing.address.lineTwo === listing.address.lineTwo) {
      return true
    } else if (
      (listing.address.lineTwo === null ||
        filteredListing.address.lineTwo === null) &&
      listing.bedrooms === filteredListing.bedrooms &&
      listing.bathrooms === filteredListing.bathrooms
    ) {
      return true
    }
  }
  return false
}

const mergeListing = (listing: Listing, existingListing: Listing) => {
  if (listing.sqft == null && existingListing.sqft != null) {
    listing.sqft = existingListing.sqft
  }
  if (listing.availabilityDate == null) {
    listing.availabilityDate = existingListing.availabilityDate
  }
  if (listing.lastUpdatedAt == null) {
    listing.lastUpdatedAt = existingListing.lastUpdatedAt
  }
  if (
    listing.address.lineTwo == null &&
    existingListing.address.lineTwo != null
  ) {
    listing.address.lineTwo = existingListing.address.lineTwo
  }
  if (listing.description == null && existingListing.description != null) {
    listing.description = existingListing.description
  }
  if (listing.contactInfo.email == null && existingListing.contactInfo.email) {
    listing.contactInfo.email = existingListing.contactInfo.email
  }
  if (listing.contactInfo.phone == null && existingListing.contactInfo.phone) {
    listing.contactInfo.phone = existingListing.contactInfo.phone
  }
  if (listing.imageUrls.length === 0 && existingListing.imageUrls.length > 0) {
    listing.imageUrls = existingListing.imageUrls
    listing.mainImage = existingListing.mainImage
  } else if (
    existingListing.isPreferredImageSource &&
    !listing.isPreferredImageSource
  ) {
    listing.imageUrls = existingListing.imageUrls
    listing.mainImage = existingListing.mainImage
  }
  return listing
}
