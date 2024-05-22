const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const ExpressErrors = require("./utils/ExpressErrors");
const campgrounds = require("./routes/campgrounds");
const reviews = require("./routes/review");
mongoose
  .connect("mongodb://127.0.0.1:27017/yelp-camp")
  .then(() => {
    console.log(" mongoose Connection Open");
  })
  .catch((err) => {
    console.log(" Mongoose ERROR");
  });
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// routing starts here!!!
app.use("/campgrounds", campgrounds);
app.use("/campgrounds/:id/reviews", reviews);
app.all("*", (req, res, next) => {
  next(new ExpressErrors("Page Not Found", 404));
});
app.use((err, req, res, next) => {
  const { statuscode = 500 } = err;
  if (!err.message) {
    err.message = "Something wwent wrong";
  }
  res.status(statuscode).render("error", { err });
});
app.listen(3000, () => {
  console.log("listening on port 3000");
});
