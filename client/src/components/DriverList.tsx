import type { Driver } from '../types'
import type { LocationUpdate } from '../types'

interface Props {
  drivers: Driver[]
  liveLocations: Map<string, LocationUpdate>
  offlineDrivers: Set<string>
}

const DriverList = ({ drivers, liveLocations, offlineDrivers }: Props) => {
  return (
    <div className="driver-list">
      <div className="driver-list-header">
        <h2>Drivers</h2>
        <span className="driver-count">{drivers.length}</span>
      </div>
      <div className="driver-list-items">
        {drivers.map((driver) => {
          const live = liveLocations.get(driver._id)
          const isOffline = offlineDrivers.has(driver._id)

          return (
            <div key={driver._id} className="driver-item">
              <div className="driver-avatar">
                {driver.name.charAt(0).toUpperCase()}
              </div>
              <div className="driver-info">
                <p className="driver-name">{driver.name}</p>
                <p className="driver-vehicle">{driver.vehicleNumber}</p>
                {live && (
                  <p className="driver-updated">
                    {new Date(live.updatedAt).toLocaleTimeString()}
                  </p>
                )}
              </div>
              <div className={`driver-status ${isOffline ? 'offline' : driver.isActive ? 'active' : 'inactive'}`}>
                {isOffline ? 'Offline' : driver.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
          )
        })}
        {drivers.length === 0 && (
          <p className="no-drivers">No drivers registered yet</p>
        )}
      </div>
    </div>
  )
}

export default DriverList