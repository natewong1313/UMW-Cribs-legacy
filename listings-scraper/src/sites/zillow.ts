import { safeJsonParse } from "../utils"

export class ZillowScraper {
  private listings: { [listingId: string]: Listing } = {}
  constructor() {}
  async start() {
    await this.getListings()
    const getListingDataTasks: any[] = []
    Object.keys(this.listings).forEach((listingId) => {
      getListingDataTasks.push(this.getListingDetails(listingId))
    })
    await Promise.all(getListingDataTasks)
    return Object.values(this.listings)
  }
  async getListings() {
    this.log("Making request", "getListings")
    const response = await fetch(
      "https://zm.zillow.com/api/public/v2/mobile-search/homes/search",
      {
        method: "POST",
        body: JSON.stringify({
          showAllFirstPartyPhotos: false,
          returnFlags: ["navigationAds"],
          homeDetailsUriParameters: {
            showFactsAndFeatures: true,
            googleMaps: false,
            streetView: false,
            platform: "iphone",
          },
          photoTreatments: ["medium", "highResolution"],
          homeStatuses: ["forRent"],
          excludeFilter: ["pending", "acceptingBackupOffers"],
          sortAscending: true,
          listingCategoryFilter: "all",
          bedroomsRange: { min: 0 },
          regionParameters: {
            regionType: "standardId",
            regionIds: [{ regionIdType: "zipcode", regionId: "67241" }],
            boundaries: {
              westLongitude: -77.53993684745764,
              southLatitude: 38.22713812064387,
              eastLongitude: -77.43987515254237,
              northLatitude: 38.36314523638829,
            },
          },
          supplementResultsWithOffMarket: false,
          paging: { pageSize: 75, pageNumber: 1 },
          homeTypes: [
            "singleFamily",
            "manufactured",
            "apartment",
            "multiFamily",
            "condo",
            "townhome",
          ],
          sortOrder: "rentalDays",
        }),
        headers: {
          accept: "*/*",
          "accept-language": "en-US,en;q=0.9",
          "content-type": "application/json",
          "x-client": "com.zillow.rentals",
          "x-client-version": "16.42.0",
          "x-datadog-origin": "rum",
          "x-datadog-parent-id": "6193262487922986567",
          "x-datadog-sampling-priority": "1",
          "x-datadog-trace-id": "567518142335060153",
          "x-device-id": "7A9731A0-2C7E-4B58-BB49-98AA0FD22B52",
          "x-device-model": "iPhone",
          "x-px-authorization": "3",
          "x-system": "iOS",
          "x-system-version": "16.5.1",
        },
      }
    )
    if (response.status !== 200)
      throw new Error(
        this.buildLog(
          `Got status ${response.status}, body ${await response.text()}`,
          "getListings"
        )
      )
    const responseBody = safeJsonParse(await response.text())
    if (!responseBody)
      throw new Error(
        this.buildLog(
          `Could not parse response body ${await response.text()}`,
          "getListings"
        )
      )
    responseBody.searchResults
      .filter(
        (listing: any) =>
          listing.resultType === "property" && "location" in listing.property
      )
      .map((listing: any) => {
        const propertyDetails = listing.property
        const addressLines = this.parseAddress(
          propertyDetails.address.streetAddress
        )
        this.listings[propertyDetails.zpid] = {
          id: propertyDetails.zpid,
          price: propertyDetails.price.value,
          bedrooms: propertyDetails.bedrooms,
          bathrooms: propertyDetails.bathrooms,
          sqft: propertyDetails.livingArea,
          address: {
            lineOne: addressLines.addressLine1,
            lineTwo: addressLines.addressLine2,
            city: propertyDetails.address.city,
            state: propertyDetails.address.state,
            zip: propertyDetails.address.zipcode,
          },
          latitude: propertyDetails.location.latitude,
          longitude: propertyDetails.location.longitude,
          availabilityDate: new Date(),
          lastUpdatedAt: new Date(),
          listingUrl: `https://www.zillow.com/homedetails/umw_cribs/${propertyDetails.zpid}_zpid/`,
          listingSource: "zillow",
          description: null,
          contactInfo: {
            email: null,
            phone: null,
          },
          imageUrls: [
            propertyDetails.media.propertyPhotoLinks.highResolutionLink,
          ],
          mainImage:
            propertyDetails.media.propertyPhotoLinks.highResolutionLink,
          isPreferredImageSource: true,
        }
      })
  }
  async getListingDetails(listingId: string) {
    const response = await fetch(
      "https://zm.zillow.com/api/public/v1/home-details",
      {
        headers: {
          accept: "*/*",
          "accept-language": "en-US,en;q=0.9",
          "content-type": "application/json",
          "x-client": "com.zillow.rentals",
          "x-client-version": "16.42.0",
          "x-datadog-origin": "rum",
          "x-datadog-parent-id": "3056461120528355493",
          "x-datadog-sampling-priority": "1",
          "x-datadog-trace-id": "7856713714654977686",
          "x-device-id": "7A9731A0-2C7E-4B58-BB49-98AA0FD22B52",
          "x-device-model": "iPhone",
          "x-px-authorization": "3",
          "x-system": "iOS",
          "x-system-version": "16.5.1",
        },
        body: JSON.stringify({
          queryId: "da19be0fbac2c4c49560aa5d30157dfa",
          variables: {
            zpid: listingId,
            zoUpsellSurfaceId: "unknown",
            zoUpsellPlacementId: "ios-inline",
            svFeatureArea: "hdpStreetViewIos",
            svWidth: 414,
            svHeight: 305,
          },
        }),
        method: "POST",
      }
    )
    if (response.status !== 200)
      throw new Error(
        this.buildLog(
          `Got status ${response.status}, body ${await response.text()}`,
          "getListingDetails",
          listingId
        )
      )
    const responseBody = safeJsonParse(await response.text())
    if (!responseBody)
      throw new Error(
        this.buildLog(
          `Could not parse response body ${await response.text()}`,
          "getListingDetails",
          listingId
        )
      )
    const propertyDetails = responseBody.data.property
    this.listings[listingId].description = propertyDetails.description
    this.listings[listingId].imageUrls = [
      ...this.listings[listingId].imageUrls,
      ...propertyDetails.photoUrlsHighRes.map((link: any) => link.url),
    ]
  }
  parseAddress(address: string) {
    const addressLine1Pattern = /^(.*?)(?:\s+(?:APT|UNIT|#)\s*[\dA-Z-]+)?$/i
    // Address line 2 pattern: captures unit or apartment numbers
    const addressLine2Pattern =
      /^(?:.*?)(?:\s+(?:APT|UNIT|#)\s*([\dA-Z-]+).*?)?$/i
    const line1Match = address.match(addressLine1Pattern)
    const line2Match = address.match(addressLine2Pattern)
    const addressLine1 = line1Match && line1Match[1] ? line1Match[1] : ""
    const addressLine2 =
      line2Match && line2Match[1]
        ? line2Match[1].replace(/^(?:APT|UNIT)\s*/i, "")
        : null

    return { addressLine1, addressLine2 }
  }
  log(msg: string, caller: string, listingId?: string) {
    console.log(this.buildLog(msg, caller, listingId))
  }
  buildLog(msg: string, caller: string, listingId?: string) {
    return `[zillow:${caller}${
      listingId !== undefined ? ":" + listingId : ""
    }] ${msg}`
  }
}
