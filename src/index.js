const app = require("./app");
require("dotenv").config();
// server port
const port = process.env.PORT || 5001;
// server listening
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
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

// =====end======
