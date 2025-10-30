import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import embedding from './routes/embeddingRoutes.js';

dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:8080" }));
app.use(express.json());
app.use("/api", embedding);

(async () => {
  await connectDB();
  app.listen(3000, () => {
    console.log(`Server running on port ${3000}`);
  });
})();
