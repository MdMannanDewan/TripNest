const Listing = require("../models/listing");

module.exports.index = async (req, res, next) => {
  const allListing = await Listing.find({});
  res.render("./listings/index", { allListing });
};

module.exports.newListingForm = (req, res) => {
  res.render("./listings/new");
};

module.exports.showListing = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: "author" })
    .populate("owner");
  console.log(listing);
  if (!listing) {
    req.flash("error", "the listing is not found");
    res.redirect("../listings");
  } else res.render("./listings/show", { listing });
};

module.exports.createListing = async (req, res, next) => {
  // const { title, description, image, price, location, country } = req.body;
  // another way
  const listing = req.body.listing;
  const newListing = new Listing(listing);
  newListing.owner = req.user._id;
  await newListing.save();
  req.flash("success", `Added new Listing ${listing.title} successfully`);
  console.log(`in post`);
  res.redirect("../listings");
};

module.exports.renderEditForm = async (req, res, next) => {
  // const {id} = req.params;
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    req.flash("error", "status: 404, the listing is not found");
    res.redirect("../");
  } else res.render("./listings/edit", { listing });
};

module.exports.updateListing = async (req, res, next) => {
  const { id } = req.params;
  const updatedListing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { runValidators: true, new: true }
  );
  req.flash("success", `Edited Listing ${updatedListing.title} successfully`);
  res.redirect(`../listings/${id}`);
  // res.redirect("../listings");
};

module.exports.destroyListing = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findByIdAndDelete(id);
  console.log(`deleted ${listing.title}`);
  req.flash("success", `Deleted Listing ${listing.title} successfully`);
  res.redirect("../listings");
};
