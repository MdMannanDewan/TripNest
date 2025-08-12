const express = require("express");
const app = express();
const PORT = 8080;
const mongoose = require("mongoose");
const Listing = require("./models/listing");

const MONGO_URL = "mongodb://127.0.0.1:27017/TripNest";
main()
  .then(() => console.log(`Connected Successfully`))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

// testListing route
app.get("/testListing", (req, res) => {
  //   const sampleListing = new Listing({
  //     title: "My new Villa",
  //     description: "By the beach",
  //     price: 1200,
  //     location: "Cox's Bazar",
  //     country: "Bangladesh",
  //   });
  //   sampleListing
  //     .save()
  //     .then((res) => console.log(res))
  //     .catch((err) => console.log(err));
  res.send("Successful Testing");
});

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
