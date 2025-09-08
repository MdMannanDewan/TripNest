if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
console.log(process.env.CLOUD_NAME);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");

const sesssion = require("express-session");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const CustomError = require("./utils/CustomError");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/review");
const userRouter = require("./routes/user");

const User = require("./models/user");

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

const sessionOption = {
  secret: "MySecretOfSessions",
  resave: false, // Session is only saved if it was modified during the request.
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true, // prevents javaScript to access cookie
    // secure: true, // HTTPS only
    // sameSite: "lax", // Prevents CSRF/XSS attacks
  },
};

app.use(sesssion(sessionOption));
app.use(flash()); // flash must be used after using session or cookie-parser

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate())); // to authenticate User
passport.serializeUser(User.serializeUser()); // serialize users into the session(how user data is saved in session)
passport.deserializeUser(User.deserializeUser()); // deserialized users into the session

//

// Home Route
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

// app.get("/demouser", async (req, res) => {
//   const fakeUser = new User({
//     email: "mannandewan@gmail.com",
//     username: "mannan", // passport will check if the username is unique or not
//   });
//   const registeredUser = await User.register(fakeUser, "1234");
//   res.send(registeredUser);
// });

// flash message middleware
app.use((req, res, next) => {
  res.locals.successMsg = req.flash("success");
  res.locals.errorMsg = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

// Routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// Not found route
app.use((req, res, next) => {
  next(new CustomError(404, "Page Not Found!!!"));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  const { status = 500, message = "Something went Wrong!!" } = err;
  res.status(status).render("error", { status, message });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is listening on port: ${process.env.PORT}`);
});
