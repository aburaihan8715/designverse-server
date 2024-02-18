import { app } from "./app.js";
import { connectDb } from "./src/libs/db.js";
import { serverPort } from "./src/libs/secret.js";

// server listening
app.listen(serverPort, () => {
  console.log(`Server is running at http://localhost:${serverPort}`);
  connectDb();
});
