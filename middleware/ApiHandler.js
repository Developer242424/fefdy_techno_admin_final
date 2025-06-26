const LoginUsers = require("../models/loginusers");

exports.isAuthenticated = async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return res
      .status(200)
      .json({ status: 401, message: "Unauthorized Account..!" });
  }

  try {
    const user = await LoginUsers.findOne({
      where: {
        web_token: token,
        is_deleted: null,
      },
    });

    if (!user) {
      return res
        .status(200)
        .json({ status: 401, message: "Unauthorized Account..!" });
    }

    req.session.user = user;
    next();
  } catch (error) {
    return res
      .status(200)
      .json({ status: 500, message: "Server Error", error: error.message });
  }
};
