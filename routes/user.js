const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync");

const passport = require("passport");
const { saveRedirectUrl } = require("../middlewares/isLoggedIn");
const { validateUser } = require("../middlewares/validation");
const {
  signup,
  renderSignupForm,
  renderLoginForm,
  login,
  logout,
} = require("../controllers/users");

// signUp route
router.get("/signup", renderSignupForm);

// Create Route
// post method
router.post("/signup", validateUser, wrapAsync(signup));

// Login Route
router.get("/login", renderLoginForm);

router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  login
);

router.get("/logout", logout);

module.exports = router;
