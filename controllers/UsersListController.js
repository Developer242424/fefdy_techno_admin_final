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

class UsersListController {
  constructor() {
    this.index = asyncHandler(async (req, res) => {
      const query =
        "SELECT * FROM topics WHERE levels = (SELECT MAX(levels) FROM topics)";
      let lvlftopic = null;

      try {
        const result = await sequelize.query(query, {
          type: sequelize.QueryTypes.SELECT,
        });
        lvlftopic = result[0] || { levels: 0 };
      } catch (err) {
        console.error("Query error:", err);
      }

      return res.render("admin/layout", {
        title: "UsersList",
        content: "../admin/userslist/index",
        url: req.originalUrl,
        baseurl: "/admin",
        homeurl: "/admin/dashboard",
        lvlftopic,
      });
    });

    this.create = [
      // 1. Handle file upload using multer
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

      // 2. Validations
      check("org_id").notEmpty().withMessage("Organisation is required"),
      check("name").trim().notEmpty().withMessage("Name is required"),
      check("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format"),
      check("mobile")
        .trim()
        .notEmpty()
        .withMessage("Mobile number is required")
        .isMobilePhone("any") // Added locale 'any' to avoid errors
        .withMessage("Invalid mobile number"),
      check("username").trim().notEmpty().withMessage("Username is required"),
      check("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
      check("standard").notEmpty().withMessage("Standard is required"),
      check("section").notEmpty().withMessage("Section is required"),

      // 3. Business Logic
      asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(200).json({ status: 401, errors: errors.array() });
        }

        try {
          const {
            org_id,
            name,
            email,
            mobile,
            username,
            password,
            standard,
            section,
          } = req.body;

          const file = req.file;
          if (!file) {
            return res
              .status(200)
              .json({ status: 400, message: "Profile Image is required" });
          }

          const organisation = await Organisation.findOne({
            where: { id: org_id },
          });
          if (!organisation) {
            return res
              .status(200)
              .json({ status: 404, message: "Organisation not found" });
          }

          const arr_sub = organisation.subject; // assuming `subject` is a column (already JSON if stored like that)

          const org_det = await OrgDetails.findOne({
            where: {
              org_id: org_id,
              standard: standard,
              section: section,
            },
          });

          const level = org_det?.levels ?? null;
          const users = await LoginUsers.findOne({
            where: {
              username: username,
            },
          });
          if (users) {
            return res
              .status(200)
              .json({ status: 400, message: "Username is already taken" });
          }

          const insert = await LoginUsers.create({
            org_id,
            name,
            email,
            mobile,
            username,
            password: await bcrypt.hash(password, 10),
            standard,
            section,
            profile_image: `uploads/user_profile/${file.filename}`,
            subject: arr_sub,
            level: level,
            type: "student",
          });

          return res.status(200).json({
            status: 200,
            message: "User created successfully",
            data: insert,
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

    this.list = asyncHandler(async (req, res) => {
      try {
        const users = await LoginUsers.findAll({
          where: {
            is_deleted: null,
          },
          order: [["id", "DESC"]],
        });

        const data = await Promise.all(
          users.map(async (value) => {
            let subjectIds = [];

            try {
              subjectIds = value.subject ? JSON.parse(value.subject) : [];
            } catch (err) {
              subjectIds = [];
            }

            const subjects = subjectIds.length
              ? await Subjects.findAll({
                  where: {
                    id: {
                      [Op.in]: subjectIds,
                    },
                  },
                  attributes: ["subject"],
                })
              : [];

            const subjectNames = subjects.map((sub) => sub.subject);
            const subjectLabel =
              subjectNames.length > 0 ? subjectNames.join(", ") : "-";

            const organisation = await Organisation.findOne({
              where: {
                id: value.org_id,
              },
            });

            return {
              id: value.id,
              org_name: organisation ? organisation.org_name : "-",
              name: value.name,
              mobile: value.mobile,
              email: value.email,
              subject: value.subject,
              subject_name: subjectLabel,
              type: value.type === "student" ? "Student" : "Individual",
              profile_image: `<img src="../${value.profile_image}" alt="Thumbnail" style="width: 50px;">`,
              action: `
                <button class="btn btn-primary btn-sm" onclick="${
                  value.type === "student"
                    ? `OpenEditModal(${value.id})`
                    : `IndividualOpenEditModal(${value.id})`
                }">Edit</button>
                <button class='btn btn-danger btn-sm' onclick="DeleteData(${
                  value.id
                })">Delete</button>
              `,
            };
          })
        );

        return res.status(200).json({ status: 200, data });
      } catch (error) {
        return res.status(200).json({
          status: 500,
          message: "Internal server error - " + error.message,
          error,
        });
      }
    });

    this.data = asyncHandler(async (req, res) => {
      try {
        const { id } = req.body;
        if (!id) {
          return res
            .status(200)
            .json({ status: 400, message: "User ID is required" });
        }
        const data = await LoginUsers.findOne({ where: { id } });
        return res.status(200).json({ status: 200, data });
      } catch (error) {
        console.error("Get error:", error);
        return res.status(200).json({
          status: 500,
          message: "Internal server error - " + error.message,
        });
      }
    });

    this.update = [
      (req, res, next) => {
        const upload =
          getDynamicUploader("user_profile").single("edit_profile_image");
        upload(req, res, function (err) {
          if (err) {
            return res.status(200).json({ status: 400, message: err.message });
          }
          next();
        });
      },

      check("edit_org_id").notEmpty().withMessage("Organisation is required"),
      check("edit_name").trim().notEmpty().withMessage("Name is required"),
      check("edit_email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format"),
      check("edit_mobile")
        .trim()
        .notEmpty()
        .withMessage("Mobile number is required")
        .isMobilePhone("any")
        .withMessage("Invalid mobile number"),
      check("edit_username")
        .trim()
        .notEmpty()
        .withMessage("Username is required"),
      check("edit_standard").notEmpty().withMessage("Standard is required"),
      check("edit_section").notEmpty().withMessage("Section is required"),

      asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(200).json({ status: 401, errors: errors.array() });
        }

        try {
          const {
            edit_org_id,
            edit_name,
            edit_email,
            edit_mobile,
            edit_username,
            edit_password,
            edit_standard,
            edit_section,
            edit_id,
          } = req.body;

          const file = req.file;

          const user = await LoginUsers.findOne({ where: { id: edit_id } });
          if (!user) {
            return res
              .status(404)
              .json({ status: 404, message: "User not found" });
          }

          const organisation = await Organisation.findOne({
            where: { id: edit_org_id },
          });
          if (!organisation) {
            return res
              .status(404)
              .json({ status: 404, message: "Organisation not found" });
          }

          const arr_sub = organisation.subject;

          const org_det = await OrgDetails.findOne({
            where: {
              org_id: edit_org_id,
              standard: edit_standard,
              section: edit_section,
            },
          });

          const level = org_det?.levels ?? null;

          const updateData = {
            org_id: edit_org_id,
            name: edit_name,
            email: edit_email,
            mobile: edit_mobile,
            username: edit_username,
            standard: edit_standard,
            section: edit_section,
            subject: arr_sub,
            level,
          };

          if (file) {
            updateData.profile_image = `uploads/user_profile/${file.filename}`;
          }
          if (edit_password) {
            updateData.password = await bcrypt.hash(edit_password, 10);
          }

          await LoginUsers.update(updateData, {
            where: { id: edit_id },
          });

          return res.status(200).json({
            status: 200,
            message: "User updated successfully",
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

    this.destroy = asyncHandler(async (req, res) => {
      try {
        const { id } = req.body;
        if (!id) {
          return res
            .status(200)
            .json({ status: 400, message: "User ID is required" });
        }
        const get = await LoginUsers.findOne({ where: { id } });
        if (!get) {
          return res
            .status(200)
            .json({ status: 400, message: "User not found" });
        }

        await LoginUsers.update({ is_deleted: new Date() }, { where: { id } });
        return res.status(200).json({
          status: 200,
          message: "User deleted successfully",
        });
      } catch (error) {
        return res.status(200).json({
          status: 500,
          message: "Internal server error - " + error.message,
          error,
        });
      }
    });
  }
}

module.exports = new UsersListController();
