const mongoose = require("mongoose");
const { Schema } = mongoose;

const reviewSchema = new Schema({
  comment: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  created_at: {
    type: Date,
    default: Date.now(),
  },
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
