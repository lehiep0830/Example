# SpaceRyder Booking System

## Setup and Run Instructions

1. Ensure Node.js (v16 or later), npm, and PostgreSQL are installed.
2. Create a PostgreSQL database named `spaceryder`.
3. Update `src/app.module.ts` with your Postgres credentials (host, port, username, password).
4. Clone this project and navigate to the project directory.
5. Run docker-compose : `sudo docker compose up`
6. The server will run on `http://localhost:3000`.
7. Setup seed : `docker exec -i spaceryder-booking1-app npm run seed`.
8. Check API TEST CURL

## API Usage

- **Request Trip**
  - Endpoint: `POST /api/trip/request`
  - Body: `{ "departureLocationCode": "JFK", "destinationLocationCode": "LAX", "departureAt": "2025-01-01T12:00:00Z" }`
  - Response: TripStatus object or 400 error with earliest available time
- **Cancel Trip**
  - Endpoint: `DELETE /api/trip/:tripId`
  - Response: Success message or 404 if trip not found
- **Check Status**
  - Endpoint: `GET /api/trip/:tripId`
  - Response: TripStatus object with current location or 404 if trip not found
- Supported airport codes: JFK, LAX, MIA

## API TEST

# Test SpaceRyder API Endpoints

# Ensure the NestJS app is running (e.g., via docker-compose at http://localhost:3000)

# 1. Test Request Trip - Book a trip from JFK to LAX

# Expected: 200 OK with TripStatus object if a spaceship is available

curl -X POST http://localhost:3000/api/trip/request \
 -H "Content-Type: application/json" \
 -d '{"departureLocationCode": "JFK", "destinationLocationCode": "LAX", "departureAt": "2025-01-01T12:00:00Z"}'

# 2. Test Request Trip - Invalid airport codes

# Expected: 400 Bad Request with error message for invalid codes

curl -X POST http://localhost:3000/api/trip/request \
 -H "Content-Type: application/json" \
 -d '{"departureLocationCode": "XYZ", "destinationLocationCode": "ABC", "departureAt": "2025-01-01T12:00:00Z"}'

# 3. Test Request Trip - Invalid departure time

# Expected: 400 Bad Request with error message for invalid time

curl -X POST http://localhost:3000/api/trip/request \
 -H "Content-Type: application/json" \
 -d '{"departureLocationCode": "JFK", "destinationLocationCode": "LAX", "departureAt": "invalid-time"}'

# 4. Test Get Trip Status - Check status of a trip

# Replace <TRIP_ID> with a tripId from a successful booking (e.g., from Test 1)

# Expected: 200 OK with TripStatus object, including currentLocation

curl -X GET http://localhost:3000/api/trip/<TRIP_ID>

# 5. Test Get Trip Status - Non-existent trip

# Expected: 404 Not Found with error message

curl -X GET http://localhost:3000/api/trip/NONEXISTENT-TRIP

# 6. Test Cancel Trip - Cancel a booked trip

# Replace <TRIP_ID> with a tripId from a successful booking (e.g., from Test 1)

# Expected: 200 OK with success message

curl -X DELETE http://localhost:3000/api/trip/<TRIP_ID>

# 7. Test Cancel Trip - Non-existent trip

# Expected: 404 Not Found with error message

curl -X DELETE http://localhost:3000/api/trip/NONEXISTENT-TRIP

# 8. Test Request Trip - No available spaceships

# Book multiple trips to occupy all spaceships (e.g., repeat Test 1 for JFK->LAX, LAX->MIA, MIA->JFK)

# Then try booking another trip

# Expected: 400 Bad Request with error and earliest available time

curl -X POST http://localhost:3000/api/trip/request \
 -H "Content-Type: application/json" \
 -d '{"departureLocationCode": "JFK", "destinationLocationCode": "LAX", "departureAt": "2025-01-01T12:00:00Z"}'
