const asyncHandler = require("express-async-handler");
const { check, validationResult } = require("express-validator");
const multer = require("multer");
const User = require("../models/user");
const Subjects = require("../models/subjects");
const Topics = require("../models/topics");
const Level = require("../models/level");
const Subtopic = require("../models/subtopic");
const CategoryData = require("../models/categorydata");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { where, Sequelize, DATE, Op } = require("sequelize");
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

class SubtopicController {
  constructor() {
    this.index = asyncHandler(async (req, res) => {
      const category = await Category.findAll({
        where: {
          is_deleted: null,
        },
        order: [["id", "ASC"]],
      });
      return res.render("admin/subtopic", {
        title: "subtopic",
        content: "../admin/subtopic/index",
        url: req.originalUrl,
        baseurl: "/admin",
        homeurl: "/admin/dashboard",
        category: category,
      });
    });

    this.create = [
      (req, res, next) => {
        const upload = getDynamicUploader("subtopics").any();
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
      check("category").notEmpty().withMessage("Category is required"),
      check("description")
        .notEmpty()
        .withMessage("Description is required")
        .bail()
        .isLength({ min: 3 })
        .withMessage("Description must be at least 3 characters long"),
      asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(200).json({ status: 401, errors: errors.array() });
        }

        try {
          const {
            subject,
            topic,
            level,
            title,
            category_data,
            description,
            category,
          } = req.body;
          const parsedCategoryData =
            typeof category_data === "string"
              ? JSON.parse(category_data)
              : category_data;

          const thumbnail = req.files.find(
            (file) => file.fieldname === "thumbnail"
          );
          if (!thumbnail) {
            return res.status(200).json({
              status: 400,
              message: "Thumbnail is required.",
            });
          }

          const subtopic = await Subtopic.create({
            subject: subject,
            topic: topic,
            level_id: level,
            category: JSON.stringify(category),
            title,
            description,
            thumbnail: `uploads/subtopics/${
              thumbnail ? thumbnail.filename : null
            }`,
          });

          let cat_dt_ids = [];
          if (parsedCategoryData?.file) {
            for (const key in parsedCategoryData.file) {
              const item = parsedCategoryData.file[key];
              const fieldName = `category_data[file][${key}][data]`;

              const file = req.files.find((f) => f.fieldname === fieldName);
              const category_data = await Category.findOne({
                where: { id: item.cat_id },
              });

              if (file) {
                const insert = await CategoryData.create({
                  subtopic: subtopic.id,
                  category: item.cat_id,
                  type: category_data.type,
                  source: `uploads/subtopics/${file.filename}`,
                });
                cat_dt_ids.push(insert.id);
              }
            }
          }

          if (parsedCategoryData?.text) {
            for (const key in parsedCategoryData.text) {
              const item = parsedCategoryData.text[key];
              const category_data = await Category.findOne({
                where: { id: item.cat_id },
              });
              const insert1 = await CategoryData.create({
                subtopic: subtopic.id,
                category: item.cat_id,
                type: category_data.type,
                source: item.data,
              });
              cat_dt_ids.push(insert1.id);
            }
          }
          subtopic.cat_data_ids = JSON.stringify(cat_dt_ids);
          await subtopic.save();

          return res.status(200).json({
            status: 200,
            message: "Subtopic created successfully",
          });
        } catch (error) {
          console.error("Create Subtopic Error:", error);
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
        const subtopics = await Subtopic.findAll({
          where: {
            is_deleted: null,
          },
          order: [["id", "desc"]],
        });

        const data = await Promise.all(
          subtopics.map(async (value) => {
            const subject = await Subjects.findOne({
              where: { id: value.subject },
              attributes: ["subject"],
            });
            const topic = await Topics.findOne({
              where: { id: value.topic },
              attributes: ["title"],
            });
            const level = await Level.findOne({
              where: { id: value.level_id },
              attributes: ["title"],
            });
            return {
              id: value.id,
              subject_name: subject.subject,
              topic_name: topic.title,
              level_name: level.title,
              title: value.title,
              description: value.description,
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
        console.error("Create Subtopic Error:", error);
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
        const data = await Subtopic.findOne({ where: { id } });
        return res.status(200).json({ status: 200, data });
      } catch (error) {
        console.error("Create Subtopic Error:", error);
        return res.status(200).json({
          status: 500,
          message: "Internal server error - " + error.message,
          error,
        });
      }
    });

    this.update = [
      (req, res, next) => {
        const upload = getDynamicUploader("subtopics").any();
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
        .withMessage("Subject must be numeric"),

      check("edit_topic").notEmpty().withMessage("Topic is required"),

      check("edit_level")
        .notEmpty()
        .withMessage("Level is required")
        .bail()
        .isNumeric()
        .withMessage("Level must be numeric"),

      check("edit_title")
        .notEmpty()
        .withMessage("Title is required")
        .bail()
        .isLength({ min: 3 })
        .withMessage("Title must be at least 3 characters long"),

      check("edit_category").notEmpty().withMessage("Category is required"),

      check("edit_description")
        .notEmpty()
        .withMessage("Description is required")
        .bail()
        .isLength({ min: 3 })
        .withMessage("Description must be at least 3 characters long"),

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
            edit_category_data,
            edit_description,
            edit_category,
            edit_id,
          } = req.body;

          const existingSubtopic = await Subtopic.findOne({
            where: { id: edit_id },
          });
          if (!existingSubtopic) {
            return res
              .status(404)
              .json({ status: 404, message: "Subtopic not found" });
          }

          const parsedCategoryData =
            typeof edit_category_data === "string"
              ? JSON.parse(edit_category_data)
              : edit_category_data;

          const thumbnail = req.files.find(
            (file) => file.fieldname === "edit_thumbnail"
          );

          if (thumbnail) {
            const oldPath = path.join(
              __dirname,
              "../public",
              existingSubtopic.thumbnail
            );
            fs.unlink(oldPath, (err) => {
              if (err)
                console.warn(`Old thumbnail delete warning: ${err.message}`);
            });
            existingSubtopic.thumbnail = `uploads/subtopics/${thumbnail.filename}`;
          }

          await Subtopic.update(
            {
              subject: edit_subject,
              topic: edit_topic,
              level_id: edit_level,
              category: JSON.stringify(edit_category),
              title: edit_title,
              description: edit_description,
              thumbnail: existingSubtopic.thumbnail || null,
            },
            { where: { id: edit_id } }
          );

          // --- File CategoryData ---
          if (parsedCategoryData?.file) {
            for (const key in parsedCategoryData.file) {
              const item = parsedCategoryData.file[key];
              const fieldName = `edit_category_data[file][${key}][data]`;

              const file = req.files.find((f) => f.fieldname === fieldName);

              const categoryData = await CategoryData.findOne({
                where: { id: item.id },
              });
              if (!categoryData) continue;

              if (file) {
                // Delete old file
                if (categoryData.source) {
                  const oldFilePath = path.join(
                    __dirname,
                    "../public",
                    categoryData.source
                  );
                  fs.unlink(oldFilePath, (err) => {
                    if (err)
                      console.warn(
                        `Old category file delete warning: ${err.message}`
                      );
                  });
                }

                await CategoryData.update(
                  { source: `uploads/subtopics/${file.filename}` },
                  { where: { id: item.id } }
                );
              }
            }
          }

          // --- Text CategoryData (e.g., video links) ---
          if (parsedCategoryData?.text) {
            for (const key in parsedCategoryData.text) {
              const item = parsedCategoryData.text[key];
              await CategoryData.update(
                { source: item.data },
                { where: { id: item.id } }
              );
            }
          }

          return res.status(200).json({
            status: 200,
            message: "Subtopic updated successfully",
          });
        } catch (error) {
          console.error("Update Subtopic Error:", error);
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
            .json({ status: 400, message: "Subtopic ID is required" });
        }
        const get = await Subtopic.findOne({ where: { id } });
        if (!get) {
          return res
            .status(200)
            .json({ status: 400, message: "Level not found" });
        }
        await Subtopic.update({ is_deleted: new Date() }, { where: { id } });
        await CategoryData.update(
          { is_deleted: new Date() },
          { where: { subtopic: id } }
        );
        return res.status(200).json({
          status: 200,
          message: "Subtopic deleted successfully",
        });
      } catch (error) {
        console.error("Update Subtopic Error:", error);
        return res.status(200).json({
          status: 500,
          message: "Internal server error - " + error.message,
          error,
        });
      }
    });
  }

