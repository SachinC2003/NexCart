import { DataSource } from "typeorm";
import "reflect-metadata"
import path from "path";

const databasePath = path.resolve(__dirname, "../../database.sqlite");
const entitiesPath = path.resolve(__dirname, "../entities/*.{ts,js}");
const migrationsPath = path.resolve(__dirname, "../migrations/*.{ts,js}");

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: databasePath,
  synchronize: false,           // Auto-creates tables based on your entities (dev only)
  migrationsRun: true,
  logging: false,
  entities: [entitiesPath],
  subscribers: [],
  migrations: [migrationsPath],
});
