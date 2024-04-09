const campground = require("../models/campground");
const mongoose = require("mongoose");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");

mongoose
  .connect("mongodb://127.0.0.1:27017/yelp-camp")
  .then(() => {
    console.log(" mongoose Connection Open");
  })
  .catch((err) => {
    console.log(" Mongoose ERROR");
    console.log(err);
  });
const title = (array) => array[Math.floor(Math.random() * array.length)];
const seedDB = async () => {
  await campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 100) + 20;
    const camp = new campground({
      location: `${cities[random1000].city},${cities[random1000].state}`,
      title: `${title(descriptors)} ${title(places)}`,
      image: "https://source.unsplash.com/collection/483251",
      description:
        "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Iusto fugit illo molestiae corrupti, hic iste, commodi laborum nostrum beatae dolore repudiandae possimus est atque odio. Quia odio delectus at cupiditate.",
      price,
    });

    await camp.save();
  }
};
seedDB().then(() => {
  mongoose.connection.close();
});
