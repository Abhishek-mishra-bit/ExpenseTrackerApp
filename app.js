const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT || 3000;
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");

var compression = require("compression");

const userRoutes = require("./src/routes/user");
const expenseRoutes = require("./src/routes/expense");
const purchaseRoutes = require("./src/routes/purchase");
const premiumRoutes = require("./src/routes/premium");
const forgotPasswordRoutes = require("./src/routes/forgotPassword");

const connectDB = require("./src/util/database");

const User = require("./src/models/user");
const Expense = require("./src/models/expenseData"); 
const Order = require("./src/models/order");



// Built-in Express middleware for parsing JSON
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Enable compression middleware
app.use(compression());

app.use(express.static(path.join(__dirname, "src", "public")));
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));


// Add a route for user signup
app.use("/user", userRoutes);
app.use("/userexpense", expenseRoutes);
app.use("/purchase", purchaseRoutes);
app.use("/premium", premiumRoutes);
app.use("/forgot", forgotPasswordRoutes);

connectDB()
  .then((res) => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.log("Error connection to database:" + err));
