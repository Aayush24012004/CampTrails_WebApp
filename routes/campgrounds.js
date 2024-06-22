const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const controller = require("../controllers/campgrounds");
const { isLoggedIn, isAuthor, validateCampground } = require("../isLoggedIn");
router
  .route("/")
  .get(catchAsync(controller.index))
  .post(validateCampground, isLoggedIn, catchAsync(controller.createCamp));
router.get("/new", isLoggedIn, controller.renderNewForm);
router
  .route("/:id")
  .get(catchAsync(controller.showCamp))
  .put(
    validateCampground,
    isLoggedIn,
    isAuthor,
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
