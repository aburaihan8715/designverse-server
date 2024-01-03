import { app } from "./src/libs/app.js";
import { connectDb } from "./src/libs/db.js";
import { serverPort } from "./src/variables/secret.js";

// server listening
app.listen(serverPort, () => {
  console.log(`Server is running at http://localhost:${serverPort}`);
  connectDb();
});
