module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // saving url of request
    req.session.redirectUrl = req.get("referer");
    req.flash("success", "You have to log in first");
    res.redirect("/login");
  } else next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) res.locals.redirectUrl = req.session.redirectUrl;
  next();
};