  createFormGenerate = asyncHandler(async (req, res) => {
    try {
      const { id } = req.body;

      if (!Array.isArray(id) || id.length === 0) {
        return res
          .status(400)
          .json({ status: 400, message: "Invalid category IDs." });
      }

      const category = await Category.findAll({
        where: {
          id: {
            [Op.in]: id,
          },
        },
      });

      let html = `<div class="row">`;

      category.forEach((value, key) => {
        const catType = value.type?.toLowerCase();
        const catId = value.id;
        const catTitle = value.title;

        if (catType === "pdf" || catType === "image") {
          html += `<div class="col-sm-4">
                    <div class="form-group">
                        <label for="file_input">${catTitle}</label>
                        <input type="hidden" name="category_data[file][${key}][cat_id]" id="category_data_id_${catId}" value="${catId}">
                        <input type="file" name="category_data[file][${key}][data]" id="category_data_${catId}" class="form-control">
                    </div>
                </div>`;
        } else if (catType === "video") {
          html += `<div class="col-sm-4">
                    <div class="form-group">
                        <label for="file_input">${catTitle}</label>
                        <input type="hidden" name="category_data[text][${key}][cat_id]" id="category_data_id_${catId}" value="${catId}">
                        <input type="text" placeholder="Enter Video URL" name="category_data[text][${key}][data]" id="category_data_${catId}" class="form-control">
                    </div>
                </div>`;
        }
      });

      html += `</div>`;

      return res.status(200).json({ status: 200, data: html });
    } catch (error) {
      console.error("createFormGenerate Error:", error);
      return res
        .status(500)
        .json({ status: 500, message: "Internal server error" });
    }
  });

