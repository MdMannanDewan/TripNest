const express = require("express");
const app = express();
const PORT = 8080;
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const MONGO_URL = "mongodb://127.0.0.1:27017/TripNest";
main()
  .then(() => console.log(`Connected Successfully`))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

// setting views path
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// express middlewares
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// routes
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

// index route
app.get("/listings", async (req, res) => {
  const allListing = await Listing.find({});
  res.render("./listings/index", { allListing });
});
// create new listing route and this block of code must be placed before show route otherwise app will consider new as a id
app.get("/listings/new", (req, res) => {
  res.render("./listings/new");
});
// show route
app.get("/listings/:id", async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("./listings/show", { listing });
});

//create new listing route
app.post("/listings", async (req, res) => {
  // const { title, description, image, price, location, country } = req.body;
  // another way
  const listing = req.body.listing;
  const newListing = new Listing(listing);
  try {
    await newListing.save();
    console.log("successful");
  } catch (err) {
    console.log(err);
  }
  res.redirect("./listings");
});

// Update listing Route
app.get("/listings/:id/edit", async (req, res) => {
  // const {id} = req.params;
  try {
    const listing = await Listing.findById(req.params.id);
    res.render("./listings/edit", { listing });
  } catch (err) {
    console.log(err);
  }
});

app.put("/listings/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      { ...req.body.listing },
      { runValidators: true, new: true }
    );
    res.redirect(`../listings/${id}`);
    // res.redirect("../listings");
  } catch (err) {
    console.log(err);
  }
});

//  Delete Route
app.delete("/listings/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const listing = await Listing.findByIdAndDelete(id);
    console.log(`deleted ${listing.title}`);
    res.redirect("../listings");
  } catch (err) {
    console.log("something wrong");
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
