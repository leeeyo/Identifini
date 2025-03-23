const User = require('../models/userModel');

class UserRepository {
    async create(userData) {
        const user = new User(userData);
        return user.save();
    }

    async findByEmail(email) {
        return User.findOne({ email });
    }

    async findById(id) {
        return User.findById(id);
    }

    async findAll() {
        return User.find({});
    }

    async update(id, userData) {
        return User.findByIdAndUpdate(id, userData, { new: true });
    }

    async delete(id) {
        return User.findByIdAndDelete(id);
    }
}

module.exports = new UserRepository();
