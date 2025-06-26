const asyncHandler = require("express-async-handler");
const { check, validationResult } = require("express-validator");
const multer = require("multer");
const User = require("../models/user");
const Subjects = require("../models/subjects");
const Topics = require("../models/topics");
const Level = require("../models/level");
const Subtopic = require("../models/subtopic");
const CategoryData = require("../models/categorydata");
const Organisation = require("../models/organisation");
const OrgDetails = require("../models/org_details");
const Standards = require("../models/standards");
const LoginUsers = require("../models/loginusers");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { where, Sequelize, DATE, Op, or } = require("sequelize");
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
const sequelize = require("../config/database");
const ExcelJS = require("exceljs");
const { clearScreenDown } = require("readline");

class UsersImprtNExportController {
  constructor() {
    this.index = asyncHandler(async (req, res) => {
      return res.render("admin/layout", {
        title: "Bulk Import & Export",
        content: "../admin/bulk/index",
        url: req.originalUrl,
        baseurl: "/admin",
        homeurl: "/admin/dashboard",
      });
    });

    this.userimport = [
      (req, res, next) => {
        const upload =
          getDynamicUploader("students_import").single("import_file_upload");
        upload(req, res, function (err) {
          if (err) {
            return res.status(200).json({ status: 400, message: err.message });
          }
          next();
        });
      },
      check("import_org_id").notEmpty().withMessage("Organisation is required"),
      check("import_standard").notEmpty().withMessage("Standard is required"),
      check("import_section").notEmpty().withMessage("Section is required"),

      asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(200).json({ status: 401, errors: errors.array() });
        }

        try {
          const { import_org_id, import_standard, import_section } = req.body;

          if (!req.file || !req.file.path) {
            return res.status(200).json({
              status: 400,
              message: "No file uploaded or file path missing.",
            });
          }

          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.readFile(req.file.path);
          const worksheet = workbook.getWorksheet(1);

          const rows = [];
          worksheet.eachRow((row, rowNumber) => {
            if (rowNumber !== 1) {
              rows.push(row.values);
            }
          });

          const organisation = await Organisation.findOne({
            where: { id: import_org_id },
          });
          const org_det = await OrgDetails.findOne({
            where: {
              org_id: import_org_id,
              standard: import_standard,
              section: import_section,
            },
          });

          const level = org_det?.levels ?? null;

          const students = await Promise.all(
            rows.map(async (row) => ({
              org_id: import_org_id,
              standard: import_standard,
              section: import_section,
              name: row[1],
              email: row[2],
              mobile: row[3],
              username: row[4],
              password: await bcrypt.hash(row[4], 10),
              subject: organisation.subject,
              level: level,
              type: "student",
            }))
          );

          await LoginUsers.bulkCreate(students);

          return res.status(200).json({
            status: 200,
            message: "Students imported successfully",
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

  userexport = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json({ status: 401, errors: errors.array() });
    }
    try {
      const { export_org_id, export_standard, export_section } = req.body;
      const whereClause = {
        org_id: export_org_id,
        standard: export_standard,
        section: export_section,
        is_deleted: null,
        type: "student",
      };
      const users = await LoginUsers.findAll({ where: whereClause });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Students");

      worksheet.columns = [
        { header: "Name", key: "name", width: 20 },
        { header: "Email", key: "email", width: 30 },
        { header: "Mobile", key: "mobile", width: 15 },
        { header: "Username", key: "username", width: 20 },
      ];

      users.forEach((user) => {
        worksheet.addRow({
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          username: user.username,
        });
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=students_export.xlsx"
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      return res.status(200).json({
        status: 500,
        message: "Internal server error - " + error.message,
        error,
      });
    }
  });

  downloadSample = asyncHandler(async (req, res) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sample");

    worksheet.columns = [
      { header: "Name", key: "name", width: 20 },
      { header: "Email", key: "email", width: 30 },
      { header: "Mobile", key: "mobile", width: 15 },
      { header: "Username", key: "username", width: 20 },
      { header: "Password", key: "password", width: 20 },
    ];

    worksheet.addRow([
      "John Doe",
      "john@example.com",
      "9876543210",
      "john123",
      "john123",
    ]);

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=sample_students.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    await workbook.xlsx.write(res);
    res.end();
  });
}

module.exports = new UsersImprtNExportController();
