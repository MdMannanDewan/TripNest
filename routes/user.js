const express = require("express");
const router = express.Router({ mergeParams: true });

const User = require("../models/user");
const { userSchema } = require("../schema");

const wrapAsync = require("../utils/wrapAsync");
const CustomError = require("../utils/CustomError");
const passport = require("passport");

const validateUser = (req, res, next) => {
  const { email } = req.body;
  let { error } = userSchema.validate({ email });
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new CustomError(400, errMsg);
  } else next();
};

// signUp route
router.get("/signup", (req, res) => {
  res.render("./users/signup");
});

// Create Route
// post method
router.post(
  "/signup",
  validateUser,
  wrapAsync(async (req, res) => {
    try {
      const { email, username, password } = req.body;
      const user = new User({
        email,
        username,
      });
      const registeredUser = await User.register(user, password);
      req.flash(
        "success",
        `Welcome ${registeredUser.username}!! please Log In`
      );
      res.redirect("/login");
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/signup");
    }
  })
);

// Login Route
router.get("/login", (req, res) => {
  res.render("./users/login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
    console.log(`i'm here`);
    res.send("Welcome to Trip Nest");
  }
);
module.exports = router;
