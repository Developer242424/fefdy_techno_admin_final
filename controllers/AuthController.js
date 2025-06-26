const asyncHandler = require("express-async-handler");
const { check, validationResult } = require("express-validator");
const multer = require("multer");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { where, Sequelize } = require("sequelize");
const { render } = require("ejs");
require("dotenv").config();
const session = require("express-session");
const crypto = require("crypto");

// Multer setup (No file upload, just parsing form-data fields)
const upload = multer().none(); // No file, just form fields

class AuthController {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || "defaultsecret";

    this.loginindex = asyncHandler(async (req, res) => {
      if (req.session && req.session.token) {
        return res.redirect("/admin/dashboard");
      }
      res.render("admin/login", {
        title: "Login Page",
        error: null,
        url: req.originalUrl,
        homeurl: req.protocol + "://" + req.get("host"),
        layout: false,
      });
    });

    this.login = [
      upload, // Middleware to parse FormData
      check("username")
        .trim()
        .notEmpty()
        .withMessage("Username is required")
        .bail()
        .isAlphanumeric()
        .withMessage("Username must be alphanumeric")
        .isLength({ min: 3, max: 20 })
        .withMessage("Username must be between 3 to 20 characters"),

      check("password")
        .notEmpty()
        .withMessage("Password is required")
        .bail()
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),

      asyncHandler(async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(200).json({ status: 401, errors: errors.array() });
        }

        try {
          const { username, password } = req.body;

          const user = await User.findOne({
            attributes: ["user_id", "username", "password", "entered_at"],
            where: { username: username, is_deleted: null },
          });

          if (!user) {
            return res
              .status(200)
              .json({ status: 400, message: "User not found" });
          }

          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) {
            return res
              .status(200)
              .json({ status: 400, message: "Invalid credentials" });
          }

          const ret_user = await User.findOne({
            attributes: [
              "user_id",
              "username",
              "password",
              [
                Sequelize.fn(
                  "DATE_FORMAT",
                  Sequelize.col("entered_at"),
                  "%Y-%m-%d %H:%i %p %a"
                ),
                "entered_at",
              ],
            ],
            where: { username: username, is_deleted: null },
          });
          if (!req.session) {
            return res
              .status(500)
              .json({ status: 500, message: "Session not initialized" });
          }
          
          const token = await bcrypt.hash(crypto.randomBytes(30).toString("hex"), 10);
          req.session.token = token;
          req.session.user = { id: user.user_id, username: user.username };

          // return res.status(400).json({ token: req.session.token });
          res
            .status(200)
            .json({ status: 200, message: "Login successful", token });
        } catch (error) {
          console.error("Login error:", error);
          return res
            .status(200)
            .json({ status: 500, message: "Internal server error", error });
        }
      }),
    ];

    this.logout = asyncHandler(async (req, res) => {
      req.session.destroy((err) => {
        if (err) {
          console.error(err);
          return res.redirect("/admin/dashboard");
        }
    
        res.clearCookie("connect.sid"); // clear session cookie
        return res.redirect("/admin/login");
      });
    });
  }
}

module.exports = new AuthController();
