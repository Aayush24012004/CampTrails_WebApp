const campground = require("../models/campground");
const review = require("../models/review");
module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); //this is pull request used here to pull out the specific object id from the array reviews which contains review ids of all the reviews posted on a specific campground.
  await review.findByIdAndDelete(reviewId);
  req.flash("success", "successfully Deleted Review!");
  res.redirect(`/campgrounds/${id}`);
};
module.exports.newReview = async (req, res) => {
  const camp = await campground.findById(req.params.id);
  const newReview = new review(req.body.review);
  newReview.author = req.user._id;
  camp.reviews.push(newReview);
  await newReview.save();
  await camp.save();
  req.flash("success", "successfully Added Review!");
  res.redirect(`/campgrounds/${camp._id}`);
};
