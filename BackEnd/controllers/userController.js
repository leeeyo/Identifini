// controllers/userController.js
const userService = require("../services/userService");

class UserController {
  // Register a new user
  async registerUser(req, res) {
    try {
      const newUser = await userService.registerUser(req.body);
      res.status(201).json(newUser);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Login user
  async loginUser(req, res) {
    try {
      const { username, password } = req.body;
      const user = await userService.loginUser(username, password);
      res.json(user);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  // Get current user (from token)
  async getCurrentUser(req, res) {
    try {
      // This assumes you have authentication middleware that sets req.user
      const user = await userService.getUserById(req.user.id);
      res.json(user);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  // Get user by ID
  async getUserById(req, res) {
    try {
      const user = await userService.getUserById(req.params.id);
      res.json(user);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  // Update user
  async updateUser(req, res) {
    try {
      const updatedUser = await userService.updateUser(req.params.id, req.body);
      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Delete user
  async deleteUser(req, res) {
    try {
      const result = await userService.deleteUser(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Get all users (admin only)
  async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new UserController();