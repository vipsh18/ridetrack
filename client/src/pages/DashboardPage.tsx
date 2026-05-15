import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchAllDrivers } from '../services/driverService'
import { fetchAllTrips } from '../services/tripService'
import { useSocket } from '../hooks/useSocket'
import DriverMap from '../components/DriverMap'
import DriverList from '../components/DriverList'
import TripPanel from '../components/TripPanel'
import type { Driver, Trip } from '../types'
import './DashboardPage.css'

type Tab = 'drivers' | 'trips'

const DashboardPage = () => {
  const { driver, token, logout } = useAuth()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [mapReady, setMapReady] = useState(false)
  const [tab, setTab] = useState<Tab>('drivers')
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const { driverLocations, offlineDrivers } = useSocket(token)

  useEffect(() => {
    Promise.all([fetchAllDrivers(), fetchAllTrips()])
      .then(([d, t]) => {
        setDrivers(d)
        setTrips(t)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!loading) {
      setTimeout(() => setMapReady(true), 50)
    }
  }, [loading])

  const activeCount = drivers.filter(
    (d) => driverLocations.has(d._id) && !offlineDrivers.has(d._id)
  ).length

  const handleTripCreated = (trip: Trip) => {
    setTrips((prev) => [trip, ...prev])
  }

  const handleTripUpdated = (updated: Trip) => {
    setTrips((prev) => prev.map((t) => (t._id === updated._id ? updated : t)))
    if (selectedTrip?._id === updated._id) {
      setSelectedTrip(updated)
    }
  }

  const handleTripSelect = (trip: Trip) => {
    setSelectedTrip((prev) => (prev?._id === trip._id ? null : trip))
    setTab('trips')
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <div className="dashboard-logo">RT</div>
          <span>RideTrack</span>
        </div>
        <div className="dashboard-stats">
          <div className="stat">
            <span className="stat-value">{drivers.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat">
            <span className="stat-value active">{activeCount}</span>
            <span className="stat-label">Live</span>
          </div>
          <div className="stat">
            <span className="stat-value">{trips.length}</span>
            <span className="stat-label">Trips</span>
          </div>
        </div>
        <div className="dashboard-user">
          <span>{driver?.name}</span>
          <button onClick={logout} className="logout-btn">Sign out</button>
        </div>
      </header>

      <div className="dashboard-body">
        {loading ? (
          <div className="dashboard-loading">Loading...</div>
        ) : (
          <>
            <aside className="dashboard-sidebar">
              <div className="sidebar-tabs">
                <button
                  className={`sidebar-tab ${tab === 'drivers' ? 'active' : ''}`}
                  onClick={() => setTab('drivers')}
                >
                  Drivers
                </button>
                <button
                  className={`sidebar-tab ${tab === 'trips' ? 'active' : ''}`}
                  onClick={() => setTab('trips')}
                >
                  Trips
                </button>
              </div>
              {tab === 'drivers' ? (
                <DriverList
                  drivers={drivers}
                  liveLocations={driverLocations}
                  offlineDrivers={offlineDrivers}
                />
              ) : (
                <TripPanel
                  trips={trips}
                  selectedTripId={selectedTrip?._id}
                  onTripCreated={handleTripCreated}
                  onTripUpdated={handleTripUpdated}
                  onTripSelect={handleTripSelect}
                />
              )}
            </aside>
            <main className="dashboard-map">
              {mapReady && (
                <DriverMap
                  drivers={drivers}
                  liveLocations={driverLocations}
                  offlineDrivers={offlineDrivers}
                  selectedTrip={selectedTrip}
                />
              )}
            </main>
          </>
        )}
      </div>
    </div>
  )
}

export default DashboardPage