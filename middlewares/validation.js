const { listingSchema, reviewSchema } = require("../schema");
const CustomError = require("../utils/CustomError");

// Validate Listing with JOI in server side
module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new CustomError(400, errMsg);
  } else next();
};

// Vallidate review on server side
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    console.log(errMsg);
    throw new CustomError(400, errMsg);
  } else next();
};

// user validation
module.exports.validateUser = (req, res, next) => {
  const { email } = req.body;
  let { error } = userSchema.validate({ email });
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new CustomError(400, errMsg);
  } else next();
};
