import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Driver, Trip, LocationUpdate } from '../types'
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

const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
})

const dropoffIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
})

const FitBounds = ({ bounds }: { bounds: L.LatLngBoundsExpression }) => {
  const map = useMap()
  useEffect(() => {
    map.fitBounds(bounds, { padding: [60, 60] })
  }, [bounds, map])
  return null
}

interface Props {
  drivers: Driver[]
  liveLocations: Map<string, LocationUpdate>
  offlineDrivers: Set<string>
  selectedTrip: Trip | null
}

const DriverMap = ({ drivers, liveLocations, offlineDrivers, selectedTrip }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height: rect.height })
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const tripDriverId = selectedTrip
    ? typeof selectedTrip.driver === 'object'
      ? selectedTrip.driver._id
      : selectedTrip.driver
    : null

  const tripDriverLocation = tripDriverId
    ? liveLocations.get(tripDriverId) ??
      drivers.find((d) => d._id === tripDriverId)?.currentLocation
    : null

  const bounds: L.LatLngBoundsExpression | null =
    selectedTrip && tripDriverLocation
      ? [
          [selectedTrip.pickup.lat, selectedTrip.pickup.lng],
          [selectedTrip.dropoff.lat, selectedTrip.dropoff.lng],
          [tripDriverLocation.lat, tripDriverLocation.lng]
        ]
      : null

  const polylinePoints: L.LatLngExpression[] =
    selectedTrip && tripDriverLocation
      ? [
          [selectedTrip.pickup.lat, selectedTrip.pickup.lng],
          [tripDriverLocation.lat, tripDriverLocation.lng],
          [selectedTrip.dropoff.lat, selectedTrip.dropoff.lng]
        ]
      : []

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      {dimensions.width > 0 && (
        <MapContainer
          center={[28.6139, 77.209]}
          zoom={12}
          style={{ height: dimensions.height, width: dimensions.width }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {bounds && <FitBounds bounds={bounds} />}

          {selectedTrip && (
            <>
              <Marker position={[selectedTrip.pickup.lat, selectedTrip.pickup.lng]} icon={pickupIcon}>
                <Popup>
                  <strong>Pickup</strong><br />
                  {selectedTrip.pickup.address}
                </Popup>
              </Marker>
              <Marker position={[selectedTrip.dropoff.lat, selectedTrip.dropoff.lng]} icon={dropoffIcon}>
                <Popup>
                  <strong>Dropoff</strong><br />
                  {selectedTrip.dropoff.address}
                </Popup>
              </Marker>
              {polylinePoints.length > 0 && (
                <Polyline
                  positions={polylinePoints}
                  pathOptions={{ color: '#3b82f6', weight: 3, dashArray: '6 6' }}
                />
              )}
            </>
          )}

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
      )}
    </div>
  )
}

export default DriverMap