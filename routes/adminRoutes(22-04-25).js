const express = require("express");
const { isAuthenticated } = require("../middleware/AuthHandler");
const HandlerController = require("../controllers/HandlerController");
const AuthController = require("../controllers/AuthController");
const DashboardController = require("../controllers/DashboardController");
const SubjectsController = require("../controllers/SubjectsController");
const TopicsController = require("../controllers/TopicsController");
const LevelController = require("../controllers/LevelController");
const CategoryController = require("../controllers/CategoryController");
const SubtopicController = require("../controllers/SubtopicController");

const router = express.Router();

router.get("/", (req, res) => {
  res.setHeader("Content-type", "text/plain");
  res.write("Welcome to node admin app.");
  res.end();
});

router.get("/login", AuthController.loginindex);
router.post("/login", AuthController.login);
router.get("/logout", AuthController.logout);

router.use(isAuthenticated);

router.get("/dashboard", DashboardController.index);

router.post("/get-subjects-for-drop", HandlerController.getSubjectForDrop);
router.post(
  "/get-topics-by-subjects-for-drop",
  HandlerController.getTopicBySubjectForDrop
);
router.post(
  "/get-level-count-for-drop",
  HandlerController.getLevelCountForDrop
);
router.post(
  "/get-levels-by-topic-for-drop",
  HandlerController.getLevelsByTopicForDrop
);

router.get("/subjects", SubjectsController.index);
router.post("/subjects/create", SubjectsController.create);
router.post("/subjects/list", SubjectsController.list);
router.post("/subjects/destroy", SubjectsController.destroy);
router.post("/subjects/data", SubjectsController.data);
router.post("/subjects/update", SubjectsController.update);

router.get("/topics", TopicsController.index);
router.post("/topics/create", TopicsController.create);
router.post("/topics/list", TopicsController.list);
router.post("/topics/destroy", TopicsController.destroy);
router.post("/topics/data", TopicsController.data);
router.post("/topics/update", TopicsController.update);

router.get("/levels", LevelController.index);
router.post("/levels/create", LevelController.create);
router.post("/levels/list", LevelController.list);
router.post("/levels/destroy", LevelController.destroy);
router.post("/levels/data", LevelController.data);
router.post("/levels/update", LevelController.update);

router.get("/category", CategoryController.index);
router.post("/category/create", CategoryController.create);
router.post("/category/list", CategoryController.list);
router.post("/category/destroy", CategoryController.destroy);
router.post("/category/data", CategoryController.data);
router.post("/category/update", CategoryController.update);

router.get("/subtopic", SubtopicController.index);
router.post(
  "/subtopic/category-create-form",
  SubtopicController.createFormGenerate
);
router.post("/subtopic/create", SubtopicController.create);
router.post("/subtopic/list", SubtopicController.list);
router.post("/subtopic/data", SubtopicController.data);
router.post(
  "/subtopic/category-edit-form",
  SubtopicController.editFormGenerate
);
router.post("/subtopic/update", SubtopicController.update);
router.post("/subtopic/destroy", SubtopicController.destroy);

router.get('/organisation', (req, res) => {
    return res.render("admin/layout", {
        title: "Organisation",
        content: "../admin/organisation/index",
        url: req.originalUrl,
        baseurl: "/admin",
        homeurl: "/admin/dashboard",
      });
})

router.get("/sample", DashboardController.sample);

module.exports = router;
