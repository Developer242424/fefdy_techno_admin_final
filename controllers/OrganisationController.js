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

class OrganisationController {
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
        title: "Organisation",
        content: "../admin/organisation/index",
        url: req.originalUrl,
        baseurl: "/admin",
        homeurl: "/admin/dashboard",
        lvlftopic,
      });
    });

    this.create = [
      (req, res, next) => {
        const upload =
          getDynamicUploader("org_profile").single("profile_image");
        upload(req, res, function (err) {
          if (err) {
            return res.status(200).json({ status: 400, message: err.message });
          }
          next();
        });
      },
      check("org_name").notEmpty().withMessage("Organisation name is required"),
      check("name").notEmpty().withMessage("Organiser name is required"),
      check("mobile")
        .notEmpty()
        .withMessage("Mobile number is required")
        .matches(/^[6-9]\d{9}$/)
        .withMessage("Enter a valid 10-digit mobile number"),
      check("email")
        .notEmpty()
        .withMessage("Email address is required")
        .isEmail()
        .withMessage("Enter a valid email address"),
      check("subject")
        .isArray({ min: 1 })
        .withMessage("At least one subject must be selected"),
      asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(200).json({ status: 401, errors: errors.array() });
        }
        const { org_name, name, mobile, email, subject, org_details } =
          req.body;
        const file = req.file;
        if (!file) {
          return res
            .status(200)
            .json({ status: 400, message: "Thumbnail is required" });
        }
        const insert = await Organisation.create({
          org_name,
          name,
          mobile,
          email,
          subject: JSON.stringify(subject),
          profile_image: `uploads/org_profile/${file.filename}`,
        });
        // console.log("BODY:", req.body);
        // console.log("FILE:", req.file);
        // console.log("QUERY:", req.query);
        // console.log(insert.id);
        for (const value of org_details) {
          const check = await OrgDetails.findOne({
            where: {
              org_id: insert.id,
              standard: value.standard,
              section: value.section,
            },
          });

          //   console.log(insert.id);
          //   console.log(value.standard);
          //   console.log(value.section);
          //   console.log(check);

          if (!check) {
            await OrgDetails.create({
              org_id: insert.id,
              standard: value.standard,
              section: value.section,
              levels: parseInt(value.level),
              stu_count: value.student_count,
            });
          }
        }
        return res
          .status(200)
          .json({ status: 200, message: "Successfully created" });
      }),
    ];

    this.list = asyncHandler(async (req, res) => {
      const data1 = await Organisation.findAll({
        where: {
          is_deleted: null,
        },
        order: [["id", "DESC"]],
      });
      const data = await Promise.all(
        data1.map(async (value) => {
          const subjects = await Subjects.findAll({
            where: {
              id: {
                [Op.in]: JSON.parse(value.subject),
              },
            },
            attributes: ["subject"],
          });
          const subjectNames = subjects.map((sub) => sub.subject);
          const sub = subjectNames.join(", ");
          return {
            id: value.id,
            org_name: value.org_name,
            name: value.name,
            mobile: value.mobile,
            email: value.email,
            subject: value.subject,
            subject_name: sub,
            profile_image: `<img src="../${value.profile_image}" alt="Thumbnail" style="width: 50px;">`,
            action: `
              <button class='btn btn-primary btn-sm' onclick="OpenEditModal(${value.id})">Edit</button>
              <button class='btn btn-danger btn-sm' onclick="DeleteData(${value.id})">Delete</button>
            `,
          };
        })
      );
      return res.status(200).json({ status: 200, data });
    });

    this.data = asyncHandler(async (req, res) => {
      try {
        const { id } = req.body;
        if (!id) {
          return res
            .status(200)
            .json({ status: 400, message: "Organisations ID is required" });
        }
        const data = await Organisation.findOne({ where: { id } });
        const data1 = await OrgDetails.findAll({
          where: {
            org_id: id,
            is_deleted: null,
          },
        });
        return res.status(200).json({ status: 200, data, data1 });
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
          getDynamicUploader("org_profile").single("edit_profile_image");
        upload(req, res, function (err) {
          if (err) {
            return res.status(200).json({ status: 400, message: err.message });
          }
          next();
        });
      },
      check("edit_org_name")
        .notEmpty()
        .withMessage("Organisation name is required"),
      check("edit_name").notEmpty().withMessage("Organiser name is required"),
      check("edit_mobile")
        .notEmpty()
        .withMessage("Mobile number is required")
        .matches(/^[6-9]\d{9}$/)
        .withMessage("Enter a valid 10-digit mobile number"),
      check("edit_email")
        .notEmpty()
        .withMessage("Email address is required")
        .isEmail()
        .withMessage("Enter a valid email address"),
      check("edit_subject")
        .isArray({ min: 1 })
        .withMessage("At least one subject must be selected"),
      asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(200).json({ status: 401, errors: errors.array() });
        }
        try {
          const {
            edit_org_name,
            edit_name,
            edit_mobile,
            edit_email,
            edit_subject,
            edit_org_details,
            edit_id,
          } = req.body;
          const file = req.file;
          const organisation = await Organisation.findOne({
            where: { id: edit_id },
          });
          if (!organisation) {
            return res
              .status(404)
              .json({ status: 404, message: "Organisations not found" });
          }

          if (file && organisation.thumbnail) {
            // console.log(organisation.thumbnail);
            const oldPath = path.join(
              __dirname,
              "../public/",
              organisation.thumbnail
            );
            fs.unlink(oldPath, (err) => {
              if (err) {
                console.warn(`Old file delete warning: ${err.message}`);
              }
            });
            organisation.thumbnail = `uploads/org_profile/${file.filename}`;
          }
          (organisation.org_name = edit_org_name),
            (organisation.name = edit_name),
            (organisation.mobile = edit_mobile),
            (organisation.email = edit_email),
            (organisation.subject = JSON.stringify(edit_subject));
          await organisation.save();
          await OrgDetails.update(
            { is_deleted: new Date() },
            {
              where: { org_id: organisation.id },
            }
          );
          for (const value of edit_org_details) {
            if (value) {
              const check = await OrgDetails.findOne({
                where: {
                  org_id: organisation.id,
                  standard: value.standard,
                  section: value.section,
                  is_deleted: null,
                },
              });

              if (!check) {
                await OrgDetails.create({
                  org_id: organisation.id,
                  standard: value.standard,
                  section: value.section,
                  levels: parseInt(value.level),
                  stu_count: value.student_count,
                });
              }
            }
          }
          return res.status(200).json({
            status: 200,
            message: "Organisations is updated successfully",
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
            .json({ status: 400, message: "Organisation ID is required" });
        }
        const get = await Organisation.findOne({ where: { id } });
        if (!get) {
          return res
            .status(200)
            .json({ status: 400, message: "Organisation not found" });
        }

        await Organisation.update(
          { is_deleted: new Date() },
          { where: { id } }
        );
        // await OrgDetails.destroy({ where: { org_id: id } });
        await OrgDetails.update(
          { is_deleted: new Date() },
          { where: { org_id: id } }
        );
        return res.status(200).json({
          status: 200,
          message: "Organisation deleted successfully",
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

module.exports = new OrganisationController();
