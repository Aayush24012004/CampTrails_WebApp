const { cloudinary } = require("../cloudinary");
const { fileLoader } = require("ejs");
const campground = require("../models/campground");
const maxImages = 4;
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;
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
  const geoData = await maptilerClient.geocoding.forward(
    req.body.campground.location,
    { limit: 1 }
  );
  console.log(geoData);
  const newCamp = new campground(req.body.campground);
  newCamp.geometry = geoData.features[0].geometry;

  if (req.files.length > maxImages) {
    req.flash("error", "You can not upload more than 4 images");
    return res.redirect("/campgrounds/new");
  }
  newCamp.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  newCamp.author = req.user._id;
  await newCamp.save();
  console.log(newCamp);
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
  const { id } = req.params;
  const newCamp = await campground.findByIdAndUpdate(
    id,
    { ...req.body.campground },
    // In the context of updating a document in Mongoose, ...req.body.campground is generally preferred because it allows you to explicitly specify which fields should be updated while keeping the rest of the document unchanged. This can help prevent unintended modifications to the document and follows the principle of least privilege.
    {
      runValidators: true,
      new: true,
    }
  );
  const geoData = await maptilerClient.geocoding.forward(
    req.body.campground.location,
    { limit: 1 }
  );
  campground.geometry = geoData.features[0].geometry;
  if (req.files.length > maxImages) {
    req.flash("error", "You can not upload more than 4 images");
    return res.redirect("/campgrounds/new");
  }
  const imgs = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  newCamp.images.push(...imgs);
  await newCamp.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await newCamp.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
    console.log(newCamp);
  }
  req.flash("success", "successfully Updated Campground!");
  res.redirect(`/campgrounds/${newCamp._id}`);
};
module.exports.deleteCamp = async (req, res) => {
  const { id } = req.params;
  await campground.findByIdAndDelete(id);
  req.flash("success", "successfully Deleted Campground!");
  res.redirect("/campgrounds");
};
