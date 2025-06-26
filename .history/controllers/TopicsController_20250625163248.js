const asyncHandler = require("express-async-handler");
const { check, validationResult } = require("express-validator");
const multer = require("multer");
const User = require("../models/user");
const Subjects = require("../models/subjects");
const Topics = require("../models/topics");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { where, Sequelize, DATE } = require("sequelize");
const { render } = require("ejs");
require("dotenv").config();
const session = require("express-session");
const getDynamicUploader = require("../middleware/upload");
const moment = require("moment");
const { fn } = require("sequelize");
const path = require("path");
const fs = require("fs");
const { title } = require("process");

class TopicsController {
  constructor() {
    this.index = asyncHandler(async (req, res) => {
      const subjects = await Subjects.findAll({
        where: {
          is_deleted: null,
        },
        order: [["id", "ASC"]],
      });
      return res.render("admin/layout", {
        title: "Topics",
        content: "../admin/topics/index",
        url: req.originalUrl,
        baseurl: "/admin",
        homeurl: "/admin/dashboard",
        subjects: subjects,
      });
    });

    this.create = [
      (req, res, next) => {
        const upload = getDynamicUploader("topics").single("thumbnail");
        upload(req, res, function (err) {
          if (err) {
            return res.status(200).json({ status: 400, message: err.message });
          }
          next();
        });
      },
      check("subject")
        .notEmpty()
        .withMessage("Subject is required")
        .bail()
        .isNumeric()
        .withMessage("Subject is need to be numeric"),
      check("title")
        .notEmpty()
        .withMessage("Title is required")
        .bail()
        .isLength({ min: 3 })
        .withMessage("Title must be at least 3 characters long"),
      check("description")
        .notEmpty()
        .withMessage("Description is required")
        .bail()
        .isLength({ min: 3 })
        .withMessage("Description must be at least 3 characters long"),
      check("levels")
        .notEmpty()
        .withMessage("Levels is required")
        .bail()
        .isNumeric()
        .withMessage("Levels is need to be numeric"),
      check("sort_order")
        .notEmpty()
        .withMessage("Sort Order is required")
        .bail()
        .isNumeric()
        .withMessage("Sort Order is need to be numeric"),

      asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(200).json({ status: 401, errors: errors.array() });
        }

        try {
          const { subject, title, description, levels, sort_order } = req.body;
          const file = req.file;

          if (!file) {
            return res
              .status(200)
              .json({ status: 400, message: "Thumbnail is required" });
          }

          const insert = await Topics.create({
            subject: subject,
            title: title,
            description: description,
            levels: levels,
            sort_order: sort_order,
            thumbnail: `uploads/topics/${file.filename}`,
          });
          return res.status(200).json({
            status: 200,
            message: "Topic is created successfully",
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
        const topics = await Topics.findAll({
          where: {
            is_deleted: null,
          },
          order: [["id", "DESC"]],
        });

        const data = await Promise.all(
          topics.map(async (value) => {
            const subject = await Subjects.findOne({
              where: { id: value.subject },
              attributes: ["subject"],
            });

            return {
              id: value.id,
              title: value.title,
              subject: value.subject,
              subject_name: subject ? subject.subject : "",
              description: value.description,
              levels: value.levels ? value.levels : "-",
              thumbnail: `<img src="../${value.thumbnail}" alt="Thumbnail" style="width: 50px;">`,
              action: `
                  <button class='btn btn-primary btn-sm' onclick="OpenEditModal(${value.id})">Edit</button>
                  <button class='btn btn-danger btn-sm' onclick="DeleteData(${value.id})">Delete</button>
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

    this.destroy = asyncHandler(async (req, res) => {
      try {
        const { id } = req.body;
        if (!id) {
          return res
            .status(200)
            .json({ status: 400, message: "Topic ID is required" });
        }
        const get = await Topics.findOne({ where: { id } });
        if (!get) {
          return res
            .status(200)
            .json({ status: 400, message: "Topic not found" });
        }

        await Topics.update({ is_deleted: new Date() }, { where: { id } });
        return res.status(200).json({
          status: 200,
          message: "Topic deleted successfully",
        });
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
            .json({ status: 400, message: "Topic ID is required" });
        }
        const data = await Topics.findOne({ where: { id } });
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
        const upload = getDynamicUploader("topics").single("edit_thumbnail");
        upload(req, res, function (err) {
          if (err) {
            return res.status(200).json({ status: 400, message: err.message });
          }
          next();
        });
      },
      check("edit_subject")
        .notEmpty()
        .withMessage("Subject is required")
        .bail()
        .isNumeric()
        .withMessage("Subject is need to be numeric"),
      check("edit_title")
        .notEmpty()
        .withMessage("Title is required")
        .bail()
        .isLength({ min: 3 })
        .withMessage("Title must be at least 3 characters long"),
      check("edit_description")
        .notEmpty()
        .withMessage("Description is required")
        .bail()
        .isLength({ min: 3 })
        .withMessage("Description must be at least 3 characters long"),
      check("edit_levels")
        .notEmpty()
        .withMessage("Levels is required")
        .bail()
        .isNumeric()
        .withMessage("Levels is need to be numeric"),
      check("edit_sort_order")
        .notEmpty()
        .withMessage("Sort Order is required")
        .bail()
        .isNumeric()
        .withMessage("Sort Order is need to be numeric"),

      asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(200).json({ status: 401, errors: errors.array() });
        }

        try {
          const {
            edit_subject,
            edit_title,
            edit_description,
            edit_id,
            edit_levels,
            edit_sort_order
          } = req.body;
          const file = req.file;

          const topic = await Topics.findOne({ where: { id: edit_id } });
          if (!topic) {
            return res
              .status(404)
              .json({ status: 404, message: "Topic not found" });
          }

          if (file && topic.thumbnail) {
            // console.log(topic.thumbnail);
            const oldPath = path.join(__dirname, "../public/", topic.thumbnail);
            fs.unlink(oldPath, (err) => {
              if (err) {
                console.warn(`Old file delete warning: ${err.message}`);
              }
            });
            topic.thumbnail = `uploads/topics/${file.filename}`;
          }

          (topic.subject = edit_subject),
            (topic.title = edit_title),
            (topic.description = edit_description),
            (topic.levels = edit_levels);
            (topic.sort_order = edit_sort_order);

          await topic.save();

          return res.status(200).json({
            status: 200,
            message: "Topic is updated successfully",
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

module.exports = new TopicsController();
