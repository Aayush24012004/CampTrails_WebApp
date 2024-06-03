const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressErrors = require("../utils/ExpressErrors");
const campground = require("../models/campground");
const { campgroundSchema } = require("../validationSchema");
const review = require("../models/review");
const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressErrors(msg, 400);
  } else {
    next();
  }
};
router.get(
  "/",
  catchAsync(async (req, res) => {
    const campgrounds = await campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

router.get(
  "/new",
  catchAsync(async (req, res) => {
    res.render("campgrounds/new");
  })
);

router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const camp = await campground.findById(req.params.id).populate("reviews");
    if (!camp) {
      req.flash("error", "Camp Not Found");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { camp });
  })
);

router.post(
  "/",
  validateCampground,
  catchAsync(async (req, res, next) => {
    // if (!req.body.campground)
    //   throw new ExpressErrors("invalid Campground data", 400);
    const newCamp = new campground(req.body.campground);
    await newCamp.save();
    req.flash("success", "successfully created a new campground!");
    res.redirect(`/campgrounds/${newCamp._id}`);
  })
);
router.get(
  "/:id/edit",
  catchAsync(async (req, res) => {
    const camp = await campground.findById(req.params.id);
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
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await campground.findByIdAndDelete(id);
    req.flash("success", "successfully Deleted Campground!");
    res.redirect("/campgrounds");
  })
);

module.exports = router;
