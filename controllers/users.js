const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
  res.render("./users/signup");
};

module.exports.signup = async (req, res) => {
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
};

module.exports.renderLoginForm = (req, res) => {
  res.render("./users/login");
};

module.exports.login = async (req, res) => {
  req.flash("success", `Welcome ${req.body.username}`);
  const redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    } else {
      req.flash("success", "You are logged out");
      res.redirect("/listings");
    }
  });
};
