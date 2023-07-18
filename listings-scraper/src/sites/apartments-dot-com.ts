import { safeJsonParse } from "../utils"

export class ApartmentsDotComScraper {
  private listings: { [listingId: string]: Listing } = {}
  constructor() {}

  async start() {
    const listingIds = await this.getIntialListings()
    const getListingDataTasks: any[] = []
    listingIds.forEach((listingId) => {
      getListingDataTasks.push(this.getListingDetails(listingId))
      getListingDataTasks.push(this.getListingImages(listingId))
    })
    await Promise.all(getListingDataTasks)
    this.filterOutDuplicateListings()
    return Object.values(this.listings)
  }

  async getIntialListings() {
    this.log("Making request", "getIntialListings")
    const response = await fetch(
      "https://pds.apps.apartments.com/aptsnet/mobile/listing/search",
      {
        method: "POST",
        body: JSON.stringify({
          rl: 700,
          facets: true,
          pn: 1,
          criteria: {
            o: 1,
            geog: {
              box: [
                -77.532574999999994, 38.270128999999997, -77.451477100000005,
                38.326434999999996,
              ],
              id: 9213,
              c: [-77.492026050000007, 38.298282],
              type: 2,
            },
            sort: 6,
          },
          ps: 999,
        }),
        headers: { "content-type": "application/json" },
      }
    )
    if (response.status !== 200)
      throw new Error(
        this.buildLog(
          `Got status ${response.status}, body ${await response.text()}`,
          "getIntialListings"
        )
      )
    const responseBody = safeJsonParse(await response.text())
    if (!responseBody)
      throw new Error(
        this.buildLog(
          `Could not parse response body ${await response.text()}`,
          "getIntialListings"
        )
      )
    const placards = responseBody["placards"].filter(
      (p: any) =>
        !p["bedRange"].includes(" - ") && (p["ad"] < 1 || p["ad"] === 6)
    )
    this.log(`Found ${placards.length} valid listings`, "getIntialListings")
    for (const placard of placards) {
      this.createInitialListingFromPlacard(placard)
    }
    return placards.map((placard: any) => placard["k"]) as string[]
  }
  createInitialListingFromPlacard(placard: any) {
    const listingId = placard["k"]
    const address1: string = placard["address"]["lineOne"]
    const address2 = placard["unitNumber"]?.replace(/^(?:APT|UNIT)\s*/i, "")
    const coords: [number, number] = placard["location"]
    this.listings[listingId] = {
      id: listingId,
      price: parseInt(
        placard["rentRange"].replace(/\$/g, "").replace(/,/g, "")
      ),
      bedrooms: -1,
      bathrooms: -1,
      sqft: null,
      address: {
        lineOne: address1,
        lineTwo: address2,
        city: placard["address"]["l"],
        state: placard["address"]["s"],
        zip: parseInt(placard["address"]["pc"]),
      },
      latitude: coords[1],
      longitude: coords[0],
      availabilityDate: new Date(),
      lastUpdatedAt: new Date(),
      listingUrl: `https://www.apartments.com/umw-cribs/${listingId}/`,
      listingSource: "apartments.com",
      description: null,
      contactInfo: {
        email: null,
        phone: placard["phone"] || null,
      },
      imageUrls: [],
      mainImage: null,
      isPreferredImageSource: false,
    }
    if (placard["primaryImage"]) {
      this.listings[listingId].mainImage = placard["primaryImage"]["url"]
      this.listings[listingId].imageUrls.push(placard["primaryImage"]["url"])
    }
  }
  async getListingDetails(listingId: string) {
    this.log("Making request", "getListingDetails", listingId)
    const response = await fetch(
      `https://pds.apps.apartments.com/aptsnet/mobile/listing/${listingId}/detail`,
      {
        method: "POST",
        body: JSON.stringify({ listingKey: listingId }),
        headers: { "content-type": "application/json" },
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
    this.log("Parsing response body", "getListingDetails", listingId)
    const availabilityDetails = responseBody["availabilities"].filter(
      (availability: any) => availability["name"] === "All"
    )[0].details[0]
    this.listings[listingId].bedrooms =
      availabilityDetails["beds"] === "Studio"
        ? 1
        : parseInt(availabilityDetails["bedNum"])
    this.listings[listingId].bathrooms = parseFloat(
      availabilityDetails["bathNum"]
    )
    this.listings[listingId].sqft = parseInt(
      availabilityDetails["area"].replace(/\SF/g, "").replace(/,/g, "")
    )
    this.listings[listingId].availabilityDate = new Date(
      availabilityDetails["availabilityDate"]
    )
    this.listings[listingId].description = responseBody["desc"] || null
    this.listings[listingId].lastUpdatedAt = responseBody["lastModifiedDate"]
  }
  async getListingImages(listingId: string) {
    this.log("Making request", "getListingImages", listingId)
    const response = await fetch(
      `https://pds.apps.apartments.com/aptsnet/mobile/listing/${listingId}/attachments`,
      {
        method: "POST",
        body: JSON.stringify({
          types: [10, 1, 3, 4, 6, 7, 33],
          sizes: [17],
        }),
        headers: { "content-type": "application/json" },
      }
    )
    if (response.status === 204) {
      this.log("No images found", "getListingImages", listingId)
      return
    }
    if (response.status !== 200)
      throw new Error(
        this.buildLog(
          `Got status ${response.status}, body ${await response.text()}`,
          "getListingImages",
          listingId
        )
      )
    const responseBody = safeJsonParse(await response.text())
    if (!responseBody || !responseBody["items"])
      throw new Error(
        this.buildLog(
          `Could not parse response body ${await response.text()}`,
          "getListingImages",
          listingId
        )
      )
    this.log("Parsing response body", "getListingImages", listingId)
    const imageUrls = responseBody["items"].map((image: any) => image["u"])
    if (this.listings[listingId].mainImage) {
      imageUrls.unshift(this.listings[listingId].mainImage)
    }
    this.listings[listingId].imageUrls = imageUrls
  }
  filterOutDuplicateListings() {
    const addressesSet: Set<string> = new Set()
    const filteredListings: { [addressIdentifier: string]: Listing } = {}
    for (const listingId in this.listings) {
      const address =
        this.listings[listingId].address.lineOne.toLowerCase() +
        ":" +
        (this.listings[listingId].address.lineTwo || "").toLowerCase()
      if (!addressesSet.has(address)) {
        addressesSet.add(address)
        filteredListings[address] = this.listings[listingId]
      } else if (
        addressesSet.has(address) &&
        this.listings[listingId].lastUpdatedAt >
          filteredListings[address].lastUpdatedAt
      ) {
        filteredListings[address] = this.listings[listingId]
      }
    }
    this.listings = filteredListings
  }

  log(msg: string, caller: string, listingId?: string) {
    console.log(this.buildLog(msg, caller, listingId))
  }
  buildLog(msg: string, caller: string, listingId?: string) {
    return `[apartments.com:${caller}${
      listingId !== undefined ? ":" + listingId : ""
    }] ${msg}`
  }
}
