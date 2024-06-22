const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");

const campground = require("../models/campground");

const { isLoggedIn, isAuthor, validateCampground } = require("../isLoggedIn");
const review = require("../models/review");
router.get(
  "/",
  catchAsync(async (req, res) => {
    const campgrounds = await campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

router.get("/new", isLoggedIn, (req, res) => {
  res.render("campgrounds/new");
});

router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const camp = await campground
      .findById(req.params.id)
      .populate({
        path: "reviews",
        populate: {
          path: "author",
          model: "User",
        },
      })
      .populate("author");
    console.log(camp);
    if (!camp) {
      req.flash("error", "Camp Not Found");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { camp, currentUser: req.user });
  })
);

router.post(
  "/",
  validateCampground,
  isLoggedIn,
  catchAsync(async (req, res, next) => {
    // if (!req.body.campground)
    //   throw new ExpressErrors("invalid Campground data", 400);
    const newCamp = new campground(req.body.campground);
    newCamp.author = req.user._id;
    await newCamp.save();
    req.flash("success", "successfully created a new campground!");
    res.redirect(`/campgrounds/${newCamp._id}`);
  })
);
router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await campground.findById(id);
    if (!camp) {
      req.flash("error", "Camp Not Found");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { camp });
  })
);
router.put(
  "/:id",
  validateCampground,
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res) => {
    const newCamp = await campground.findByIdAndUpdate(
      req.params.id,
      req.body.campground,
      // In the context of updating a document in Mongoose, ...req.body.campground is generally preferred because it allows you to explicitly specify which fields should be updated while keeping the rest of the document unchanged. This can help prevent unintended modifications to the document and follows the principle of least privilege.
      {
        runValidators: true,
        new: true,
      }
    );
    req.flash("success", "successfully Updated Campground!");
    res.redirect(`/campgrounds/${newCamp._id}`);
  })
);
router.delete(
  "/:id",
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await campground.findByIdAndDelete(id);
    req.flash("success", "successfully Deleted Campground!");
    res.redirect("/campgrounds");
  })
);

module.exports = router;
