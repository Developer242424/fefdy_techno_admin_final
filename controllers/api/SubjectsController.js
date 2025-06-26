const asyncHandler = require("express-async-handler");
const { check, validationResult } = require("express-validator");
const multer = require("multer");
const User = require("../../models/user");
const Subjects = require("../../models/subjects");
const Topics = require("../../models/topics");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { where, Sequelize, DATE } = require("sequelize");
const { render } = require("ejs");
require("dotenv").config();
const session = require("express-session");
const getDynamicUploader = require("../../middleware/upload");
const moment = require("moment");
const { fn } = require("sequelize");
const path = require("path");
const fs = require("fs");
const { title } = require("process");

class SubjectsController {
  constructor() {
    this.data = asyncHandler(async (req, res) => {
      const subjects = await Subjects.findAll({
        where: {
          is_deleted: null,
        },
      });

      const data = await Promise.all(
        subjects.map(async (value) => {
          const topics = await Topics.findAll({
            where: {
              subject: value.id,
              is_deleted: null,
            },
            attributes: ["id", "title"],
          });
          return {
            id: value.id,
            subject: value.subject,
            thumbnail: value.thumbnail,
            topics: topics,
          };
        })
      );
      return res.status(200).json({ status: 200, data });
    });
  }
}

module.exports = new SubjectsController();
