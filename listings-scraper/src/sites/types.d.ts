type Listing = {
  id: string
  price: number
  bedrooms: number
  bathrooms: number
  sqft: number | null
  address: {
    lineOne: string
    lineTwo: string | null
    city: string
    state: string
    zip: number
  }
  latitude: number
  longitude: number
  availabilityDate: Date
  lastUpdatedAt: Date
  listingUrl: string
  listingSource: "zillow" | "apartments.com"
  description: string | null
  contactInfo: {
    email: string | null
    phone: string | null
  }
  imageUrls: string[]
  mainImage: string | null
}
