const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync");
const CustomError = require("../utils/CustomError");

const Listing = require("../models/listing");
const { listingSchema } = require("../schema");

// Validate Listing with JOI in server side
const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new CustomError(400, errMsg);
  } else next();
};

// index route
router.get(
  "/",
  wrapAsync(async (req, res, next) => {
    const allListing = await Listing.find({});
    res.render("./listings/index", { allListing });
  })
);

// create new listing route and this block of code must be placed before show route otherwise router will consider new as a id
router.get("/new", (req, res) => {
  res.render("./listings/new");
});

// show route
router.get(
  "/:id",
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
      req.flash("error", "status: 414, the listing is not found");
      res.redirect("../listings");
    } else res.render("./listings/show", { listing });
  })
);

//Create Route
router.post(
  "/",
  validateListing,
  wrapAsync(async (req, res, next) => {
    // const { title, description, image, price, location, country } = req.body;
    // another way
    const listing = req.body.listing;
    const newListing = new Listing(listing);
    await newListing.save();
    req.flash("success", `Added new Listing ${listing.title} successfully`);
    res.redirect("./listings");
  })
);

// Update Route
router.get(
  "/:id/edit",
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
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findByIdAndDelete(id);
    console.log(`deleted ${listing.title}`);
    req.flash("success", `Deleted Listing ${listing.title} successfully`);
    res.redirect("../listings");
  })
);

module.exports = router;
