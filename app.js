const express = require("express");
const app = express();
const PORT = 8080;
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const CustomError = require("./utils/CustomError");
const { listingSchema, reviewSchema } = require("./schema");
const Review = require("./models/review");

const MONGO_URL = "mongodb://127.0.0.1:27017/TripNest";
main()
  .then(() => console.log(`Connected Successfully`))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

// setting views path
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// express middlewares
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new CustomError(400, error);
  } else next();
};

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    console.log(errMsg);
    throw new CustomError(400, errMsg);
  } else next();
};

// Home Route
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

// index route
app.get(
  "/listings",
  wrapAsync(async (req, res, next) => {
    const allListing = await Listing.find({});
    res.render("./listings/index", { allListing });
  })
);
// create new listing route and this block of code must be placed before show route otherwise app will consider new as a id
app.get("/listings/new", (req, res) => {
  res.render("./listings/new");
});
// show route
app.get(
  "/listings/:id",
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if (!listing) throw new CustomError(404, "Listing not Found");
    res.render("./listings/show", { listing });
  })
);

//Create Route
app.post(
  "/listings",
  validateListing,
  wrapAsync(async (req, res, next) => {
    // const { title, description, image, price, location, country } = req.body;
    // another way
    const listing = req.body.listing;
    const newListing = new Listing(listing);
    await newListing.save();
    res.redirect("./listings");
  })
);

// Update Route
app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res, next) => {
    // const {id} = req.params;
    const listing = await Listing.findById(req.params.id);
    res.render("./listings/edit", { listing });
  })
);

app.put(
  "/listings/:id",
  validateListing,
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      { ...req.body.listing },
      { runValidators: true, new: true }
    );
    res.redirect(`../listings/${id}`);
    // res.redirect("../listings");
  })
);

//  Delete Route
app.delete(
  "/listings/:id",
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findByIdAndDelete(id);
    console.log(`deleted ${listing.title}`);
    res.redirect("../listings");
  })
);

// Reviews
// Post reviews route
app.post(
  "/listings/:id/reviews",
  validateReview,
  wrapAsync(async (req, res, next) => {
    const listing = await Listing.findById(req.params.id);
    const newReview = new Review(req.body.review);
    await newReview.save();
    listing.reviews.push(newReview);
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
  })
);

// Delete reviews route
app.delete(
  "/listings/:id/reviews/:reviewId",
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Review.findByIdAndDelete(reviewId);
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    res.redirect(`/listings/${id}`);
  })
);

// Not found route
app.use((req, res, next) => {
  next(new CustomError(404, "Page Not Found!!!"));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  const { status = 500, message = "Something went Wrong!!" } = err;
  res.status(status).render("error", { status, message });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
