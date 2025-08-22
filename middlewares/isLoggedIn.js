const Listing = require("../models/listing");
const Review = require("../models/review");

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

module.exports.isOwner = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!res.locals.currentUser._id.equals(listing.owner)) {
    req.flash("error", "You are not authorized to perform this action");
    return res.redirect(req.get("referer") || "./listings");
  } else next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!res.locals.currentUser._id.equals(review.author)) {
    req.flash("error", "You are not authorized to perform this action");
    return res.redirect(req.get("referer") || "./listings");
  } else next();
};
