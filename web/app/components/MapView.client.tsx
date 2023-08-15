// import "leaflet-defaulticon-compatibility"
// import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import "leaflet/dist/leaflet.css"
import { MapContainer, TileLayer, useMap, Marker, Popup } from "react-leaflet"

type Props = {
  height?: string
}
export default function MapView({ height }: Props) {
  return (
    // <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false}>
    //   <TileLayer
    //     attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    //     url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    //   />
    //   <Marker position={[51.505, -0.09]}>
    //     <Popup>
    //       A pretty CSS3 popup. <br /> Easily customizable.
    //     </Popup>
    //   </Marker>
    // </MapContainer>
    <div
      className="h-full w-full overflow-hidden rounded-lg"
      style={{ height }}
    >
      <MapContainer
        center={[38.3013, -77.4745]}
        zoom={12}
        className="h-full w-full rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* <Marker position={[51.505, -0.09]}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker> */}
      </MapContainer>
    </div>
  )
}
