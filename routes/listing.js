const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync");

const Listing = require("../models/listing");

const { isLoggedIn, isOwner } = require("../middlewares/isLoggedIn");
const { validateListing } = require("../middlewares/validation");

// index route
router.get(
  "/",
  wrapAsync(async (req, res, next) => {
    const allListing = await Listing.find({}).populate("owner");
    res.render("./listings/index", { allListing });
  })
);

// create new listing route and this block of code must be placed before show route otherwise router will consider new as a id
router.get("/new", isLoggedIn, (req, res) => {
  res.render("./listings/new");
});

// show route
router.get(
  "/:id",
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
      .populate("reviews")
      .populate("owner");
    if (!listing) {
      req.flash("error", "the listing is not found");
      res.redirect("../listings");
    } else res.render("./listings/show", { listing });
  })
);

//Create Route
router.post(
  "/",
  validateListing,
  isLoggedIn,
  wrapAsync(async (req, res, next) => {
    // const { title, description, image, price, location, country } = req.body;
    // another way
    const listing = req.body.listing;
    const newListing = new Listing(listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", `Added new Listing ${listing.title} successfully`);
    console.log(`in post`);
    res.redirect("../listings");
  })
);

// Update Route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res, next) => {
    // const {id} = req.params;
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      req.flash("error", "status: 404, the listing is not found");
      res.redirect("../");
    } else res.render("./listings/edit", { listing });
  })
);

router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      { ...req.body.listing },
      { runValidators: true, new: true }
    );
    req.flash("success", `Edited Listing ${updatedListing.title} successfully`);
    res.redirect(`../listings/${id}`);
    // res.redirect("../listings");
  })
);

//  Delete Route
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findByIdAndDelete(id);
    console.log(`deleted ${listing.title}`);
    req.flash("success", `Deleted Listing ${listing.title} successfully`);
    res.redirect("../listings");
  })
);

module.exports = router;
