const asyncHandler = require("express-async-handler");
const { check, validationResult } = require("express-validator");
const multer = require("multer");
const User = require("../models/user");
const Subjects = require("../models/subjects");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { where, Sequelize } = require("sequelize");
const { render } = require("ejs");
require("dotenv").config();
const session = require("express-session");
const getDynamicUploader = require("../middleware/upload");
const moment = require("moment");
const { fn } = require("sequelize");
const path = require('path');
const fs = require('fs');

class SubjectsController {
  constructor() {
    this.index = asyncHandler(async (req, res) => {
      return res.render("admin/layout", {
        title: "Subjects",
        content: "../admin/subject/index",
        url: req.originalUrl,
        baseurl: "/admin",
        homeurl: "/admin/dashboard",
      });
    });

    this.create = [
      (req, res, next) => {
        const upload = getDynamicUploader("subjects").single("thumbnail");
        upload(req, res, function (err) {
          if (err) {
            return res.status(200).json({ status: 400, message: err.message });
          }
          next();
        });
      },

      check("subject").notEmpty().withMessage("Subject is required"),

      asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(200).json({ status: 401, errors: errors.array() });
        }

        try {
          const { subject } = req.body;
          const file = req.file;

          if (!file) {
            return res
              .status(200)
              .json({ status: 400, message: "Thumbnail is required" });
          }
          const insert = await Subjects.create({
            subject: subject,
            thumbnail: `uploads/subjects/${file.filename}`,
          });
          return res.status(200).json({
            status: 200,
            message: "Subject created successfully",
            data: {
              subject,
              thumbnail: `uploads/subjects/${file.filename}`,
            },
          });
        } catch (error) {
          return res.status(200).json({
            status: 500,
            message: "Internal server error" + error.message,
            error,
          });
        }
      }),
    ];

    this.list = asyncHandler(async (req, res) => {
      try {
        const get = await Subjects.findAll({
          where: {
            is_deleted: null,
          },
          order: [["id", "DESC"]],
        });

        // if (get.length === 0) {
        //   return res
        //     .status(200)
        //     .json({ status: 400, message: "Data Not found", data: [] });
        // }

        const data = get.map((value) => {
          return {
            id: value.id,
            subject: value.subject,
            thumbnail: `<img src="../${value.thumbnail}" alt="Thumbnail" style="width: 50px;">`,
            action: `<button class='btn btn-primary btn-sm' onclick="OpenEditModal(${value.id})">Edit</button> <button class='btn btn-danger btn-sm' onclick="DeleteData(${value.id})">Delete</button>`,
          };
        });

        return res.status(200).json({ status: 200, data });
      } catch (error) {
        return res.status(200).json({
          status: 500,
          message: "Internal server error - " + error.message,
        });
      }
    });

    this.destroy = asyncHandler(async (req, res) => {
      try {
        const { id } = req.body;

        if (!id) {
          return res
            .status(200)
            .json({ status: 400, message: "Subject ID is required" });
        }

        const subject = await Subjects.findOne({ where: { id } });

        if (!subject) {
          return res
            .status(200)
            .json({ status: 400, message: "Subject not found" });
        }

        // Soft delete
        // console.log(new Date())
        await Subjects.update({ is_deleted: new Date() }, { where: { id } });
        // await Subjects.destroy({ where: { id } });

        return res.status(200).json({
          status: 200,
          message: "Subject deleted successfully",
        });
      } catch (error) {
        console.error("Delete error:", error);
        return res.status(200).json({
          status: 500,
          message: "Internal server error - " + error.message,
        });
      }
    });

    this.data = asyncHandler(async (req, res) => {
      try {
        const { id } = req.body;
        if (!id) {
          return res
            .status(200)
            .json({ status: 400, message: "Subject ID is required" });
        }
        const data = await Subjects.findOne({ where: { id } });
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
      // 1. Handle file upload
      (req, res, next) => {
        const upload = getDynamicUploader("subjects").single("edit_thumbnail");
        upload(req, res, function (err) {
          if (err) {
            return res.status(200).json({ status: 400, message: err.message });
          }
          next();
        });
      },

      // 2. Validate input
      check("edit_subject").notEmpty().withMessage("Subject is required"),
      check("edit_id").notEmpty().withMessage("Subject id is required"),

      // 3. Handle update logic
      asyncHandler(async (req, res) => {
        const { edit_subject, edit_id } = req.body;
        const file = req.file;

        // Get subject by ID
        const subject = await Subjects.findOne({ where: { id : edit_id } });
        if (!subject) {
          return res
            .status(404)
            .json({ status: 404, message: "Subject not found" });
        }

        // If there's a new file, delete the old one
        if (file && subject.thumbnail) {
          // console.log(subject.thumbnail)
          const oldPath = path.join(
            __dirname,
            "../public/",
            subject.thumbnail
          );
          fs.unlink(oldPath, (err) => {
            if (err) {
              console.warn(`Old file delete warning: ${err.message}`);
            }
          });
          subject.thumbnail = `uploads/subjects/${file.filename}`
        }

        // Update subject fields
        subject.subject = edit_subject;

        // Save updated subject
        await subject.save();

        return res
          .status(200)
          .json({ status: 200, message: "Successfully updated" });
      }),
    ];
  }
}

module.exports = new SubjectsController();
