const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = require("./app");

const PORT = Number(process.env.PORT || 5000);

app.listen(PORT, () => {
  console.log(`Marketplace API running on port ${PORT}`);
});
