const express = require("express");
const app = express();
const PORT = 3000;
const session = require("express-session");
const path = require("path");
const flash = require("connect-flash");

// setting views path
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const sessionOption = {
  secret: "BAngladeshsecret",
  resave: false,
  saveUninitialized: true,
};

app.use(session(sessionOption));
app.use(flash());

app.get("/register", (req, res) => {
  const { name = "annonymous" } = req.query;
  req.session.name = name;
  req.flash("success", "User registered successfully");
  res.redirect("/hello");
});

app.get("/hello", (req, res) => {
  const name = req.session.name;
  res.locals.message = req.flash("success");
  console.log(res.locals.message);

  res.render("page", { name });
});
// app.get("/getCount", (req, res) => {
//   if (req.session.count) req.session.count++;
//   else req.session.count = 1;
//   res.send(`Count req ${req.session.count}`);
// });

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
