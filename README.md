# RideTrack

A real-time driver tracking dashboard built with React, Node.js, Socket.io, and MongoDB.

**Live Demo:** https://ridetrack-one.vercel.app

---

## Features

- Real-time driver location tracking via WebSockets
- Live map with active/offline driver status
- Trip management — create, start, complete, and cancel trips
- Click any trip to see pickup, dropoff, and driver route on the map
- JWT authentication with protected routes
- Rate limiting and input validation on all API endpoints

---

## Tech Stack

**Frontend**
- React + TypeScript (Vite)
- Socket.io client
- React Leaflet + OpenStreetMap
- Axios

**Backend**
- Node.js + Express + TypeScript
- Socket.io
- MongoDB + Mongoose
- JSON Web Tokens (JWT)
- bcryptjs
- express-rate-limit

**Infrastructure**
- MongoDB Atlas (database)
- Render (server)
- Vercel (client)

---

## Architecture

```
client (Vercel)          server (Render)         database (Atlas)
─────────────────        ───────────────         ────────────────
React Dashboard    ───►  Express REST API   ───► MongoDB
                   ◄───  JWT Auth

                   ◄───► Socket.io          ───► MongoDB
                         (real-time)              (location updates)
```

**How real-time tracking works:**
1. Driver connects to the server via Socket.io, authenticated with JWT
2. Driver emits `driver:location` events with lat/lng coordinates
3. Server broadcasts `driver:update` to all connected dashboard clients
4. Dashboard updates the map pin in real time without any page refresh
5. On disconnect, server marks driver as offline and broadcasts `driver:offline`

---

## Local Development

### Prerequisites
- Node.js v20+
- MongoDB (local or Atlas)
- Git

### Setup

**1. Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/ridetrack.git
cd ridetrack
```

**2. Install dependencies**
```bash
# server
cd server && npm install

# client
cd ../client && npm install
```

**3. Environment variables**

Create `server/.env`:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/ridetrack
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:3000
```

**4. Run both servers**
```bash
# from the root
npm run dev
```

Or separately:
```bash
# terminal 1
cd server && npm run dev

# terminal 2
cd client && npm run dev
```

**5. Open the app**

Navigate to `http://localhost:5173`

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new driver |
| POST | `/api/auth/login` | Login and receive JWT |

### Drivers
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/drivers` | Get all drivers | ✓ |
| GET | `/api/drivers/me` | Get current driver | ✓ |
| PATCH | `/api/drivers/location` | Update driver location | ✓ |
| GET | `/api/drivers/trips` | Get driver's trips | ✓ |

### Trips
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/trips` | Get all trips | ✓ |
| POST | `/api/trips` | Create a trip | ✓ |
| PATCH | `/api/trips/:id/status` | Update trip status | ✓ |

---

## Socket Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `driver:location` | Client → Server | `{ lat, lng }` | Driver sends location update |
| `driver:update` | Server → Client | `{ driverId, name, lat, lng }` | Broadcast location to dashboard |
| `driver:offline` | Server → Client | `{ driverId }` | Driver disconnected |

---

## Simulating a Driver

To test real-time tracking locally, run the location simulator:

```bash
# get a JWT token by logging in via Postman
# paste it in server/src/utils/simulateDriver.ts

cd server
npx ts-node --project tsconfig.json src/utils/simulateDriver.ts
```

The simulator emits a new location every 2 seconds, moving the driver pin live on the map.

---

## Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Database | MongoDB Atlas | — |
| Server | Render | https://ridetrack-server.onrender.com |
| Client | Vercel | https://ridetrack-one.vercel.app |