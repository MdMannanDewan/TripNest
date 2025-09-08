const Listing = require("../models/listing");
const { buildFolderPath } = require("../utils/buildFolderPath");
const cloudinary = require("../config/cloudinary");
const { uploadBufferToCloudinary } = require("../utils/cloudinaryUpload");
const { getCoordinate } = require("../utils/getCoordinate");

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
  const { location, country } = listing;
  const geometry = await getCoordinate(`${location}, ${country}`);

  const newListing = new Listing(listing);
  newListing.owner = req.user._id;
  newListing.geometry = geometry;

  // 1. check if the file exists
  if (!req.file) {
    newListing.image = { public_id: "Default image" };
    await newListing.save();
    req.flash(
      "success",
      `Added new Listing ${listing.title} successfully with default image. You did not provide any image`
    );
    // req.flash("error", `Image file is missing`);
    return res.redirect("../listings");
  }
  // 2. Send buffer to Cloudinary
  const folder = buildFolderPath("listing", req.user._id, "cover");
  const result = await uploadBufferToCloudinary(req.file.buffer, {
    folder,
  });
  const { secure_url, public_id } = result;
  newListing.image = { url: secure_url, public_id };
  await newListing.save();
  req.flash("success", `Added new Listing ${listing.title} successfully`);
  res.redirect("../listings");
};

module.exports.renderEditForm = async (req, res, next) => {
  // const {id} = req.params;
  const listing = await Listing.findById(req.params.id);
  let originalUrl = listing.image.url;
  originalUrl = originalUrl.replace("/upload", "/upload/h_150,w_200");
  if (!listing) {
    req.flash("error", "status: 404, the listing is not found");
    res.redirect("../");
  } else res.render("./listings/edit", { listing, originalUrl });
};

module.exports.updateListing = async (req, res, next) => {
  const { id } = req.params;
  const updatedListing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { runValidators: true, new: true }
  );
  if (req.file) {
    const folder = buildFolderPath("listing", req.user._id, "cover");
    const basename = updatedListing.image.public_id.split("/").pop();
    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder,
      public_id: basename,
      unique_filename: false,
      overwrite: true,
    });
    const { secure_url, public_id } = result;
    updatedListing.image = {
      url: secure_url,
      public_id: `${folder}/${basename}`,
    };
    await updatedListing.save();
  }
  console.log(updatedListing);

  req.flash("success", `Edited Listing ${updatedListing.title} successfully`);
  res.redirect(`../listings/${id}`);
  // res.redirect("../listings");
};

module.exports.destroyListing = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findByIdAndDelete(id);
  await cloudinary.uploader.destroy(listing.image.public_id, {
    resource_type: "image",
  });
  console.log(`deleted ${listing.title}`);
  req.flash("success", `Deleted Listing ${listing.title} successfully`);
  res.redirect("../listings");
};
