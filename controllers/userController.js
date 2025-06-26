const db = require("../config");
const asyncHandler = require("express-async-handler");

class UserController {
  constructor() {
    // Get all users
    this.getAllUsers = asyncHandler(async (req, res) => {
      const q = "SELECT * FROM user";
      db.query(q, (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json(data);
      });
    });

    // Create a user
    this.createUser = asyncHandler(async (req, res) => {
      const q = "INSERT INTO user (name, email, phone) VALUES (?, ?, ?)";
      const values = [req.body.name, req.body.email, req.body.phone];
      db.query(q, values, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(200).json({ message: "User created successfully" });
      });
    });

    // Update a user
    this.updateUser = asyncHandler(async (req, res) => {
      const userId = req.params.id;
      const q = "UPDATE user SET name = ?, email = ?, phone = ? WHERE id = ?";
      const values = [req.body.name, req.body.email, req.body.phone, userId];
      db.query(q, values, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0)
          return res.status(404).json({ message: "User not found" });
        return res.status(200).json({ message: "User updated successfully" });
      });
    });

    // Delete a user
    this.deleteUser = asyncHandler(async (req, res) => {
      const userId = req.params.id;
      const q = "DELETE FROM user WHERE id = ?";
      const values = [userId];
      db.query(q, values, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0)
          return res.status(404).json({ message: "User not found" });
        return res.status(200).json({ message: "User deleted successfully" });
      });
    });

    // Get a specific user by ID
    this.getUserById = asyncHandler(async (req, res) => {
      const userId = req.params.id;
      const q = "SELECT * FROM user WHERE id = ?";
      const values = [userId];
      db.query(q, values, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0)
          return res.status(404).json({ message: "User not found" });
        return res.status(200).json(result);
      });
    });
  }
}

module.exports = new UserController();
