const asyncHandler = require("express-async-handler");
const { check, validationResult } = require("express-validator");
const multer = require("multer");
const User = require("../models/user");
const Subjects = require("../models/subjects");
const Topics = require("../models/topics");
const Level = require("../models/level");
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

class LevelController {
  constructor() {
    this.index = asyncHandler(async (req, res) => {
      const subjects = await Subjects.findAll({
        where: {
          is_deleted: null,
        },
        order: [["id", "ASC"]],
      });
      const topics = await Topics.findAll({
        where: {
          is_deleted: null,
        },
        order: [["id", "ASC"]],
      });
      return res.render("admin/layout", {
        title: "Levels",
        content: "../admin/levels/index",
        url: req.originalUrl,
        baseurl: "/admin",
        homeurl: "/admin/dashboard",
        subjects: subjects,
        topics: topics,
      });
    });

    this.create = [
      (req, res, next) => {
        const upload = getDynamicUploader("levels").single("thumbnail");
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
      check("topic").notEmpty().withMessage("Topic is required"),
      check("level")
        .notEmpty()
        .withMessage("Level is required")
        .bail()
        .isNumeric()
        .withMessage("Level is need to be numeric"),
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
          const { subject, topic, level, title, description, sort_order } =
            req.body;
          const file = req.file;
          if (!file) {
            return res
              .status(200)
              .json({ status: 400, message: "Thumbnail is required" });
          }
          const insert = await Level.create({
            subject: subject,
            topic: topic,
            level: level,
            title: title,
            description: description,
            thumbnail: `uploads/levels/${file.filename}`,
            sort_order: sort_order,
          });
          return res.status(200).json({
            status: 200,
            message: "Level is created successfully",
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
        const levels = await Level.findAll({
          where: {
            is_deleted: null,
          },
          order: [["id", "DESC"]],
        });

        const data = await Promise.all(
          levels.map(async (value) => {
            const subject = await Subjects.findOne({
              where: { id: value.subject },
              attributes: ["subject"],
            });
            const topic = await Topics.findOne({
              where: { id: value.topic },
              attributes: ["title"],
            });

            return {
              id: value.id,
              subject: value.subject,
              subject_name: subject ? subject.subject : "",
              topic: value.topic,
              topic_name: topic ? topic.title : "",
              title: value.title,
              description: value.description,
              level: value.level ? value.level : "-",
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
            .json({ status: 400, message: "Level ID is required" });
        }
        const get = await Level.findOne({ where: { id } });
        if (!get) {
          return res
            .status(200)
            .json({ status: 400, message: "Level not found" });
        }
        await Level.update({ is_deleted: new Date() }, { where: { id } });
        return res.status(200).json({
          status: 200,
          message: "Level deleted successfully",
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
            .json({ status: 400, message: "Level ID is required" });
        }
        const data = await Level.findOne({ where: { id } });
        const topic = await Topics.findOne({ where: { id: data.topic } });
        return res.status(200).json({ status: 200, data, topic });
      } catch (error) {
        return res.status(200).json({
          status: 500,
          message: "Internal server error - " + error.message,
          error,
        });
      }
    });

    this.update = [
      (req, res, next) => {
        const upload = getDynamicUploader("levels").single("edit_thumbnail");
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
      check("edit_topic").notEmpty().withMessage("Topic is required"),
      check("edit_level")
        .notEmpty()
        .withMessage("Level is required")
        .bail()
        .isNumeric()
        .withMessage("Level is need to be numeric"),
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
            edit_topic,
            edit_level,
            edit_title,
            edit_description,
            edit_id,
            edit_sort_order,
          } = req.body;
          const file = req.file;
          const level = await Level.findOne({ where: { id: edit_id } });
          if (!level) {
            return res
              .status(404)
              .json({ status: 404, message: "Level not found" });
          }
          if (file && level.thumbnail) {
            const oldPath = path.join(__dirname, "../public", level.thumbnail);
            fs.unlink(oldPath, (err) => {
              if (err) {
                console.warn(`Old file delete warning: ${err.message}`);
              }
            });
            level.thumbnail = `uploads/levels/${file.filename}`;
          } else {
            console.warn(`Failed to delete old image`);
          }
          (level.subject = edit_subject),
            (level.topic = edit_topic),
            (level.level = edit_level),
            (level.title = edit_title),
            (level.description = edit_description);

          await level.save();
          return res.status(200).json({
            status: 200,
            message: "Level is updated successfully",
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

module.exports = new LevelController();
