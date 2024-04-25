const mongoose = require("mongoose");
const { Schema } = mongoose;
const reviewSchema = new Schema({
  rating: Number,
  comment: String,
});
module.exports = mongoose.model("Review", reviewSchema);
