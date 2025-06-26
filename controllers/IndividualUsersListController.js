const asyncHandler = require("express-async-handler");
const { check, validationResult } = require("express-validator");
const multer = require("multer");
const User = require("../models/user");
const Subjects = require("../models/subjects");
const Topics = require("../models/topics");
const Level = require("../models/level");
const Subtopic = require("../models/subtopic");
const CategoryData = require("../models/categorydata");
const Organisation = require("../models/organisation");
const OrgDetails = require("../models/org_details");
const Standards = require("../models/standards");
const LoginUsers = require("../models/loginusers");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { where, Sequelize, DATE, Op, or } = require("sequelize");
const { render } = require("ejs");
require("dotenv").config();
const session = require("express-session");
const getDynamicUploader = require("../middleware/upload");
const moment = require("moment");
const { fn } = require("sequelize");
const path = require("path");
const fs = require("fs");
const { title } = require("process");
const Category = require("../models/category");
const { connect } = require("http2");
const sequelize = require("../config/database");

class IndividualUsersListController {
  constructor() {
    const { check, validationResult } = require("express-validator");
    const asyncHandler = require("express-async-handler");

    this.create = [
      (req, res, next) => {
        const upload = getDynamicUploader("user_profile").single(
          "individual_profile_image"
        );
        upload(req, res, function (err) {
          if (err) {
            return res.status(200).json({ status: 400, message: err.message });
          }
          next();
        });
      },

      check("individual_name")
        .trim()
        .notEmpty()
        .withMessage("Name is required"),
      check("individual_email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format"),
      check("individual_phone")
        .trim()
        .notEmpty()
        .withMessage("Phone number is required")
        .isMobilePhone("any")
        .withMessage("Invalid phone number"),
      check("individual_username")
        .trim()
        .notEmpty()
        .withMessage("Username is required"),
      check("individual_password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
      check("individual_subject").notEmpty().withMessage("Subject is required"),
      check("individual_level").notEmpty().withMessage("Level is required"),

      asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(200).json({ status: 401, errors: errors.array() });
        }

        const {
          individual_name,
          individual_email,
          individual_phone,
          individual_username,
          individual_password,
          individual_subject,
          individual_level,
        } = req.body;

        const file = req.file;
        if (!file) {
          return res.status(200).json({
            status: 400,
            message: "Profile picture is required",
          });
        }

        const users = await LoginUsers.findOne({
          where: {
            username: individual_username,
          },
        });
        if (users) {
          return res
            .status(200)
            .json({ status: 400, message: "Username is already taken" });
        }

        const insert = await LoginUsers.create({
          name: individual_name,
          email: individual_email,
          mobile: individual_phone,
          username: individual_username,
          password: await bcrypt.hash(individual_password, 10),
          profile_image: `uploads/user_profile/${file.filename}`,
          subject: JSON.stringify(individual_subject),
          level: individual_level,
          type: "individual",
        });

        return res.status(200).json({
          status: 200,
          message: "User created successfully",
        });
      }),
    ];

    this.update = [
      (req, res, next) => {
        const upload = getDynamicUploader("user_profile").single(
          "edit_individual_profile_image"
        );
        upload(req, res, function (err) {
          if (err) {
            return res.status(200).json({ status: 400, message: err.message });
          }
          next();
        });
      },

      check("edit_individual_name")
        .trim()
        .notEmpty()
        .withMessage("Name is required"),
      check("edit_individual_email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format"),
      check("edit_individual_phone")
        .trim()
        .notEmpty()
        .withMessage("Phone number is required")
        .isMobilePhone("any")
        .withMessage("Invalid phone number"),
      check("edit_individual_username")
        .trim()
        .notEmpty()
        .withMessage("Username is required"),
      check("edit_individual_subject")
        .notEmpty()
        .withMessage("Subject is required"),
      check("edit_individual_level")
        .notEmpty()
        .withMessage("Level is required"),

      asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(200).json({ status: 401, errors: errors.array() });
        }

        const {
          edit_individual_name,
          edit_individual_email,
          edit_individual_phone,
          edit_individual_username,
          edit_individual_password,
          edit_individual_subject,
          edit_individual_level,
          edit_individual_id,
        } = req.body;

        const file = req.file;

        const users = await LoginUsers.findOne({
          where: {
            id: edit_individual_id,
          },
        });

        if (file && users.profile_image) {
          const oldPath = path.join(
            __dirname,
            "../public/",
            users.profile_image
          );
          fs.unlink(oldPath, (err) => {
            if (err) {
              console.warn(`Old file delete warning: ${err.message}`);
            }
          });
          users.profile_image = `uploads/user_profile/${file.filename}`;
        }

        users.name = edit_individual_name;
        users.email = edit_individual_email;
        users.mobile = edit_individual_phone;
        users.username = edit_individual_username;
        users.subject = JSON.stringify(edit_individual_subject);
        users.level = edit_individual_level;

        if (
          edit_individual_password &&
          edit_individual_password.trim() !== ""
        ) {
          users.password = await bcrypt.hash(edit_individual_password, 10);
        }

        await users.save();

        return res.status(200).json({
          status: 200,
          message: "User updated successfully",
        });
      }),
    ];
  }
}

module.exports = new IndividualUsersListController();
