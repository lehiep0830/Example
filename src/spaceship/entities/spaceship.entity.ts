import { Entity, Column, PrimaryColumn } from "typeorm";

// Entity representing a spaceship in the database
@Entity()
export class Spaceship {
  @PrimaryColumn()
  id!: string; // Unique identifier for the spaceship, assigned by TypeORM

  @Column()
  name!: string; // Name of the spaceship (e.g., "Star Sprinter"), assigned by TypeORM

  @Column()
  currentLocation!: string; // Current airport code (e.g., "JFK"), assigned by TypeORM

  @Column()
  isAvailable!: boolean; // Availability status of the spaceship, assigned by TypeORM

  @Column()
  nextAvailableTime!: Date; // Time when the spaceship is next available, assigned by TypeORM
}
