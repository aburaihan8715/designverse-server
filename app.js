const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const stripe = require("stripe")(process.env.PAYMENT_SECRET_KEY);

/*===========================
middleware
=============================*/
app.use(cors());
app.use(express.json());
// middleware function for verifying token
const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ error: true, message: "unauthorized access!" });
  }
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).send({ error: true, message: "forbidden access!" });
    }
    req.decoded = decoded;
    next();
  });
};

// connection string
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster1.eujox13.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
// database connection function
async function run() {
  try {
    const classCollection = client.db("fashionVerseDB").collection("classes");
    const cartCollection = client.db("fashionVerseDB").collection("cart");
    const userCollection = client.db("fashionVerseDB").collection("users");
    const paymentCollection = client.db("fashionVerseDB").collection("payments");

    // verify admin middleware(note:call the verifyAdmin after verifyJWT)
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      if (user?.role !== "admin") {
        return res.status(403).send({ error: true, message: "forbidden message" });
      }
      next();
    };

    // verify instructor middleware(note:call the verifyInstructor after verifyJWT)
    const verifyInstructor = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      if (user?.role !== "instructor") {
        return res.status(403).send({ error: true, message: "forbidden message" });
      }
      next();
    };
    /*====================
    JWT related apis
    ======================*/
    app.post("/jwt", (req, res) => {
      const userEmail = req.body;
      const token = jwt.sign(userEmail, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });
      res.send({ token });
    });

    /*====================
    users related apis
    ======================*/
    // create user
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
    app.get("/users", verifyJWT, verifyAdmin, async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    // make role
    app.patch("/users/role/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          role: data.role,
        },
      };
      const result = await userCollection.updateOne(query, updateDoc, options);
      res.send(result);
    });

    // get role
    app.get("/users/role/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      // console.log(email);
      if (req.decoded.email !== email) {
        return res.status(403).send({ error: true, message: "forbidden access!" });
      }
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const result = { role: user?.role || "student" };
      res.send(result);
      // console.log(result);
    });

    // delete user
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    /*====================
    cart  related apis
    ======================*/
    // create cart classes
    app.post("/cart", async (req, res) => {
      const data = req.body;
      const result = await cartCollection.insertOne(data);
      res.send(result);
    });

    // get all cart classes
    app.get("/cart", verifyJWT, async (req, res) => {
      const userEmail = req.query.email;
      if (!userEmail) {
        res.send([]);
      }
      const decodedEmail = req.decoded.email;
      if (userEmail !== decodedEmail) {
        return res.status(403).send({ error: true, message: "forbidden access!" });
      }
      const query = { email: userEmail };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });

    // delete a cart class
    app.delete("/cart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    });

    /*====================
    classes related apis
    ======================*/
    // create class
    app.post("/classes", async (req, res) => {
      const data = req.body;
      const result = await classCollection.insertOne(data);
      res.send(result);
    });

    // get all or some class data based on email
    app.get("/classes", async (req, res) => {
      let query = {};
      const email = req.query.email;
      if (email) {
        query = { "user.email": email };
        const result = await classCollection.find(query).toArray();
        return res.send(result);
      }
      const result = await classCollection.find(query).toArray();
      return res.send(result);
    });

    // get class data by id
    app.get("/classes/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await classCollection.findOne(query);
      res.send(result);
    });

    // update single field class data
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

    /*====================
    payments related apis
    ======================*/
    // create payments
    app.post("/payments", verifyJWT, async (req, res) => {
      const data = req.body;
      const insertResult = await paymentCollection.insertOne(data);
      const query = { _id: { $in: data.selectedIClassesIds.map((id) => new ObjectId(id)) } };
      const deleteResult = await cartCollection.deleteMany(query);

      res.send({ insertResult, deleteResult });
    });

    // get payments data by using email
    app.get("/payments", verifyJWT, async (req, res) => {
      const userEmail = req.query.email;
      if (!userEmail) {
        res.send([]);
      }
      const decodedEmail = req.decoded.email;
      if (userEmail !== decodedEmail) {
        return res.status(403).send({ error: true, message: "forbidden access!" });
      }
      const query = { email: userEmail };
      const result = await paymentCollection.find(query).toArray();
      res.send(result);
    });

    // create payment intent api
    app.post("/create-payment-intent", verifyJWT, async (req, res) => {
      const { price } = req.body;
      const amount = price * 100;

      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
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
