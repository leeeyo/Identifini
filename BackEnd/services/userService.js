const userRepository = require('../repositories/userRepository');

class UserService {
    async register(userData) {
        const existingUser = await userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new Error('Email already in use');
        }
        return userRepository.create(userData);
    }

    async getUser(id) {
        return userRepository.findById(id);
    }

    async getAllUsers() {
        return userRepository.findAll();
    }

    async updateUser(id, userData) {
        return userRepository.update(id, userData);
    }

    async deleteUser(id) {
        return userRepository.delete(id);
    }
}

module.exports = new UserService();
