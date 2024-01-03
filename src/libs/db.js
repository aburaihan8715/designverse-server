import mongoose from "mongoose";
import { mongoDbUri } from "../variables/secret.js";

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

/*
const { MongoClient, ServerApiVersion } = require("mongodb");
import 'dotenv/config'

// connection string
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster1.eujox13.mongodb.net/fashionVerseDB?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(
  uri,
  { useUnifiedTopology: true },
  {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  }
);

async function getCollection(collectionName) {
  try {
    const collection = client.db().collection(collectionName);
    return collection;
  } catch (error) {
    console.log(error.message);
  } finally {
    // await client.close();
  }
}

module.exports = getCollection;
*/
