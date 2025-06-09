// src/spaceship/entities/trip.entity.ts
import { Entity, Column, PrimaryColumn } from "typeorm";

// Entity representing a trip in the database
@Entity()
export class Trip {
  @PrimaryColumn()
  tripId!: string; // Unique identifier for the trip, assigned by TypeORM

  @Column()
  spaceshipId!: string; // ID of the assigned spaceship, assigned by TypeORM

  @Column()
  departureLocationCode!: string; // Departure airport code (e.g., "JFK"), assigned by TypeORM

  @Column()
  destinationLocationCode!: string; // Destination airport code (e.g., "LAX"), assigned by TypeORM

  @Column()
  departureAt!: Date; // Departure time in UTC, assigned by TypeORM

  @Column()
  arrivalAt!: Date; // Arrival time in UTC, assigned by TypeORM
}
