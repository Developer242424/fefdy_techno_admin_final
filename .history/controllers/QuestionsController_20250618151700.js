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
          return res.status(401).json({ status: 422, errors: errors.array() });
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
            .status(400)
            .json({ status: 400, message: "Invalid array format" });
        }

        const correctData = this.#BuildStructureChoose({ array }, req.files);

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
      }),
    ];
  }

  #BuildStructureChoose(requests, files) {
    const array = requests.array;

    const fileMap = {};
    files.forEach((file) => {
      fileMap[file.fieldname] = file.path;
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
}

module.exports = new QuestionsController();
