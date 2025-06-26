const asyncHandler = require("express-async-handler");
const { check, validationResult } = require("express-validator");
const multer = require("multer");
const User = require("../models/user");
const Subjects = require("../models/subjects");
const Topics = require("../models/topics");
const Level = require("../models/level");
const Category = require("../models/category");
const QuestionType = require("../models/questiontype");
const Questions = require("../models/questions");
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
const { data } = require("./SubtopicController");

class QuestionsController {
  constructor() {
    this.createIndex = asyncHandler(async (req, res) => {
      return res.render("admin/layout", {
        title: "Create Questions",
        content: "../admin/questions/create/index",
        url: req.originalUrl,
        baseurl: "/admin",
        homeurl: "/admin/dashboard",
      });
    });

    this.listIndex = asyncHandler(async (req, res) => {
      return res.render("admin/layout", {
        title: "Question List",
        content: "../admin/questions/list/index",
        url: req.originalUrl,
        baseurl: "/admin",
        homeurl: "/admin/dashboard",
      });
    });

    this.create = [
      (req, res, next) => {
        const uploads = getDynamicUploader("questions").any();
        uploads(req, res, function (err) {
          if (err) {
            return res.status(400).json({ status: 400, message: err.message });
          } else {
            next();
          }
        });
      },
      check("subject").notEmpty().withMessage("Subject is required"),
      check("topic").notEmpty().withMessage("Topic is required"),
      check("level").notEmpty().withMessage("Level is required"),
      check("sub_topic").notEmpty().withMessage("Subtopic is required"),
      check("question_type")
        .notEmpty()
        .withMessage("Question Type is required"),

      asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(200).json({ status: 401, errors: errors.array() });
        }

        const { subject, topic, level, sub_topic, question_type } = req.body;

        let array = [];
        try {
          array =
            typeof req.body.array === "string"
              ? JSON.parse(req.body.array)
              : req.body.array;
        } catch (err) {
          return res
            .status(200)
            .json({ status: 400, message: "Invalid array format" });
        }

        let correctData = [];

        if (question_type === 1 || question_type === "1") {
          correctData = this.#BuildStructureChoose({ array }, req.files);

          for (const value of correctData) {
            const obj = {
              subject,
              topic,
              level_id: level,
              sub_topic,
              question_type,
              data: value,
            };
            await Questions.create(obj);
          }

          return res.status(200).json({
            status: 200,
            message: "Questions created successfully",
          });
        } else if (question_type === 2 || question_type === "2") {
          await this.#BuildStructureMatch(
            { subject, topic, level, sub_topic, question_type, array },
            req.files
          );
          return res.status(200).json({
            status: 200,
            message: "Questions created successfully",
          });
        }

        return res.status(200).json({
          status: 400,
          message: "Question type is not found.",
        });
      }),
    ];

    this.list = asyncHandler(async (req, res) => {
      try {
        const { subject, topic, level, sub_topic, question_type } = req.body;

        const whereClause = {
          is_deleted: null,
        };

        if (subject) whereClause.subject = subject;
        if (topic) whereClause.topic = topic;
        if (level) whereClause.level_id = level;
        if (sub_topic) whereClause.sub_topic = sub_topic;
        if (question_type) whereClause.question_type = question_type;

        const questions = await Questions.findAll({
          where: whereClause,
          order: [["id", "desc"]],
        });

        const data = await Promise.all(
          questions.map(async (value) => {
            let question_text = "";
            let question_thumbnail = "";

            if (value.question_type === 1 || value.question_type === "1") {
              question_text = value.data?.question?.text || "";
              question_thumbnail = value.data?.question?.thumbnail || "";
            } else if (
              value.question_type === 2 ||
              value.question_type === "2"
            ) {
              question_text = value.data?.[0]?.question || "";
              question_thumbnail = "";
            }

            return {
              id: value.id,
              question_text,
              question_thumbnail: question_thumbnail
                ? `<img src="../${question_thumbnail}" alt="Thumbnail" style="width: 50px;">`
                : "-",
              action: `
            <button class='btn btn-primary btn-sm' onclick="OpenEditModal(${value.id}, ${value.question_type})">Edit</button>
            <button class='btn btn-danger btn-sm' onclick="DeleteData(${value.id})">Delete</button>
          `,
            };
          })
        );

        return res.status(200).json({ status: 200, data });
      } catch (error) {
        console.error("Questions List Error:", error);
        return res.status(500).json({
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
            .json({ status: 400, message: "Question ID is required" });
        }
        const data = await Questions.findOne({ where: { id } });
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
        const uploads = getDynamicUploader("questions").any();
        uploads(req, res, function (err) {
          if (err) {
            return res.status(400).json({ status: 400, message: err.message });
          } else {
            next();
          }
        });
      },
      check("id").notEmpty().withMessage("Id is required for update the data"),
      asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res
            .status(200)
            .json({ status: 400, message: "Id is required" });
        }
        try {
          // console.log("Body...", req.body);
          // console.log("Files...", req.files);

          const { id, question_type } = req.body;
          const question = await Questions.findByPk(id);
          if (!question) {
            return res
              .status(404)
              .json({ status: 404, message: "Question not found" });
          }
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
  }

  #BuildStructureChoose(requests, files) {
    const array = requests.array;

    const fileMap = {};
    files.forEach((file) => {
      fileMap[file.fieldname] = `uploads/questions/${path.basename(file.path)}`;
    });

    array.forEach((question, qIndex) => {
      const questionThumbnailKey = `array[${qIndex}][question][thumbnail]`;
      if (fileMap[questionThumbnailKey]) {
        question.question.thumbnail = fileMap[questionThumbnailKey];
      }

      const optionKeys = ["option_a", "option_b", "option_c", "option_d"];
      optionKeys.forEach((optKey) => {
        const optionThumbKey = `array[${qIndex}][option][${optKey}][thumbnail]`;
        if (fileMap[optionThumbKey]) {
          if (!question.option[optKey]) question.option[optKey] = {};
          question.option[optKey].thumbnail = fileMap[optionThumbKey];
        }
      });
    });

    return array;
  }

  async #BuildStructureMatch(requests, files) {
    const array = requests.array;

    const fileMap = {};
    files.forEach((file) => {
      fileMap[file.fieldname] = `uploads/questions/${path.basename(file.path)}`;
    });

    array.forEach((question, qIndex) => {
      if (qIndex !== 0) {
        const optionKeys = ["is_euqal_one", "is_euqal_two"];

        optionKeys.forEach((optKey) => {
          const optionThumbKey = `array[${qIndex}][${optKey}][thumbnail]`;

          if (fileMap[optionThumbKey]) {
            if (!question[optKey]) question[optKey] = {};
            question[optKey].thumbnail = fileMap[optionThumbKey];
          }
        });
      }
    });

    const obj = {
      subject: requests.subject,
      topic: requests.topic,
      level_id: requests.level,
      sub_topic: requests.sub_topic,
      question_type: requests.question_type,
      data: array,
    };

    await Questions.create(obj);
  }
}

module.exports = new QuestionsController();
