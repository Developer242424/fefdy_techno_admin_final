const asyncHandler = require("express-async-handler");
const { check, validationResult } = require("express-validator");
const multer = require("multer");
const User = require("../../models/user");
const Subjects = require("../../models/subjects");
const Topics = require("../../models/topics");
const Level = require("../../models/level");
const Organisation = require("../../models/organisation");
const OrgDetails = require("../../models/org_details");
const WatchHistory = require("../../models/watchhistory");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { where, Sequelize, DATE, Op } = require("sequelize");
const { render } = require("ejs");
require("dotenv").config();
const session = require("express-session");
const getDynamicUploader = require("../../middleware/upload");
const moment = require("moment");
const { fn } = require("sequelize");
const path = require("path");
const fs = require("fs");
const { title, emit } = require("process");
const Subtopic = require("../../models/subtopic");
const { profile } = require("console");
const LoginUsers = require("../../models/loginusers");

class ProfileController {
  constructor() {
    this.data = asyncHandler(async (req, res) => {
      try {
        const user = req.session.user;
        // console.log(user);
        const data = {
          name: user.name,
          email: user.email,
          profile: user.profile_image,
        };
        return res.status(200).json({ status: 200, data });
      } catch (error) {
        return res.status(200).json({
          status: 500,
          message: "Internal server error - " + error.message,
          error,
        });
      }
    });

    this.update = [
      // Middleware to handle file upload
      (req, res, next) => {
        const upload =
          getDynamicUploader("user_profile").single("profile_image");
        upload(req, res, function (err) {
          if (err) {
            return res.status(200).json({ status: 400, message: err.message });
          }
          next();
        });
      },

      asyncHandler(async (req, res) => {
        try {
          const { name, email, token } = req.body;
          const file = req.file;
          const user = await LoginUsers.findOne({
            where: {
              web_token: token,
            },
          });
          if (!user) {
            return res
              .status(200)
              .json({ status: 401, message: "Unauthorized account" });
          }
          //   console.log(user);
          if (file) {
            if (user.profile_image) {
              const oldPath = path.join(
                __dirname,
                "../../public",
                user.profile_image
              );
              fs.unlink(oldPath, (err) => {
                if (err) {
                  console.warn(
                    `Failed to delete old profile image: ${err.message}`
                  );
                }
              });
            }
            user.profile_image = `uploads/user_profile/${file.filename}`;
          }
          user.name = name;
          user.email = email;
          await user.save();

          return res.status(200).json({
            status: 200,
            message: "Profile updated",
            data: {
              name,
              email,
              filename: file?.filename || null,
            },
          });
        } catch (error) {
          return res.status(200).json({
            status: 500,
            message: "Internal server error - " + error.message,
            error,
          });
        }
      }),
    ];
  }
}

module.exports = new ProfileController();
