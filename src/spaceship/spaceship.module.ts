import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SpaceshipService } from "./spaceship.service";
import { SpaceshipController } from "./spaceship.controller";
import { Spaceship } from "./entities/spaceship.entity";
import { Trip } from "./entities/trip.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Spaceship, Trip])],
  providers: [SpaceshipService],
  controllers: [SpaceshipController],
})
export class SpaceshipModule {}
