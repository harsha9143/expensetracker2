//core modules
const path = require("path");
const fs = require("fs");

//third party modules
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const compression = require("compression");
const morgan = require("morgan");

//local modules
const authRouter = require("./routes/authRouter");
const User = require("./models/user");
const db = require("./utils/databaseUtil");
const { authenticationToken } = require("./middleware/authenticateToken");
const Expense = require("./models/expense");
const expenseRouter = require("./routes/expenseRouter");
const PasswordReset = require("./models/passwordReset");
const Payments = require("./models/payment");
const paymentRouter = require("./routes/paymentRouter");
const Download = require("./models/download");

const app = express();

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

app.use(cors());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Payments);
Payments.belongsTo(User);

User.hasMany(Download);
Download.belongsTo(User);

app.use("/", (req, res, next) => {
  console.log("Middleware 1");
  next();
});

app.use("/auth", authRouter);
app.use("/expenses", expenseRouter);
app.use("/payments", paymentRouter);

app.get("/verify-token", authenticationToken, (req, res) => {
  res.json({ message: "Welcome to your profile", user: req.user });
});

app.use("/error", (req, res) => {
  res.status(404).send("Error!! something went wrong");
});

db.sync()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(
        `connection eshtablished successfully http://localhost:${process.env.PORT}/auth/login`
      );
    });
  })
  .catch((err) => {
    console.log("server connection failed", err.message);
  });
