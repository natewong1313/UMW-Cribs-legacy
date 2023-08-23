// import "leaflet-defaulticon-compatibility"
// import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import "leaflet/dist/leaflet.css"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"

type Props = {
  markerCoords: [number, number]
}
export default function Map({ markerCoords }: Props) {
  return (
    <div className="h-full w-full overflow-hidden rounded-lg">
      <MapContainer
        center={markerCoords}
        zoom={12}
        className="m-0 h-96 w-[30rem] rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={markerCoords}>
          <Popup>
            <div className="flex flex-col">
              <h1 className="mt-1 text-base font-semibold">UMW</h1>
              <p>Fredericksburg, VA</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
