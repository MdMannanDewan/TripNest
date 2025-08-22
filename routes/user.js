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

// SignUp Route
router
  .route("/signup")
  .get(renderSignupForm)
  .post(validateUser, wrapAsync(signup));

// Login Route
router
  .route("/login")
  .get(renderLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    login
  );

// Logout Route
router.get("/logout", logout);

module.exports = router;
