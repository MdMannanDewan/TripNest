const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync");
const CustomError = require("../utils/CustomError");

const Review = require("../models/review");
const Listing = require("../models/listing");
const { reviewSchema } = require("../schema");

const { isLoggedIn } = require("../middlewares/isLoggedIn");

// Vallidate review on server side
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    console.log(errMsg);
    throw new CustomError(400, errMsg);
  } else next();
};

// Reviews
// Post reviews route
router.post(
  "/",
  validateReview,
  isLoggedIn,
  wrapAsync(async (req, res, next) => {
    const listing = await Listing.findById(req.params.id);
    const newReview = new Review(req.body.review);
    await newReview.save();
    listing.reviews.push(newReview);
    await listing.save();
    req.flash("success", `Added new Review for ${listing.title}`);
    res.redirect(`/listings/${listing._id}`);
  })
);

// Delete reviews route
router.delete(
  "/:reviewId",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Review.findByIdAndDelete(reviewId);
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    req.flash("success", `Deleted review`);
    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;
