const express = require("express");
const router = express.Router({ mergeParams: true });
const campground = require("../models/campground");
const review = require("../models/review");
const catchAsync = require("../utils/catchAsync");
const ExpressErrors = require("../utils/ExpressErrors");
const { reviewSchema } = require("../validationSchema");

const validateReviews = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressErrors(msg, 400);
  } else {
    next();
  }
};

router.delete(
  "/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); //this is pull request used here to pull out the specific object id from the array reviews which contains review ids of all the reviews posted on a specific campground.
    await review.findByIdAndDelete(reviewId);
    req.flash("success", "successfully Deleted Review!");
    res.redirect(`/campgrounds/${id}`);
  })
);
router.post(
  "/",
  validateReviews,
  catchAsync(async (req, res) => {
    const camp = await campground.findById(req.params.id);
    const newReview = new review(req.body.review);
    camp.reviews.push(newReview);
    await newReview.save();
    await camp.save();
    req.flash("success", "successfully Added Review!");
    res.redirect(`/campgrounds/${camp._id}`);
  })
);
module.exports = router;
