const asyncHandler = require("express-async-handler");
const { check, validationResult } = require("express-validator");
const multer = require("multer");
const User = require("../models/user");
const Subjects = require("../models/subjects");
const Topics = require("../models/topics");
const Level = require("../models/level");
const Category = require("../models/category");
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

class CategoryController {
  constructor() {
    this.index = asyncHandler(async (req, res) => {
      return res.render("admin/layout", {
        title: "Category",
        content: "../admin/category/index",
        url: req.originalUrl,
        baseurl: "/admin",
        homeurl: "/admin/dashboard",
      });
    });

    this.create = [
      (req, res, next) => {
        const upload = getDynamicUploader("category").single("thumbnail");
        upload(req, res, function (err) {
          if (err) {
            return res.status(200).json({ status: 400, message: err.message });
          }
          next();
        });
      },
      check("title").notEmpty().withMessage("Category is required"),
      check("type").notEmpty().withMessage("Type is required"),
      asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(200).json({ status: 401, errors: errors.array() });
        }
        try {
          const { title, type } = req.body;
          const file = req.file;
          if (!file) {
            return res
              .status(200)
              .json({ status: 400, message: "Thumbnail is required" });
          }
          const insert = await Category.create({
            title: title,
            type: type,
            thumbnail: `uploads/category/${file.filename}`,
          });
          return res.status(200).json({
            status: 200,
            message: "Category created successfully",
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
        const get = await Category.findAll({
          where: {
            is_deleted: null,
          },
          order: [["id", "DESC"]],
        });
        const data = get.map((value) => {
          return {
            id: value.id,
            title: value.title,
            type: value.type,
            thumbnail: `<img src="../${value.thumbnail}" alt="Thumbnail" style="width: 50px;">`,
            action: `
                    <button class='btn btn-primary btn-sm' onclick="OpenEditModal(${value.id})">Edit</button>
                    <button class='btn btn-danger btn-sm' onclick="DeleteData(${value.id})">Delete</button>
                  `,
          };
        });
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
            .json({ status: 400, message: "Category ID is required" });
        }
        const get = await Category.findOne({ where: { id } });
        if (!get) {
          return res
            .status(200)
            .json({ status: 400, message: "Category not found" });
        }
        await Category.update({ is_deleted: new Date() }, { where: { id } });
        return res.status(200).json({
          status: 200,
          message: "Category deleted successfully",
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
            .json({ status: 400, message: "Category ID is required" });
        }
        const data = await Category.findOne({ where: { id } });
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
      (req, res, next) => {
        const upload = getDynamicUploader("category").single("edit_thumbnail");
        upload(req, res, function (err) {
          if (err) {
            return res.status(200).json({ status: 400, message: err.message });
          }
          next();
        });
      },
      check("edit_title").notEmpty().withMessage("Category is required"),
      check("edit_type").notEmpty().withMessage("Type is required"),
      asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(200).json({ status: 401, errors: errors.array() });
        }
        try {
          const { edit_title, edit_type, edit_id } = req.body;
          const file = req.file;
          const category = await Category.findOne({ where: { id: edit_id } });
          if (!category) {
            return res
              .status(404)
              .json({ status: 404, message: "category not found" });
          }
          if (file && category.thumbnail) {
            const oldPath = path.join(
              __dirname,
              "../public",
              category.thumbnail
            );
            fs.unlink(oldPath, (err) => {
              if (err) {
                console.warn(`Old file delete warning: ${err.message}`);
              }
            });
            category.thumbnail = `uploads/category/${file.filename}`;
          }
          (category.title = edit_title), (category.type = edit_type);
          await category.save();
          return res.status(200).json({
            status: 200,
            message: "Category updated successfully",
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

module.exports = new CategoryController();
