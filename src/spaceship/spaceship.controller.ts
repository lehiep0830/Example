import {
  Controller,
  Post,
  Body,
  Delete,
  Param,
  Get,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { SpaceshipService, TripStatus } from "./spaceship.service";

// REST controller for trip-related endpoints
@Controller("api/trip")
export class SpaceshipController {
  constructor(private readonly spaceshipService: SpaceshipService) {}

  // Endpoint to request a new trip
  @Post("request")
  async requestTrip(
    @Body("departureLocationCode") departureLocationCode: string,
    @Body("destinationLocationCode") destinationLocationCode: string,
    @Body("departureAt") departureAt: string
  ): Promise<TripStatus> {
    try {
      return await this.spaceshipService.requestTrip(
        departureLocationCode,
        destinationLocationCode,
        departureAt
      );
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Endpoint to cancel a trip
  @Delete(":tripId")
  async cancelTrip(
    @Param("tripId") tripId: string
  ): Promise<{ message: string }> {
    try {
      const message = await this.spaceshipService.cancelTrip(tripId);
      return { message };
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  // Endpoint to check trip status
  @Get(":tripId")
  async getTripStatus(@Param("tripId") tripId: string): Promise<TripStatus> {
    try {
      return await this.spaceshipService.getTripStatus(tripId);
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
