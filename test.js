// const express = require("express");
// const router = express.Router();
// const MongoClient = require("mongodb").MongoClient;

// const mongoURI = "mongodb://your-mongodb-uri";
// const dbName = "your-database-name";

// router.post("/update", async (req, res) => {
//   const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

//   try {
//     await client.connect();

//     const db = client.db(dbName);
//     const classesCollection = db.collection("classes");

//     const { idsToUpdate } = req.body; // Assuming you have an array of IDs to update

//     const updatePromises = idsToUpdate.map(async (id) => {
//       const classToUpdate = await classesCollection.findOne({ _id: id });

//       if (classToUpdate) {
//         // Update studentEnrolled and seats fields
//         if (classToUpdate.studentEnrolled !== null && classToUpdate.studentEnrolled !== undefined) {
//           classToUpdate.studentEnrolled += 1;
//         }

//         if (classToUpdate.seats > 0) {
//           classToUpdate.seats -= 1;
//         }

//         // Update the document in the collection
//         await classesCollection.updateOne({ _id: id }, { $set: classToUpdate });
//       }
//     });

//     await Promise.all(updatePromises);

//     res.json({ message: "Documents updated successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while updating documents" });
//   } finally {
//     client.close();
//   }
// });

// module.exports = router;

const x = [];

if (x) {
  console.log("x has value");
} else {
  console.log("x has no value");
}
