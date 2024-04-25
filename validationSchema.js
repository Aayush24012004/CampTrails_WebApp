const joi = require("joi");
const review = require("./models/review");
module.exports.campgroundSchema = joi.object({
  campground: joi
    .object({
      title: joi.string().required(),
      price: joi.number().required().min(0),
      location: joi.string().required(),
      description: joi.string().required(),
      image: joi.string().required(),
    })
    .required(),
});
module.exports.reviewSchema = joi.object({
  review: joi
    .object({
      rating: joi.number().min(1).max(5).required(),
      comment: joi.string().required(),
    })
    .required(),
});
