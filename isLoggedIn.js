module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "you need to be signed in");
    return res.redirect("/login");
  }
  next();
};
