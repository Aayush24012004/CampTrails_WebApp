const express = require("express");
const router = express.Router({ mergeParams: true });
const campground = require("../models/campground");
const review = require("../models/review");
const catchAsync = require("../utils/catchAsync");
const controller = require("../controllers/reviews");
const {
  validateReviews,
  isLoggedIn,
  isReviewAuthor,
} = require("../isLoggedIn");
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(controller.deleteReview)
);
router.post("/", isLoggedIn, validateReviews, catchAsync(controller.newReview));
module.exports = router;
