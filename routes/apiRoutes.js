const express = require("express");
const request = require('request');
const { isAuthenticated } = require("../middleware/ApiHandler");
const AuthController = require("../controllers/api/AuthController");
const SubjectsController = require("../controllers/api/SubjectsController");
const TopicsController = require("../controllers/api/TopicsController");
const LevelController = require("../controllers/api/LevelController");
const SubtopicController = require("../controllers/api/SubtopicController");
const WatchHistoryController = require("../controllers/api/WatchHistoryController");
const ProfileController = require("../controllers/api/ProfileController");

const router = express.Router();

router.get("/", (req, res) => {
  return res
    .status(200)
    .json({ status: 200, message: "Api server is connected successfully" });
});

router.post("/login", AuthController.login);
router.post("/update-profile", ProfileController.update);

router.use(isAuthenticated);

router.post("/logout", AuthController.logout);
router.post("/subjects", SubjectsController.data);
router.post("/topics", TopicsController.data);
router.post("/levels", LevelController.data);
router.post("/subtopics", SubtopicController.data);
router.post("/subtopicdata", SubtopicController.subtopicData);
router.post("/history-entry", WatchHistoryController.entry);
router.post("/myprofile", ProfileController.data);

router.get('/pdf', (req, res) => {
  const pdfUrl = req.query.url;
  if (!pdfUrl) return res.status(400).send("No URL provided");

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Access-Control-Allow-Origin', '*');

  request
    .get(pdfUrl)
    .on('error', () => res.status(500).send("Failed to load PDF"))
    .pipe(res);
});

module.exports = router;
