const asyncHandler = require("express-async-handler");
const { check, validationResult } = require("express-validator");
const multer = require("multer");
const User = require("../models/user");
const LoginUsers = require("../models/loginusers");
const Subjects = require("../models/subjects");
const Topics = require("../models/topics");
const Level = require("../models/level");
const Category = require("../models/category");
const QuestionType = require("../models/questiontype");
const Questions = require("../models/questions");
const TestHistory = require("../models/test_history");
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
const { data } = require("./SubtopicController");
let previouslyServedIds = new Set();

class ActivityController {
  constructor() {
    this.getQuestions = asyncHandler(async (req, res) => {
      try {
        // console.log("Body....", req.body);
        const { sid, tid, lid, stid, qid, ust } = req.body;
        const questionsData = await Questions.findAll({
          where: {
            subject: sid,
            topic: tid,
            level_id: lid,
            sub_topic: stid,
            question_type: qid,
            is_deleted: null,
            id: {
              [Op.notIn]: Array.from(previouslyServedIds),
            },
          },
          order: [Sequelize.literal("RAND()")],
          limit: 5,
          raw: true,
        });

        // questionsData.forEach((q) => previouslyServedIds.add(q.id));
        const formattedQuestions = questionsData.map((qItem) => {
          const rawData = qItem.data || {};
          const options = [];
          const correct = [];

          const optionKeys = ["option_a", "option_b", "option_c", "option_d"];

          optionKeys.forEach((key, index) => {
            const opt = rawData.option?.[key];
            if (!opt) return;

            options.push({
              text: opt.text || "",
              image: opt.thumbnail || "",
            });

            if (opt.is_answer === "on" || opt.is_answer === true) {
              correct.push(index);
            }
          });

          return {
            questionid: qItem.id || "",
            question: rawData.question?.text || "",
            image: rawData.question?.thumbnail || "",
            options,
            correct: correct.length === 1 ? [correct[0]] : correct,
          };
        });

        return res.json(formattedQuestions);
      } catch (error) {
        console.error("Error fetching random questions:", error);
        return res.status(500).json({
          message: "Internal server error",
          error,
        });
      }
    });

    this.entryHistory = asyncHandler(async (req, res) => {
      try {
        const {
          sid,
          tid,
          lid,
          stid,
          qid,
          ust,
          correctAnswers,
          wrongAnswers,
          totalTime,
          questionIds,
        } = req.body;
        console.log("Body....", req.body);
        const obj = {
          subject: sid,
          topic: tid,
          level_id: lid,
          sub_topic: stid,
          question_ids: questionIds,
          correct_ans: correctAnswers,
          wrong_ans: wrongAnswers,
          time_taken: totalTime,
        };
        console.log("obj....", obj);
        const user = await LoginUsers.findOne({
          where: {
            web_token: ust,
          },
        });
        console.log("user....", user);
      } catch (error) {
        console.error("Error fetching random questions:", error);
        return res.status(500).json({
          message: "Internal server error",
          error,
        });
      }
    });
  }
}

module.exports = new ActivityController();
