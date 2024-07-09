const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const controller = require("../controllers/campgrounds");
const { isLoggedIn, isAuthor, validateCampground } = require("../isLoggedIn");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage, limits: { files: 4 } });
const maxImages = 4;
router
  .route("/")
  .get(catchAsync(controller.index))
  .post(
    isLoggedIn,
    upload.array("image", maxImages),
    validateCampground,
    catchAsync(controller.createCamp)
  );

router.get("/new", isLoggedIn, controller.renderNewForm);
router
  .route("/:id")
  .get(catchAsync(controller.showCamp))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image", maxImages),
    validateCampground,
    catchAsync(controller.updateCamp)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(controller.deleteCamp));
router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(controller.renderEditForm)
);
module.exports = router;
