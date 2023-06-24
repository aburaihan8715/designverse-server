const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");

// middleware
app.use(cors());
app.use(express.json());

// connection string

// database connection function
const run = async () => {
  try {
    /*===================================
    toys api
    ====================================*/
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close()
  }
};
// call the database connection function
run().catch((err) => {
  console.log(err.message);
});

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
