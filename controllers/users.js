const User = require("../models/user");
module.exports.renderRegisterForm = (req, res) => {
  res.render("users/register");
};
module.exports.createNewUser = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", `Welcome to CampTrails, ${username}`);
      res.redirect("/campgrounds");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
};
module.exports.renderSignInForm = (req, res) => {
  res.render("users/login");
};
module.exports.login = (req, res) => {
  const { username } = req.body;
  req.flash("success", `Welcome Back ${username}`);
  const redirectUrl = res.locals.returnTo || "/campgrounds";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};
module.exports.logout = (req, res) => {
  req.logout((e) => {
    if (e) {
      return next(e);
    }
    req.flash("success", "GoodBye Have A Nice Day");
    res.redirect("/campgrounds");
  });
};
