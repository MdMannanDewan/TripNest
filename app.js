const express = require("express");
const app = express();
const PORT = 8080;
const mongoose = require("mongoose");
const path = require("path");

const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const CustomError = require("./utils/CustomError");

const listings = require("./routes/listing");
const reviews = require("./routes/review");

// MongoDB connection
const MONGO_URL = "mongodb://127.0.0.1:27017/TripNest";
main()
  .then(() => console.log(`Connected Successfully`))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

// setting views path
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// express middlewares
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// Home Route
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

// Routes
app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);

// Not found route
app.use((req, res, next) => {
  next(new CustomError(404, "Page Not Found!!!"));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  const { status = 500, message = "Something went Wrong!!" } = err;
  res.status(status).render("error", { status, message });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
