import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Driver } from '../types'
import type { LocationUpdate } from '../types'
import 'leaflet/dist/leaflet.css'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

const activeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
})

const offlineIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
})

interface Props {
  drivers: Driver[]
  liveLocations: Map<string, LocationUpdate>
  offlineDrivers: Set<string>
}

const DriverMap = ({ drivers, liveLocations, offlineDrivers }: Props) => {
  return (
    <MapContainer
      center={[28.6139, 77.209]}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {drivers.map((driver) => {
        const live = liveLocations.get(driver._id)
        const isOffline = offlineDrivers.has(driver._id)
        const lat = live?.lat ?? driver.currentLocation?.lat
        const lng = live?.lng ?? driver.currentLocation?.lng

        if (!lat || !lng) return null

        return (
          <Marker
            key={driver._id}
            position={[lat, lng]}
            icon={isOffline ? offlineIcon : activeIcon}
          >
            <Popup>
              <strong>{driver.name}</strong><br />
              {driver.vehicleNumber}<br />
              <span style={{ color: isOffline ? '#94a3b8' : '#22c55e' }}>
                {isOffline ? 'Offline' : 'Active'}
              </span><br />
              {live && (
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  Updated {new Date(live.updatedAt).toLocaleTimeString()}
                </span>
              )}
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}

export default DriverMap