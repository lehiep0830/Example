import { createConnection } from "typeorm";

// Seed the database with initial spaceship data
async function seed() {
  // Create database connection
  const connection = await createConnection({
    type: "postgres",
    host: "postgres", // Use the service name defined in docker-compose.yml
    port: 5432,
    username: "postgres",
    password: "test12345",
    database: "spaceryder",
    entities: [__dirname + "/**/*.entity{.ts,.js}"],
    synchronize: true,
  });

  // Sample spaceship data
  const spaceshipData = [
    {
      id: "SS-001",
      name: "Star Sprinter",
      currentLocation: "JFK",
      isAvailable: true,
      nextAvailableTime: new Date("2025-01-01T00:00:00Z"),
    },
    {
      id: "SS-002",
      name: "Galaxy Glider",
      currentLocation: "LAX",
      isAvailable: true,
      nextAvailableTime: new Date("2025-01-01T00:00:00Z"),
    },
    {
      id: "SS-003",
      name: "Cosmic Cruiser",
      currentLocation: "MIA",
      isAvailable: true,
      nextAvailableTime: new Date("2025-01-01T00:00:00Z"),
    },
  ];

  // Save spaceships to database
  const spaceshipRepository = connection.getRepository("Spaceship");
  await spaceshipRepository.save(spaceshipData);

  console.log("Database seeded successfully!");
  await connection.close();
}

// Run seeding and handle errors
seed().catch((error) => console.error("Seeding failed:", error));
