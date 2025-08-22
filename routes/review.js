const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync");

const { isLoggedIn, isReviewAuthor } = require("../middlewares/isLoggedIn");
const { validateReview } = require("../middlewares/validation");
const { createReview, destroyReview } = require("../controllers/reviews");

// Reviews
// Post reviews route
router.post("/", isLoggedIn, validateReview, wrapAsync(createReview));

// Delete reviews route
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(destroyReview)
);

module.exports = router;
