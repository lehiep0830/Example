import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Spaceship } from "./entities/spaceship.entity";
import { Trip } from "./entities/trip.entity";

// Interface for trip status response
export interface TripStatus {
  tripId: string;
  spaceshipId: string;
  departureLocationCode: string;
  destinationLocationCode: string;
  departureAt: string; // ISO-8601
  arrivalAt: string; // ISO-8601
  currentLocation?: string; // Current location or progress if en route
}

@Injectable()
export class SpaceshipService {
  // Predefined distances between airports in miles
  private DISTANCES: { [key: string]: { [key: string]: number } } = {
    JFK: { LAX: 2475, MIA: 1090 },
    LAX: { JFK: 2475, MIA: 2342 },
    MIA: { JFK: 1090, LAX: 2342 },
  };

  // Spaceship speed in miles per hour
  private SPEED_MPH = 1000;

  constructor(
    // Inject repositories for database operations
    @InjectRepository(Spaceship)
    private spaceshipRepository: Repository<Spaceship>,
    @InjectRepository(Trip)
    private tripRepository: Repository<Trip>
  ) {}

  // Calculate travel time in milliseconds based on distance
  private calculateTravelTime(distance: number): number {
    return (distance / this.SPEED_MPH) * 60 * 60 * 1000; // Convert hours to milliseconds
  }

  // Generate a unique trip ID
  private generateTripId(): string {
    return "TRIP-" + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  // Find the earliest available spaceship for the departure location
  private async findEarliestAvailableSpaceship(
    departureLocation: string,
    requestedTime: Date
  ): Promise<{ spaceship: Spaceship | null; earliestTime: Date }> {
    const spaceships = await this.spaceshipRepository.find();
    let earliestShip: Spaceship | null = null;
    let earliestTime = new Date("9999-12-31T23:59:59Z");

    for (const ship of spaceships) {
      if (
        ship.currentLocation === departureLocation &&
        ship.isAvailable &&
        ship.nextAvailableTime <= requestedTime
      ) {
        return { spaceship: ship, earliestTime: requestedTime };
      }
      if (ship.nextAvailableTime < earliestTime) {
        earliestShip = ship;
        earliestTime = ship.nextAvailableTime;
      }
    }
    return { spaceship: earliestShip, earliestTime };
  }

  // Request a new trip and assign a spaceship
  async requestTrip(
    departureLocationCode: string,
    destinationLocationCode: string,
    departureAt: string
  ): Promise<TripStatus> {
    // Validate airport codes
    if (
      !this.DISTANCES[departureLocationCode] ||
      !this.DISTANCES[departureLocationCode][destinationLocationCode]
    ) {
      throw new Error("Invalid airport codes");
    }

    // Parse and validate departure time
    const requestedTime = new Date(departureAt);
    if (isNaN(requestedTime.getTime())) {
      throw new Error("Invalid departure time");
    }

    // Find available spaceship or earliest availability
    const { spaceship, earliestTime } =
      await this.findEarliestAvailableSpaceship(
        departureLocationCode,
        requestedTime
      );
    if (!spaceship) {
      throw new Error(
        `No spaceships available, earliest time: ${earliestTime.toISOString()}`
      );
    }

    // Calculate travel duration and arrival time
    const distance =
      this.DISTANCES[departureLocationCode][destinationLocationCode];
    const travelTimeMs = this.calculateTravelTime(distance);
    const arrivalTime = new Date(earliestTime.getTime() + travelTimeMs);

    // Update spaceship status
    spaceship.isAvailable = false;
    spaceship.nextAvailableTime = arrivalTime;
    spaceship.currentLocation = destinationLocationCode;
    await this.spaceshipRepository.save(spaceship);

    // Create and save new trip
    const trip: Trip = {
      tripId: this.generateTripId(),
      spaceshipId: spaceship.id,
      departureLocationCode,
      destinationLocationCode,
      departureAt: earliestTime,
      arrivalAt: arrivalTime,
    };
    await this.tripRepository.save(trip);

    // Return trip status
    return {
      tripId: trip.tripId,
      spaceshipId: trip.spaceshipId,
      departureLocationCode: trip.departureLocationCode,
      destinationLocationCode: trip.destinationLocationCode,
      departureAt: trip.departureAt.toISOString(),
      arrivalAt: trip.arrivalAt.toISOString(),
    };
  }

  // Cancel a trip and update spaceship availability
  async cancelTrip(tripId: string): Promise<string> {
    // Find trip in database
    const trip = await this.tripRepository.findOne({ where: { tripId } });
    if (!trip) {
      throw new Error("Trip not found");
    }

    // Update spaceship if trip hasn’t started
    const spaceship = await this.spaceshipRepository.findOne({
      where: { id: trip.spaceshipId },
    });
    if (spaceship) {
      const now = new Date();
      if (now < trip.departureAt) {
        spaceship.isAvailable = true;
        spaceship.nextAvailableTime = now;
        await this.spaceshipRepository.save(spaceship);
      }
    }

    // Delete trip from database
    await this.tripRepository.delete({ tripId });
    return "Trip canceled successfully";
  }

  // Get the status of a trip
  async getTripStatus(tripId: string): Promise<TripStatus> {
    // Find trip in database
    const trip = await this.tripRepository.findOne({ where: { tripId } });
    if (!trip) {
      throw new Error("Trip not found");
    }

    // Determine current location or progress
    const now = new Date();
    let currentLocation = trip.departureLocationCode;
    if (now > trip.departureAt && now < trip.arrivalAt) {
      const totalTime = trip.arrivalAt.getTime() - trip.departureAt.getTime();
      const elapsedTime = now.getTime() - trip.departureAt.getTime();
      const progress = elapsedTime / totalTime;
      currentLocation = `En route: ${Math.round(progress * 100)}% to ${
        trip.destinationLocationCode
      }`;
    } else if (now >= trip.arrivalAt) {
      currentLocation = trip.destinationLocationCode;
    }

    // Return trip status
    return {
      tripId: trip.tripId,
      spaceshipId: trip.spaceshipId,
      departureLocationCode: trip.departureLocationCode,
      destinationLocationCode: trip.destinationLocationCode,
      departureAt: trip.departureAt.toISOString(),
      arrivalAt: trip.arrivalAt.toISOString(),
      currentLocation,
    };
  }
}
