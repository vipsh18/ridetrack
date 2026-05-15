import { useState } from 'react'
import { createTrip, updateTripStatus } from '../services/tripService'
import type { Trip } from '../types'

interface Props {
  trips: Trip[]
  selectedTripId?: string
  onTripCreated: (trip: Trip) => void
  onTripUpdated: (trip: Trip) => void
  onTripSelect: (trip: Trip) => void
}

const statusColors: Record<Trip['status'], string> = {
  pending: '#f59e0b',
  active: '#22c55e',
  completed: '#3b82f6',
  cancelled: '#ef4444'
}

const nextStatus: Partial<Record<Trip['status'], Trip['status']>> = {
  pending: 'active',
  active: 'completed'
}

const nextLabel: Partial<Record<Trip['status'], string>> = {
  pending: 'Start',
  active: 'Complete'
}

const TripPanel = ({ trips, selectedTripId, onTripCreated, onTripUpdated, onTripSelect }: Props) => {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    passengerName: '',
    pickupAddress: '',
    pickupLat: '',
    pickupLng: '',
    dropoffAddress: '',
    dropoffLat: '',
    dropoffLng: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const trip = await createTrip({
        passengerName: form.passengerName,
        pickup: {
          address: form.pickupAddress,
          lat: parseFloat(form.pickupLat),
          lng: parseFloat(form.pickupLng)
        },
        dropoff: {
          address: form.dropoffAddress,
          lat: parseFloat(form.dropoffLat),
          lng: parseFloat(form.dropoffLng)
        }
      })
      onTripCreated(trip)
      setShowForm(false)
      setForm({
        passengerName: '',
        pickupAddress: '',
        pickupLat: '',
        pickupLng: '',
        dropoffAddress: '',
        dropoffLat: '',
        dropoffLng: ''
      })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create trip')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (e: React.MouseEvent, trip: Trip) => {
    e.stopPropagation()
    const next = nextStatus[trip.status]
    if (!next) return
    try {
      const updated = await updateTripStatus(trip._id, next)
      onTripUpdated(updated)
    } catch (err) {
      console.error('Status update failed', err)
    }
  }

  const handleCancel = async (e: React.MouseEvent, trip: Trip) => {
    e.stopPropagation()
    try {
      const updated = await updateTripStatus(trip._id, 'cancelled')
      onTripUpdated(updated)
    } catch (err) {
      console.error('Cancel failed', err)
    }
  }

  return (
    <div className="trip-panel">
      <div className="trip-panel-header">
        <h2>Trips</h2>
        <button
          className="new-trip-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ New'}
        </button>
      </div>

      {showForm && (
        <form className="trip-form" onSubmit={handleCreate}>
          <input
            name="passengerName"
            placeholder="Passenger name"
            value={form.passengerName}
            onChange={handleChange}
            required
          />
          <p className="trip-form-section">Pickup</p>
          <input
            name="pickupAddress"
            placeholder="Address"
            value={form.pickupAddress}
            onChange={handleChange}
            required
          />
          <div className="trip-form-row">
            <input
              name="pickupLat"
              placeholder="Lat"
              value={form.pickupLat}
              onChange={handleChange}
              required
            />
            <input
              name="pickupLng"
              placeholder="Lng"
              value={form.pickupLng}
              onChange={handleChange}
              required
            />
          </div>
          <p className="trip-form-section">Dropoff</p>
          <input
            name="dropoffAddress"
            placeholder="Address"
            value={form.dropoffAddress}
            onChange={handleChange}
            required
          />
          <div className="trip-form-row">
            <input
              name="dropoffLat"
              placeholder="Lat"
              value={form.dropoffLat}
              onChange={handleChange}
              required
            />
            <input
              name="dropoffLng"
              placeholder="Lng"
              value={form.dropoffLng}
              onChange={handleChange}
              required
            />
          </div>
          {error && <p className="trip-form-error">{error}</p>}
          <button type="submit" className="trip-submit-btn" disabled={loading}>
            {loading ? 'Creating...' : 'Create trip'}
          </button>
        </form>
      )}

      <div className="trip-list">
        {trips.length === 0 && (
          <p className="no-trips">No trips yet</p>
        )}
        {trips.map((trip) => (
          <div
            key={trip._id}
            className={`trip-item ${selectedTripId === trip._id ? 'selected' : ''}`}
            onClick={() => onTripSelect(trip)}
          >
            <div className="trip-item-header">
              <span className="trip-passenger">{trip.passengerName}</span>
              <span
                className="trip-status-badge"
                style={{ color: statusColors[trip.status] }}
              >
                {trip.status}
              </span>
            </div>
            <p className="trip-route">
              {trip.pickup.address} → {trip.dropoff.address}
            </p>
            <p className="trip-driver">
              {typeof trip.driver === 'object' ? trip.driver.name : 'Unknown driver'}
            </p>
            {(trip.status === 'pending' || trip.status === 'active') && (
              <div className="trip-actions">
                <button
                  className="trip-action-btn primary"
                  onClick={(e) => handleStatusUpdate(e, trip)}
                >
                  {nextLabel[trip.status]}
                </button>
                <button
                  className="trip-action-btn danger"
                  onClick={(e) => handleCancel(e, trip)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default TripPanel