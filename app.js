const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
app.use(cors());
app.use(express.json());

// connection string

// database connection function

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster1.eujox13.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const classCollection = client.db("fashionVerseDB").collection("classes");
    const selectedClassCollection = client.db("fashionVerseDB").collection("selectedClasses");
    const userCollection = client.db("fashionVerseDB").collection("users");

    /*====================
    users related apis
    ======================*/
    // post user
    app.post("/users", async (req, res) => {
      const data = req.body;
      const query = { email: data.email };
      const isUserExist = await userCollection.findOne(query);
      if (isUserExist) {
        return res.send({ message: "user already exists!" });
      }
      const result = await userCollection.insertOne(data);
      res.send(result);
    });

    // get all user
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    // make admin
    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(query, updatedDoc);
      res.send(result);
    });

    // make instructor
    app.patch("/users/instructor/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: "instructor",
        },
      };
      const result = await userCollection.updateOne(query, updatedDoc);
      res.send(result);
    });

    // delete user
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    /*====================
    selected classes related apis
    ======================*/
    // post selected classes
    app.post("/selectedClasses", async (req, res) => {
      const data = req.body;
      const result = await selectedClassCollection.insertOne(data);
      res.send(result);
    });

    // get all selected classes
    app.get("/selectedClasses", async (req, res) => {
      const result = await selectedClassCollection.find().toArray();
      res.send(result);
    });
    // delete a selected class
    app.delete("/selectedClasses/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await selectedClassCollection.deleteOne(query);
      res.send(result);
    });

    /*====================
    classes related apis
    ======================*/
    // get all classes data
    app.get("/classes", async (req, res) => {
      const result = await classCollection.find().toArray();
      res.send(result);
    });

    // update single field
    app.patch("/classes/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: data.status,
        },
      };
      const result = await classCollection.updateOne(query, updateDoc, options);
      res.send(result);
    });

    console.log("database connected");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// home route
app.get("/", async (req, res) => {
  res.json({ message: "Hello from home route!" });
});

// route not found error
app.use((req, res, next) => {
  res.json({ message: "Ops route not found!" });
});
// server error
app.use((err, req, res, next) => {
  res.json({ message: "Ops something went wrong!" });
});

module.exports = app;
// ===========end=============
