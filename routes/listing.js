const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync");

const { isLoggedIn, isOwner } = require("../middlewares/isLoggedIn");
const { validateListing } = require("../middlewares/validation");
const {
  index,
  newListingForm,
  showListing,
  createListing,
  renderEditForm,
  updateListing,
  destroyListing,
} = require("../controllers/listings");

// index route
router.get("/", wrapAsync(index));

// create new listing route and this block of code must be placed before show route otherwise router will consider new as a id
router.get("/new", isLoggedIn, newListingForm);

// show route
router.get("/:id", wrapAsync(showListing));

//Create Route
router.post("/", isLoggedIn, validateListing, wrapAsync(createListing));

// Update Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(renderEditForm));

router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(updateListing)
);

//  Delete Route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(destroyListing));

module.exports = router;
