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

class ActivityController {
  constructor() {
    this.getQuestions = asyncHandler(async (req, res) => {
      const questions = Questions.findAll({
        where: {
          subject: 1,
          topic: 1,
          level_id: 1,
          sub_topic: 1,
          question_type: 1,
          is_deleted: null,
        },
      });
      return res.json(questions);
    });
  }
}
