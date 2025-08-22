const express = require("express");
const router = express.Router({ mergeParams: true });

const User = require("../models/user");

const wrapAsync = require("../utils/wrapAsync");

const passport = require("passport");
const { saveRedirectUrl } = require("../middlewares/isLoggedIn");
const { validateUser } = require("../middlewares/validation");

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
      req.login(registeredUser, (err) => {
        // it automatically log in user after signup
        if (err) return next();
        req.flash("success", `Welcome ${registeredUser.username}!!`);
        return res.redirect("/listings");
      });
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
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
    req.flash("success", `Welcome ${req.body.username}`);
    const redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
  }
);

router.get("/logout", (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    } else {
      req.flash("success", "You are logged out");
      res.redirect("/listings");
    }
  });
});
module.exports = router;
