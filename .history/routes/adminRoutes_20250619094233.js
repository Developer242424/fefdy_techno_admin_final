const express = require("express");
const AuthController = require("../controllers/AuthController");
const DashboardController = require("../controllers/DashboardController");
const HandlerController = require("../controllers/HandlerController");
const { isAuthenticated } = require("../middleware/AuthHandler");
const SubjectsController = require("../controllers/SubjectsController");
const TopicsController = require("../controllers/TopicsController");
const LevelController = require("../controllers/LevelController");
const CategoryController = require("../controllers/CategoryController");
const SubtopicController = require("../controllers/SubtopicController");
const OrganisationController = require("../controllers/OrganisationController");
const UsersListController = require("../controllers/UsersListController");
const IndividualUsersListController = require("../controllers/IndividualUsersListController");
const UsersImprtNExportController = require("../controllers/UsersImprtNExportController");
const QuestionsController = require("../controllers/QuestionsController");

const router = express.Router();

router.get("/", (req, res) => {
  res.setHeader("Content-type", "text/plain");
  res.write("Welcome to node admin app.");
  res.end();
});

// ✅ Public routes (excluded from auth check)
router.get("/login", AuthController.loginindex);
router.post("/login", AuthController.login);
router.get("/logout", AuthController.logout);

// ✅ Now protect the rest
router.use(isAuthenticated);

// ✅ Protected routes
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
router.post("/get-standards-for-drop", HandlerController.getStandardsForDrop);
router.post(
  "/get-organisations-for-drop",
  HandlerController.getOrganisationsForDrop
);
router.post(
  "/get-question-types-for-drop",
  HandlerController.getQuestionTypesForDrop
);
router.post(
  "/get-subtopic-by-level-for-drop",
  HandlerController.getSubTopicByLevelForDrop
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

router.get("/organisation", OrganisationController.index);
router.post("/organisation/create", OrganisationController.create);
router.post("/organisation/list", OrganisationController.list);
router.post("/organisation/data", OrganisationController.data);
router.post("/organisation/update", OrganisationController.update);
router.post("/organisation/destroy", OrganisationController.destroy);

router.get("/users", UsersListController.index);
router.post("/users/create", UsersListController.create);
router.post("/users/list", UsersListController.list);
router.post("/users/data", UsersListController.data);
router.post("/users/update", UsersListController.update);
router.post("/users/destroy", UsersListController.destroy);

router.post("/individualuser/create", IndividualUsersListController.create);
router.post("/individualuser/update", IndividualUsersListController.update);

router.get("/bulk", UsersImprtNExportController.index);
router.post("/students/export", UsersImprtNExportController.userexport);
router.get(
  "/students/example-export",
  UsersImprtNExportController.downloadSample
);
router.post("/students/import", UsersImprtNExportController.userimport);

router.get("/create-questions", QuestionsController.createIndex);
router.post("/create-questions/create", QuestionsController.create);
router.get("/questions-list", QuestionsController.listIndex);
router.post("/questions-list/list", QuestionsController.list);
router.post("/questions-list/data", QuestionsController.data);
router.post("/questions-list/update", QuestionsController.update);

router.get("/sample", DashboardController.sample);

module.exports = router;
