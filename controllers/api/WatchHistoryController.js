const asyncHandler = require("express-async-handler");
const { check, validationResult } = require("express-validator");
const multer = require("multer");
const User = require("../../models/user");
const Subjects = require("../../models/subjects");
const Topics = require("../../models/topics");
const Level = require("../../models/level");
const Organisation = require("../../models/organisation");
const OrgDetails = require("../../models/org_details");
const WatchHistory = require("../../models/watchhistory");
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
const Category = require("../../models/category");

class WatchHistoryController {
  constructor() {
    this.entry = asyncHandler(async (req, res) => {
      try {
        const user = req.session.user;
        const { subtopic, category, subtopic_data, ttl_time, seen_time } =
          req.body;

        const total = this.timeToMinutes(ttl_time);
        const seen = this.timeToMinutes(seen_time);

        let watch_per = 0;

        if (total === 0) {
          watch_per = 100;
        } else if (!isNaN(total) && total > 0 && !isNaN(seen)) {
          watch_per = (seen / total) * 100;
          watch_per = Math.round(Math.round(watch_per * 100) / 100);
        }
        const category_dt = await Category.findOne({
          where: {
            id: category,
          },
        });

        const check = await WatchHistory.findOne({
          where: {
            subtopic: subtopic,
            category: category,
            subtopic_data: subtopic_data,
            is_deleted: null,
            user_id: user.id
          },
        });

        if (check) {
          const check_seen = this.timeToMinutes(check.seen_time);
          if (seen > check_seen) {
            const obj = {
              ttl_time: ttl_time,
              seen_time: seen_time,
              seen_percent: watch_per,
              status: watch_per === 100 ? "1" : "0",
              edited_at: new Date(),
            };
            await WatchHistory.update(obj, {
              where: {
                subtopic: subtopic,
                category: category,
                subtopic_data: subtopic_data,
                is_deleted: null,
                user_id: user.id
              },
            });
            return res.status(200).json({
              status: 200,
              message: "Successfully history updated",
            });
          } else {
            return res.status(200).json({
              status: 200,
              message: "No need to update",
            });
          }
        }

        const obj = {
          org_id: user.org_id,
          user_id: user.id,
          subtopic: subtopic,
          subtopic_data: subtopic_data,
          category: category,
          category_type: category_dt.type,
          ttl_time: ttl_time,
          seen_time: seen_time,
          seen_percent: watch_per,
          status: watch_per === 100 ? "1" : "0",
        };

        await WatchHistory.create(obj);

        return res.status(200).json({
          status: 200,
          message: "Successfully history added",
        });
      } catch (error) {
        return res.status(200).json({
          status: 500,
          message: "Internal server error - " + error.message,
          error,
        });
      }
    });
  }

  timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };
}

module.exports = new WatchHistoryController();
