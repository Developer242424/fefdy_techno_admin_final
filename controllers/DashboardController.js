const asyncHandler = require("express-async-handler");
const { check, validationResult } = require("express-validator");
const multer = require("multer");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { where, Sequelize } = require("sequelize");
const { render } = require("ejs");
require("dotenv").config();

class DashboardController {
  constructor() {
    this.sample = asyncHandler(async (req, res) => {
      return res.render('admin/sample', {title: 'Sample', content: '../admin/sample', url:req.originalUrl, baseurl: "/admin", homeurl: "/admin/dashboard"});
    })

    this.index = asyncHandler(async (req, res) => {
        // return res.status(200).json({message: "Ok 123"});
      return res.render("admin/layout", {title: "Dashboard", content: "../admin/dashboard", url: req.originalUrl, baseurl: "/admin", homeurl: "/admin/dashboard"});
    });
  }
}

module.exports = new DashboardController();
