import connectDB from "./Db/index.js";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

connectDB();