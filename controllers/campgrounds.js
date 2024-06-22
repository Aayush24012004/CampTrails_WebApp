const campground = require("../models/campground");
module.exports.index = async (req, res) => {
  const campgrounds = await campground.find({});
  res.render("campgrounds/index", { campgrounds });
};
module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};
module.exports.showCamp = async (req, res) => {
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
  if (!camp) {
    req.flash("error", "Camp Not Found");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { camp, currentUser: req.user });
};
module.exports.createCamp = async (req, res, next) => {
  // if (!req.body.campground)
  //   throw new ExpressErrors("invalid Campground data", 400);
  const newCamp = new campground(req.body.campground);
  newCamp.author = req.user._id;
  await newCamp.save();
  req.flash("success", "successfully created a new campground!");
  res.redirect(`/campgrounds/${newCamp._id}`);
};
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const camp = await campground.findById(id);
  if (!camp) {
    req.flash("error", "Camp Not Found");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { camp });
};
module.exports.updateCamp = async (req, res) => {
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
};
module.exports.deleteCamp = async (req, res) => {
  const { id } = req.params;
  await campground.findByIdAndDelete(id);
  req.flash("success", "successfully Deleted Campground!");
  res.redirect("/campgrounds");
};
