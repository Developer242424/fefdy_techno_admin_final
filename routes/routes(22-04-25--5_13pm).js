const express = require("express");
const UserController = require("../controllers/userController");
const AuthController = require("../controllers/AuthController");

const router = express.Router();

router.get("/", (req, res) => {
    res.setHeader('Content-type', 'text/plain')
    res.write('Welcome to node app.')
    res.end()
});

// router.get('/admin/login', AuthController.loginindex)

router.get('/users', UserController.getAllUsers);
router.post('/users', UserController.createUser);
router.put('/users:id', UserController.updateUser);
router.delete('/users:id', UserController.deleteUser);
router.get('/users:id', UserController.getUserById);

module.exports = router; // Export the router
