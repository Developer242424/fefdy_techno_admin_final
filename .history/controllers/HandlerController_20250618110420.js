const asyncHandler = require("express-async-handler");
const { check, validationResult } = require("express-validator");
const multer = require("multer");
const User = require("../models/user");
const Subjects = require("../models/subjects");
const Topics = require("../models/topics");
const Level = require("../models/level");
const Standards = require("../models/standards");
const Organisation = require("../models/organisation");
const QuestionType = require("../models/questiontype");
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

class HandlerController {
  constructor() {
    this.getSubjectForDrop = asyncHandler(async (req, res) => {
      const data = await Subjects.findAll({
        where: {
          is_deleted: null,
        },
        order: [["id", "ASC"]],
      });
      return res.status(200).json({ status: 200, data });
    });

    this.getTopicBySubjectForDrop = asyncHandler(async (req, res) => {
      const { id } = req.body;
      const data = await Topics.findAll({
        where: {
          is_deleted: null,
          subject: id,
        },
        order: [["id", "ASC"]],
      });
      return res.status(200).json({ status: 200, data });
    });

    this.getLevelCountForDrop = asyncHandler(async (req, res) => {
      try {
        const { id } = req.body;
        if (!id) {
          return res
            .status(200)
            .json({ status: 400, message: "Topic ID is required." });
        }
        const data = await Topics.findOne({
          where: {
            id: id,
            is_deleted: null,
          },
        });
        if (!data) {
          return res
            .status(200)
            .json({ status: 400, message: "Topic not found." });
        }
        return res
          .status(200)
          .json({ status: 200, levelCount: parseInt(data.levels) || 0 });
      } catch (error) {
        return res.status(500).json({
          status: 500,
          message: "Internal server error",
          error: error.message,
        });
      }
    });

    this.getLevelsByTopicForDrop = asyncHandler(async (req, res) => {
      const { id } = req.body;
      const data = await Level.findAll({
        where: {
          is_deleted: null,
          topic: id,
        },
        order: [["id", "ASC"]],
      });
      return res.status(200).json({ status: 200, data });
    });

    this.getStandardsForDrop = asyncHandler(async (req, res) => {
      const data = await Standards.findAll({
        where: {
          is_deleted: null,
        },
        order: [["id", "ASC"]],
      });
      return res.status(200).json({ status: 200, data });
    });

    this.getOrganisationsForDrop = asyncHandler(async (req, res) => {
      const data = await Organisation.findAll({
        where: {
          is_deleted: null,
        },
        order: [["id", "ASC"]],
      });
      return res.status(200).json({ status: 200, data });
    });

    this.getQuestionTypesForDrop = asyncHandler(async (req, res) => {
      const data = await QuestionType.findAll({
        where: {
          is_deleted: null,
        },
        order: [["id", "ASC"]],
      });
      return res.status(200).json({ status: 200, data });
    });
  }
}

module.exports = new HandlerController();
