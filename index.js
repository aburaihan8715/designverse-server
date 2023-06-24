const app = require("./app");
require("dotenv").config();
// server port
const port = process.env.PORT || 5001;
// server listening
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
// =====end======
