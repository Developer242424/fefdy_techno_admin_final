const User = require("../models/user");

exports.isAuthenticated = async (req, res, next) => {
  const token = req.session.token;
  const sessionUser = req.session.user;

  if (!token || !sessionUser) {
    return res.redirect("/admin/login");
  }

  try {
    const user = await User.findOne({
      where: {
        user_id: sessionUser.id,
        username: sessionUser.username,
        is_deleted: null,
      },
    });

    if (!user) return res.redirect("/admin/login");

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    return res.redirect("/admin/login");
  }
};
