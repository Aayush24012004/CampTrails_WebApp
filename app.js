const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const campground = require("./models/campground");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
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
app.get("/campgrounds", async (req, res) => {
  const campgrounds = await campground.find({});
  res.render("campgrounds/index", { campgrounds });
});

app.get("/campgrounds/new", async (req, res) => {
  res.render("campgrounds/new");
});

app.get("/campgrounds/:id", async (req, res) => {
  const camp = await campground.findById(req.params.id);
  res.render("campgrounds/show", { camp });
});
app.post("/campgrounds", async (req, res) => {
  const newCamp = new campground(req.body.campground);
  await newCamp.save();
  res.redirect(`/campgrounds/${newCamp._id}`);
});
app.get("/campgrounds/:id/edit", async (req, res) => {
  const camp = await campground.findById(req.params.id);
  res.render("campgrounds/edit", { camp });
});
app.put("/campgrounds/:id", async (req, res) => {
  const newCamp = await campground.findByIdAndUpdate(
    req.params.id,
    req.body.campground,
    // In the context of updating a document in Mongoose, ...req.body.campground is generally preferred because it allows you to explicitly specify which fields should be updated while keeping the rest of the document unchanged. This can help prevent unintended modifications to the document and follows the principle of least privilege.
    {
      runValidators: true,
      new: true,
    }
  );
  res.redirect(`/campgrounds/${newCamp._id}`);
});
app.delete("/campgrounds/:id", async (req, res) => {
  const { id } = req.params;
  await campground.findByIdAndDelete(id);
  res.redirect("/campgrounds");
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});