import * as dotenv from 'dotenv'
import mongoose from "mongoose";


dotenv.config()
export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      dbName: "rag_db",
    });
    console.log("✅ MongoDB Connected Successfully to 'rag_db'");
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
};
export default connectDB;