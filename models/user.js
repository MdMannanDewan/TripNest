const mongoose = require("mongoose");
const { Schema } = mongoose;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

// Passport-Local Mongoose is a Mongoose plugin that simplifies building username and password login with Passport.
userSchema.plugin(passportLocalMongoose); // by this mongoose will automatically set username, hashing, salting and different kind of method

const User = mongoose.model("User", userSchema);
module.exports = User;
