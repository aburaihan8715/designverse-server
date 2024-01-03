import express from "express";
import morgan from "morgan";

const app = express();

// middleware
app.use(morgan("dev"));

// home route
app.get("/", async (req, res) => {
  res.json({ message: "Hello from home route!" });
});

export { app };

/*
const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const getCollection = require("./db");
const { ObjectId } = require("mongodb");
const stripe = require("stripe")(process.env.PAYMENT_SECRET_KEY);


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



app.post("/jwt", (req, res) => {
  const userEmail = req.body;
  const token = jwt.sign(userEmail, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });
  res.send({ token });
});




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
app.patch("/users/role/:id", verifyJWT, verifyAdmin, async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  const query = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: {
      role: data.role,
    },
  };
  const userCollection = await getCollection("users");
  const result = await userCollection.updateOne(query, updateDoc);
  res.send(result);
});

// get role
app.get("/users/role/:email", verifyJWT, async (req, res) => {
  const email = req.params.email;
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
app.delete("/users/:id", verifyJWT, verifyAdmin, async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const userCollection = await getCollection("users");
  const result = await userCollection.deleteOne(query);
  res.send(result);
});

// update name and image field
app.put("/users/:email", verifyJWT, async (req, res) => {
  const email = req.params.email;
  const data = req.body;
  const query = { email: email };
  const updateDoc = {
    $set: {
      name: data.name,
      image: data.imgURL,
    },
  };
  const userCollection = await getCollection("users");
  const result = await userCollection.updateOne(query, updateDoc);
  res.send(result);
});




// create cart
app.post("/cart", verifyJWT, async (req, res) => {
  const addToCartData = req.body;
  const query = { $and: [{ selectedClassId: { $eq: addToCartData.selectedClassId } }, { instructorEmail: { $eq: addToCartData.instructorEmail } }] };
  const cartCollection = await getCollection("cart");
  const isAlreadyAdded = await cartCollection.findOne(query);
  if (isAlreadyAdded) {
    return res.json({ alreadyAdded: true });
  }
  const result = await cartCollection.insertOne(addToCartData);
  res.send(result);
});

// get all cart
app.get("/cart", verifyJWT, async (req, res) => {
  const userEmail = req.query.email;
  if (!userEmail) {
    res.send([]);
  }
  const decodedEmail = req.decoded.email;
  if (userEmail !== decodedEmail) {
    return res.status(403).send({ error: true, message: "forbidden access!" });
  }
  const query = { userEmail: userEmail };
  const cartCollection = await getCollection("cart");
  const result = await cartCollection.find(query).toArray();
  res.send(result);
});

// delete a cart
app.delete("/cart/:id", verifyJWT, async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const cartCollection = await getCollection("cart");
  const result = await cartCollection.deleteOne(query);
  res.send(result);
});




// create class
app.post("/classes", verifyJWT, verifyInstructor, async (req, res) => {
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
    query = { instructorEmail: email };
    const result = await classCollection.find(query).toArray();
    return res.send(result);
  }
  const result = await classCollection.find(query).toArray();
  return res.send(result);
});

// get class by id
app.get("/classes/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const classCollection = await getCollection("classes");
  const result = await classCollection.findOne(query);
  res.send(result);
});

// patch field by id
app.patch("/classes/:id", verifyJWT, verifyAdmin, async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  const query = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: {
      status: data.status,
    },
  };
  const classCollection = await getCollection("classes");
  const result = await classCollection.updateOne(query, updateDoc);
  res.send(result);
});

// patch feedback by id
app.patch("/classes/feedback/:id", verifyJWT, verifyAdmin, async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  const query = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: {
      adminFeedback: data.feedback,
    },
  };
  const classCollection = await getCollection("classes");
  const result = await classCollection.updateOne(query, updateDoc);
  res.send(result);
});

// patch review by id
app.patch("/classes/review/:id", verifyJWT, async (req, res) => {
  const id = req.params.id;
  const { newRating } = req.body;
  const query = { _id: new ObjectId(id) };
  const updateDoc = {
    $push: { rating: newRating },
  };
  const classCollection = await getCollection("classes");
  const result = await classCollection.updateOne(query, updateDoc);
  res.send(result);
});

// patch name and image
app.patch("/classes", verifyJWT, verifyInstructor, async (req, res) => {
  const email = req.query.email;
  const data = req.body;
  const query = { instructorEmail: email };
  const updateDoc = {
    $set: {
      instructorName: data.name,
      instructorImage: data.imgURL,
    },
  };
  const classCollection = await getCollection("classes");
  const result = await classCollection.updateMany(query, updateDoc);
  res.send(result);
});

// update class data
app.put("/classes/:id", verifyJWT, verifyInstructor, async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  const query = { _id: new ObjectId(id) };
  const options = { upsert: true };
  const updateDoc = {
    $set: data,
  };
  const classCollection = await getCollection("classes");
  const result = await classCollection.updateOne(query, updateDoc, options);
  res.send(result);
});

// delete class by id
app.delete("/classes/:id", verifyJWT, verifyInstructor, async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const classCollection = await getCollection("classes");
  const result = await classCollection.deleteOne(query);
  res.send(result);
});



// create payments
app.post("/payments", verifyJWT, async (req, res) => {
  const data = req.body;
  const selectedIClassesIds = data.selectedIClassesIds;
  const paymentCollection = await getCollection("payments");
  const insertResult = await paymentCollection.insertOne(data);
  const query = { selectedClassId: { $in: data.selectedIClassesIds.map((id) => id) } };

  // update cart collection
  const cartCollection = await getCollection("cart");
  const deleteResult = await cartCollection.deleteMany(query);

  // update enrolled student and seats
  const classCollection = await getCollection("classes");
  const updatePromises = selectedIClassesIds.map(async (selectedIClassesId) => {
    const classToUpdate = await classCollection.findOne({ classId: selectedIClassesId });

    if (classToUpdate) {
      // Update studentEnrolled and seats fields
      if (!classToUpdate.studentEnrolled) {
        classToUpdate.studentEnrolled = 1;
      } else {
        classToUpdate.studentEnrolled += 1;
      }

      // update seats
      if (classToUpdate.seats > 0) {
        classToUpdate.seats -= 1;
      }

      // Update the class collection
      await classCollection.updateOne({ classId: selectedIClassesId }, { $set: classToUpdate });
    }
  });
  await Promise.all(updatePromises);
  res.send({ insertResult, deleteResult });
});

// get payments data by email
app.get("/payments", verifyJWT, async (req, res) => {
  let query = {};
  const userEmail = req.query.email;
  const paymentCollection = await getCollection("payments");
  if (userEmail) {
    query = { userEmail: userEmail };
    const result = await paymentCollection.find(query).toArray();
    return res.send(result);
  }
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


app.post("/testimonials", verifyJWT, async (req, res) => {
  const data = req.body;
  const testimonialCollection = await getCollection("testimonials");
  const result = await testimonialCollection.insertOne(data);
  res.send(result);
});

app.get("/testimonials", async (req, res) => {
  const testimonialCollection = await getCollection("testimonials");
  const result = await testimonialCollection.find({}).toArray();
  res.send(result);
});

module.exports = app;
// ===========end===========
*/