  editFormGenerate = asyncHandler(async (req, res) => {
    let { id, subtopic_id } = req.body;

    // Ensure 'id' is always an array
    if (!Array.isArray(id)) {
      try {
        id = JSON.parse(id);
        if (!Array.isArray(id)) id = [];
      } catch (e) {
        id = [];
      }
    }

    const category = await Category.findAll({
      where: {
        id: {
          [Op.in]: id,
        },
      },
    });

    const subtopic = await Subtopic.findOne({ where: { id: subtopic_id } });

    let subtopicCats = [];
    try {
      subtopicCats = JSON.parse(subtopic.category || "[]");
    } catch (e) {
      subtopicCats = [];
    }

    if (id.length > subtopicCats.length) {
      await this.addCategoryData(subtopic, id);
    }
    if (id.length < subtopicCats.length) {
      await this.removeCategoryData(subtopic, id);
    }

    let html = `<div class="row">`;

    for (const [key, value] of category.entries()) {
      const catType = value.type.toLowerCase();

      const cat_data = await CategoryData.findOne({
        where: {
          subtopic: subtopic_id,
          category: value.id,
          is_deleted: null,
        },
      });

      if (catType === "pdf" || catType === "image") {
        html += `<div class="col-sm-4">
                  <div class="form-group">
                    <label for="file_input">${value.title}</label>
                    <input type="hidden" name="edit_category_data[file][${key}][id]" id="edit_category_data_id_${
          value.id
        }" value="${cat_data?.id || ""}">
                    <input type="file" name="edit_category_data[file][${key}][data]" id="edit_category_data_${
          value.id
        }" class="form-control">
                    ${
                      cat_data?.source
                        ? `<a href="../${cat_data.source}" target="_blank">View file...</a>`
                        : ""
                    }
                  </div>
                </div>`;
      } else if (catType === "video") {
        html += `<div class="col-sm-4">
                  <div class="form-group">
                    <label for="file_input">${value.title}</label>
                    <input type="hidden" name="edit_category_data[text][${key}][id]" id="edit_category_data_id_${
          value.id
        }" value="${cat_data?.id || ""}">
                    <input type="text" placeholder="Enter Video URL" name="edit_category_data[text][${key}][data]" id="edit_category_data_${
          value.id
        }" class="form-control" value="${cat_data?.source || ""}">
                  </div>
                </div>`;
      }
    }

    html += `</div>`;

    return res.status(200).json({ status: 200, data: html });
  });

  addCategoryData = async (subtopic, selectedIds) => {
    try {
      const selectedCats = selectedIds || [];
      const oldcatArr = JSON.parse(subtopic.category || "[]");

      const differenceIds = selectedCats.filter(
        (id) => !oldcatArr.includes(id)
      );
      const refreshedCategories = [...oldcatArr, ...differenceIds];

      for (const value of differenceIds) {
        const category = await Category.findOne({ where: { id: value } });
        if (category) {
          await CategoryData.create({
            subtopic: subtopic.id,
            category: value,
            type: category.type,
          });
        }
      }

      const catDataRecords = await CategoryData.findAll({
        where: {
          subtopic: subtopic.id,
          is_deleted: null,
        },
        attributes: ["id"],
        raw: true,
      });

      const catDataIds = catDataRecords.map((item) => item.id);
      subtopic.cat_data_ids = JSON.stringify(catDataIds);
      subtopic.category = JSON.stringify(refreshedCategories);
      await subtopic.save();

      // console.log("Updated Categories:", catDataIds);
    } catch (error) {
      console.error("addCategoryData Error:", error);
      throw error;
    }
  };

  removeCategoryData = async (subtopic, selectedIds) => {
    try {
      const selectedCats = selectedIds || [];
      const oldcatArr = JSON.parse(subtopic.category || "[]");

      const differenceIds = oldcatArr.filter(
        (id) => !selectedCats.includes(id)
      );
      const newcatArr = oldcatArr.filter((id) => selectedCats.includes(id));
      for (const value of differenceIds) {
        await CategoryData.update(
          { is_deleted: new Date() },
          {
            where: {
              category: value,
              subtopic: subtopic.id,
            },
          }
        );
      }

      const catDataIds = (
        await CategoryData.findAll({
          where: {
            subtopic: subtopic.id,
            is_deleted: null,
          },
          attributes: ["id"],
          raw: true,
        })
      ).map((item) => item.id);

      subtopic.cat_data_ids = JSON.stringify(catDataIds);
      subtopic.category = JSON.stringify(newcatArr);
      await subtopic.save();
    } catch (error) {
      console.error("removeCategoryData Error:", error);
      throw error;
    }
  };
}

module.exports = new SubtopicController();
