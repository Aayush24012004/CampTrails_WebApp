const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const campground = require("./models/campground");
const review = require("./models/review");
const { campgroundSchema, reviewSchema } = require("./validationSchema");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const catchAsync = require("./utils/catchAsync");
const ExpressErrors = require("./utils/ExpressErrors");
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
const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressErrors(msg, 400);
  } else {
    next();
  }
};
const validateReviews = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressErrors(msg, 400);
  } else {
    next();
  }
};
// routing starts here!!!
app.get(
  "/campgrounds",
  catchAsync(async (req, res) => {
    const campgrounds = await campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

app.get(
  "/campgrounds/new",
  catchAsync(async (req, res) => {
    res.render("campgrounds/new");
  })
);

app.get(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const camp = await campground.findById(req.params.id).populate("reviews");
    res.render("campgrounds/show", { camp });
  })
);
app.post(
  "/campgrounds",
  validateCampground,
  catchAsync(async (req, res, next) => {
    // if (!req.body.campground)
    //   throw new ExpressErrors("invalid Campground data", 400);
    const newCamp = new campground(req.body.campground);
    await newCamp.save();
    res.redirect(`/campgrounds/${newCamp._id}`);
  })
);
app.get(
  "/campgrounds/:id/edit",
  catchAsync(async (req, res) => {
    const camp = await campground.findById(req.params.id);
    res.render("campgrounds/edit", { camp });
  })
);
app.put(
  "/campgrounds/:id",
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
    res.redirect(`/campgrounds/${newCamp._id}`);
  })
);
app.delete(
  "/campgrounds/:id/reviews/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); //this is pull request used here to pull out the specific object id from the array reviews which contains review ids of all the reviews posted on a specific campground.
    await review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
  })
);
app.delete(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);
app.post(
  "/campgrounds/:id/reviews",
  validateReviews,
  catchAsync(async (req, res) => {
    const camp = await campground.findById(req.params.id);
    const newReview = new review(req.body.review);
    camp.reviews.push(newReview);
    await newReview.save();
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`);
  })
);
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
