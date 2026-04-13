import 'dotenv/config';
import app from './app';
import { AppDataSource } from "./configs/data-sourse";

const PORT = process.env.PORT || 3000;

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Data Source has been initialized!");
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Error during Data Source initialization", err);
    process.exit(1); // Exit if DB fails
  }
};

startServer();
