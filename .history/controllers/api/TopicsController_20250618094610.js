const asyncHandler = require("express-async-handler");
const { check, validationResult } = require("express-validator");
const multer = require("multer");
const User = require("../../models/user");
const Subjects = require("../../models/subjects");
const Topics = require("../../models/topics");
const Level = require("../../models/level");
const Subtopic = require("../../models/subtopic");
const Organisation = require("../../models/organisation");
const OrgDetails = require("../../models/org_details");
const WatchHistory = require("../../models/watchhistory");
const { sequelize } = require("../../models");
const { QueryTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { where, Sequelize, DATE, Op } = require("sequelize");
const { render } = require("ejs");
require("dotenv").config();
const session = require("express-session");
const getDynamicUploader = require("../../middleware/upload");
const moment = require("moment");
const { fn } = require("sequelize");
const path = require("path");
const fs = require("fs");
const { title } = require("process");

class TopicsController {
  constructor() {
    this.data = asyncHandler(async (req, res) => {
      try {
        const { subject } = req.body;
        const user = req.session.user;

        if (!subject) {
          return res
            .status(400)
            .json({ status: 400, message: "Subject is required" });
        }

        const topics = await Topics.findAll({
          where: { subject, is_deleted: null },
        });

        const data = await Promise.all(
          topics.map(async (value) => {
            const completedLevels = await this.LevelsCompletionsCount(
              user,
              value.id
            );
            return {
              id: value.id,
              subject: value.subject,
              title: value.title,
              description: value.description,
              thumbnail: value.thumbnail,
              levels: value.levels,
              comp_levels: completedLevels,
            };
          })
        );

        return res.status(200).json({ status: 200, data });
      } catch (error) {
        console.error("Get error:", error);
        return res.status(500).json({
          status: 500,
          message: "Internal server error - " + error.message,
        });
      }
    });
  }

  LevelsCompletionsCount = async (user, topicId) => {
    try {
      if (!topicId) {
        throw new Error("Topic ID is required");
      }

      const org_details = await OrgDetails.findOne({
        where: {
          org_id: user.org_id,
          standard: user.standard,
          section: user.section,
          is_deleted: null,
        },
      });

      if (!org_details) {
        throw new Error("Organisation details not found");
      }

      const levels = await Level.findAll({
        where: { topic: topicId, is_deleted: null },
      });

      const completedCounts = await Promise.all(
        levels.map(async (level) => {
          const subtopics = await Subtopic.findAll({
            where: {
              level_id: level.id,
              is_deleted: null,
            },
          });

          let completedCount = 0;

          for (const sub of subtopics) {
            const categories = JSON.parse(sub.category || "[]");
            const subtopic_datas = JSON.parse(sub.cat_data_ids || "[]");

            // const watchHistory = await WatchHistory.findAll({
            //   where: {
            //     user_id: user.id,
            //     subtopic: sub.id,
            //     category: { [Op.in]: categories },
            //     is_deleted: null,
            //     status: "1",
            //   },
            // });
            const watchHistory = await sequelize.query(
              `
                            SELECT *
                            FROM (
                              SELECT *,
                                     ROW_NUMBER() OVER (PARTITION BY category ORDER BY id DESC) AS row_num
                              FROM watch_history
                              WHERE org_id = :org_id
                                AND user_id = :user_id
                                AND subtopic = :subtopic_id
                                AND subtopic_data IN (:subtopicData)
                                AND category IN (:category)
                                AND is_deleted IS NULL
                                AND status = '1'
                            ) AS t
                            WHERE row_num = 1
                          `,
              {
                replacements: {
                  org_id: user.org_id,
                  user_id: user.id,
                  subtopic_id: sub.id,
                  subtopicData: subtopic_datas,
                  category: categories,
                },
                type: QueryTypes.SELECT,
              }
            );

            if (watchHistory.length === categories.length) {
              completedCount++;
            }
          }

          return completedCount;
        })
      );

      const count = completedCounts.filter((c) => c > 0).length;
      return count;
    } catch (error) {
      console.error("Level Completion Error:", error.message);
      return 0;
    }
  };
}

module.exports = new TopicsController();
