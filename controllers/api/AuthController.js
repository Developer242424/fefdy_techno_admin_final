const asyncHandler = require("express-async-handler");
const { check, validationResult } = require("express-validator");
const multer = require("multer");
const User = require("../../models/user");
const LoginUsers = require("../../models/loginusers");
const Subjects = require("../../models/subjects");
const Organisation = require("../../models/organisation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { where, Sequelize, Op } = require("sequelize");
const { render } = require("ejs");
require("dotenv").config();
const session = require("express-session");
const crypto = require("crypto");

const upload = multer().none();
class AuthController {
  constructor() {
    this.login = [
      upload,
      check("username")
        .trim()
        .notEmpty()
        .withMessage("Username is required")
        .bail()
        // .isAlphanumeric()
        // .withMessage("Username must be alphanumeric")
        .isLength({ min: 3, max: 20 })
        .withMessage("Username must be between 3 to 20 characters"),

      check("password")
        .notEmpty()
        .withMessage("Password is required")
        .bail()
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),

      asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(200).json({ status: 401, errors: errors.array() });
        }

        try {
          const { username, password } = req.body;

          const user = await LoginUsers.findOne({
            where: { username: username, is_deleted: null },
          });

          if (!user) {
            return res
              .status(200)
              .json({ status: 400, message: "Invalid Username" });
          }

          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) {
            return res
              .status(200)
              .json({ status: 400, message: "Invalid Password" });
          }

          const token = await bcrypt.hash(
            crypto.randomBytes(30).toString("hex"),
            10
          );
          user.web_token = token;
          await user.save();

        //   let subjectIds = [];
        //   try {
        //     subjectIds = user.subject ? JSON.parse(user.subject) : [];
        //   } catch (e) {
        //     subjectIds = [];
        //   }

        //   const subjects = await Subjects.findAll({
        //     where: {
        //       id: {
        //         [Op.in]: subjectIds,
        //       },
        //     },
        //   });

          const ret_user = await LoginUsers.findOne({
            attributes: [
              "id",
              "org_id",
              "name",
              "email",
              "mobile",
              "standard",
              "section",
              "profile_image",
              "level",
            ],
            where: { username: username, is_deleted: null },
          });

          const organisation = await Organisation.findOne({
            where: { id: ret_user.org_id },
          });

          const data = {
            id: ret_user.id,
            org_id: ret_user.org_id,
            org_name: organisation?.org_name || null,
            org_profile: organisation?.profile_image || null,
            org_mobile: organisation?.mobile || null,
            org_email: organisation?.email || null,
            orgnsr_name: organisation?.name || null,
            name: ret_user.name,
            email: ret_user.email,
            mobile: ret_user.mobile,
            section: ret_user.section,
            level: ret_user.level,
            profile_image: ret_user.profile_image,
          };

          res.status(200).json({
            status: 200,
            message: "Login successful",
            token,
            // subjects,
            data,
          });
        } catch (error) {
          console.error("Login error:", error);
          return res
            .status(200)
            .json({ status: 500, message: "Internal server error", error });
        }
      }),
    ];

    this.logout = asyncHandler(async (req, res) => {
      const user = req.session.user;
      const update = await LoginUsers.update(
        { web_token: null },
        { where: { id: user.id } }
      );
      return res
        .status(200)
        .json({ status: 200, message: "Successfully logged out..!" });
    });
  }
}

module.exports = new AuthController();
