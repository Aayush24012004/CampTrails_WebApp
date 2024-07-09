const mongoose = require("mongoose");
const review = require("./review");
const { ref, number } = require("joi");
const { coordinates } = require("@maptiler/client");
const Schema = mongoose.Schema;
const imageSchema = new Schema({
  url: String,
  filename: String,
});
imageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_300");
});
const opts = { toJSON: { virtuals: true } };
const CampgroundSchema = new Schema(
  {
    title: String,
    images: [imageSchema],
    price: Number,
    location: String,
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    description: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  opts
);
CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
  return `<a href=/campgrounds/${this._id}>${this.title}</a>`;
});
CampgroundSchema.post("findOneAndDelete", async (doc) => {
  if (doc) {
    await review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});

module.exports = mongoose.model("campground", CampgroundSchema);
