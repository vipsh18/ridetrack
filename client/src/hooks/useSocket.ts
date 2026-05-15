import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import type { LocationUpdate } from '../types'

export const useSocket = (token: string | null) => {
  const socketRef = useRef<Socket | null>(null)
  const [driverLocations, setDriverLocations] = useState<Map<string, LocationUpdate>>(new Map())
  const [offlineDrivers, setOfflineDrivers] = useState<Set<string>>(new Set())
  const [isLive, setIsLive] = useState(false)
  const watchIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (!token) return

    socketRef.current = io(import.meta.env.VITE_API_URL, {
      auth: { token }
    })

    socketRef.current.on('driver:update', (data: LocationUpdate) => {
      setDriverLocations((prev) => {
        const next = new Map(prev)
        next.set(data.driverId, data)
        return next
      })
      setOfflineDrivers((prev) => {
        const next = new Set(prev)
        next.delete(data.driverId)
        return next
      })
    })

    socketRef.current.on('driver:offline', ({ driverId }: { driverId: string }) => {
      setOfflineDrivers((prev) => new Set(prev).add(driverId))
    })

    return () => {
      stopLive()
      socketRef.current?.disconnect()
    }
  }, [token])

  const startLive = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        socketRef.current?.emit('driver:location', {
          lat: latitude,
          lng: longitude
        })
      },
      (error) => {
        console.error('Geolocation error:', error)
        alert('Could not get your location. Please allow location access.')
        setIsLive(false)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000
      }
    )

    setIsLive(true)
  }

  const stopLive = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setIsLive(false)
  }

  const toggleLive = () => {
    if (isLive) {
      stopLive()
    } else {
      startLive()
    }
  }

  return { driverLocations, offlineDrivers, socket: socketRef.current, isLive, toggleLive }
}