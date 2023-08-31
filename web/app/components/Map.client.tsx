// import "leaflet-defaulticon-compatibility"
// import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"

type Props = {
  markerCoords: [number, number]
  address: string
}
export default function Map({ markerCoords, address }: Props) {
  return (
    <div className="h-full w-full overflow-hidden rounded-lg">
      <MapContainer
        center={markerCoords}
        zoom={15}
        className="h-full w-full rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={markerCoords}>
          <Popup>
            <div className="flex flex-col">
              <h1 className="text-base font-semibold">{address}</h1>
              <p>Fredericksburg, VA</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
