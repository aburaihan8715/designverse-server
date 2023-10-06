const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const getCollection = require("./libs/db");
const { ObjectId } = require("mongodb");
const stripe = require("stripe")(process.env.PAYMENT_SECRET_KEY);

/*===========================
middleware start
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

// verify admin middleware(note:call the verifyAdmin after verifyJWT)
const verifyAdmin = async (req, res, next) => {
  const email = req.decoded.email;
  const query = { email: email };
  const userCollection = await getCollection("users");
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
  const userCollection = await getCollection("users");
  const user = await userCollection.findOne(query);
  if (user?.role !== "instructor") {
    return res.status(403).send({ error: true, message: "forbidden message" });
  }
  next();
};
/*===========================
middleware end
=============================*/

/*====================
JWT related apis start
======================*/
app.post("/jwt", (req, res) => {
  const userEmail = req.body;
  const token = jwt.sign(userEmail, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });
  res.send({ token });
});

/*====================
JWT related apis end
======================*/

/*====================
users related apis start
======================*/
// create user
app.post("/users", async (req, res) => {
  const data = req.body;
  const query = { email: data.email };
  const userCollection = await getCollection("users");
  const isUserExist = await userCollection.findOne(query);
  if (isUserExist) {
    return res.send({ message: "user already exists!" });
  }
  const result = await userCollection.insertOne(data);
  res.send(result);
});

// get all user
app.get("/users", verifyJWT, verifyAdmin, async (req, res) => {
  const userCollection = await getCollection("users");
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
  const userCollection = await getCollection("users");
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
  const userCollection = await getCollection("users");
  const user = await userCollection.findOne(query);
  const result = { role: user?.role || "student" };
  res.send(result);
});

// delete user
app.delete("/users/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const userCollection = await getCollection("users");
  const result = await userCollection.deleteOne(query);
  res.send(result);
});

/*====================
users related apis end
======================*/

/*====================
cart  related apis start
======================*/
// create cart classes
app.post("/cart", async (req, res) => {
  const data = req.body;
  const query = { className: data.className };
  const cartCollection = await getCollection("cart");
  const isAlreadyAdded = await cartCollection.findOne(query);
  if (isAlreadyAdded) {
    return res.json({ alreadyAdded: true });
  }
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
  const cartCollection = await getCollection("cart");
  const result = await cartCollection.find(query).toArray();
  res.send(result);
});

// delete a cart class
app.delete("/cart/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const cartCollection = await getCollection("cart");
  const result = await cartCollection.deleteOne(query);
  res.send(result);
});

/*====================
cart  related apis end
======================*/

/*====================
classes related apis start
======================*/
// create class
app.post("/classes", async (req, res) => {
  const data = req.body;
  const classCollection = await getCollection("classes");
  const result = await classCollection.insertOne(data);
  res.send(result);
});

// get all or some class data based on email
app.get("/classes", async (req, res) => {
  let query = {};
  const email = req.query.email;
  const classCollection = await getCollection("classes");
  if (email) {
    query = { "user.userEmail": email };
    const result = await classCollection.find(query).toArray();
    return res.send(result);
  }
  const result = await classCollection.find(query).toArray();
  return res.send(result);
});

// get class data by id
// app.get("/classes/:id", async (req, res) => {
//   const id = req.params.id;
//   const query = { _id: new ObjectId(id) };
//   const classCollection = await getCollection("classes");
//   const result = await classCollection.findOne(query);
//   res.send(result);
// });

app.get("/classes/:email", async (req, res) => {
  const email = req.params.email;
  const query = { "user.userEmail": email };
  const classCollection = await getCollection("classes");
  const result = await classCollection.find(query).toArray();
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
  const classCollection = await getCollection("classes");
  const result = await classCollection.updateOne(query, updateDoc, options);
  res.send(result);
});

// get enrolled classes by email
// app.get("/enrolled", async (req, res) => {
//   const email = req.query.email;
//   const query = { email: email };
//   const paymentCollection = await getCollection("payments");
//   const result = await paymentCollection.find(query).toArray();
//   res.send(result);
// });

/*====================
classes related apis end
======================*/

/*====================
payments related apis start
 ======================*/
// create payments
app.post("/payments", verifyJWT, async (req, res) => {
  const data = req.body;
  // console.log(data);
  const paymentCollection = await getCollection("payments");
  const insertResult = await paymentCollection.insertOne(data);
  // console.log(insertResult);
  const query = { _id: { $in: data.selectedIClassesIds.map((id) => new ObjectId(id)) } };
  // console.log(query);
  const cartCollection = await getCollection("cart");
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
  const paymentCollection = await getCollection("payments");
  const result = await paymentCollection.find(query).toArray();
  res.send(result);
});

// create payment intent api
app.post("/create-payment-intent", verifyJWT, async (req, res) => {
  const { price } = req.body;
  const amount = parseInt(price * 100);

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

/*====================
payments related apis end
======================*/

module.exports = app;
// ===========end===========
