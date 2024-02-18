import mongoose from "mongoose";
import { mongoDbUri } from "./secret.js";

const connectDb = async (options = {}) => {
  try {
    await mongoose.connect(mongoDbUri, options);
    console.log("Db is connected!");
    mongoose.connection.on("error", (error) => {
      console.log("Db connection error", error);
    });
  } catch (error) {
    console.log("Db connection failed", error);
    process.exit(1);
  }
};

export { connectDb };
