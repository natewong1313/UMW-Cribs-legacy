// import "leaflet-defaulticon-compatibility"
// import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import { Listing } from "@umw-cribs/db/schema.server"
import { Icon } from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"

type Props = {
  listings: Listing[]
}
export default function ListingsMap({ listings }: Props) {
  return (
    <div className="h-full w-full overflow-hidden rounded-lg">
      <MapContainer
        center={[38.309875, -77.466316]}
        zoom={13}
        className="h-full w-full rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {listings.map((listing) => {
          const icon = `data:image/svg+xml;utf8,${encodeURIComponent(`<?xml version="1.0" encoding="iso-8859-1"?>
          <svg viewBox="-1.513 14.372 500 500" xmlns="http://www.w3.org/2000/svg">
  <defs></defs>
  <rect style="fill: rgb(0, 77, 255);" x="-0.974" y="105.9" width="509.078" height="242.728" rx="16" ry="16"></rect>
  <text style="fill: rgb(255, 255, 255); font-family: Arial, sans-serif; font-size: 21.2px; white-space: pre; transform-box: fill-box; transform-origin: 50% 50%;" x="115.734" y="190.62" transform="matrix(7.193421, 0, 0, 8.433264, 104.303352, 45.599068)">$${listing.price}</text>
</svg>
          `)}`
          return (
            <Marker
              key={listing.id}
              position={[listing.latitude, listing.longitude]}
              icon={
                new Icon({
                  iconUrl: icon,
                  iconSize: [30, 30],
                })
              }
            >
              <Popup>
                <div className="flex flex-col">
                  <img
                    src={(listing.imageUrls as string[])[0]}
                    alt="listing"
                    className="h-32"
                  />
                  <h1 className="mt-1 text-base font-semibold">
                    {listing.addressLineOne}
                  </h1>
                  <p>
                    {listing.bedrooms} bedrooms, {listing.bathrooms} bathrooms
                  </p>
                  <a
                    className="mt-1.5"
                    target="_blank"
                    href={`/listings/${listing.id}`}
                    rel="noreferrer"
                  >
                    <p className="text-sm font-medium text-blue-500">
                      View Listing
                    </p>
                  </a>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
