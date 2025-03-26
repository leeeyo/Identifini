class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository
  }

  async registerUser(userData) {
    // Basic validation (can be expanded)
    if (!userData.email || !userData.password) {
      throw new Error("Email and password are required")
    }

    // Check if user already exists
    const existingUser = await this.userRepository.getByEmail(userData.email)
    if (existingUser) {
      throw new Error("User already exists")
    }

    // Hash password (example - use bcrypt in production)
    const hashedPassword = userData.password + "hashed" // Dummy hashing

    userData.password = hashedPassword

    // Create user
    const newUser = await this.userRepository.create(userData)
    return newUser
  }

  async loginUser(email, password) {
    if (!email || !password) {
      throw new Error("Email and password are required")
    }

    const user = await this.userRepository.getByEmail(email)
    if (!user) {
      throw new Error("Invalid credentials")
    }

    // Validate password (example - use bcrypt in production)
    const hashedPassword = password + "hashed" // Dummy hashing
    if (user.password !== hashedPassword) {
      throw new Error("Invalid credentials")
    }

    return user
  }

  async getUserById(id) {
    if (!id) {
      throw new Error("ID is required")
    }

    const user = await this.userRepository.getById(id)
    if (!user) {
      throw new Error("User not found")
    }

    return user
  }

  async updateUser(id, userData) {
    if (!id) {
      throw new Error("ID is required")
    }

    const updatedUser = await this.userRepository.update(id, userData)
    if (!updatedUser) {
      throw new Error("User not found")
    }

    return updatedUser
  }

  async deleteUser(id) {
    if (!id) {
      throw new Error("ID is required")
    }

    const deletedUser = await this.userRepository.delete(id)
    if (!deletedUser) {
      throw new Error("User not found")
    }

    return deletedUser
  }

  // Add this method after the deleteUser method
  // Create a sub-user
  async createSubUser(parentUserId, subUserData) {
    if (!parentUserId) throw new Error("Parent user ID is required")
    if (!subUserData) throw new Error("Sub-user data is required")

    console.log("Creating sub-user for parent:", parentUserId, "with data:", subUserData)

    // Get the parent user
    const parentUser = await this.getUserById(parentUserId)
    if (!parentUser) throw new Error("Parent user not found")

    // Set the sub-user role and parent user
    subUserData.role = "sub-user"
    subUserData.parentUser = parentUserId

    // Create the sub-user
    const subUser = await this.registerUser(subUserData)

    // Add the sub-user to the parent user's subUsers array
    await this.userRepository.addSubUser(parentUserId, subUser._id)

    return subUser
  }

  // Get all sub-users for a parent user
  async getSubUsers(parentUserId) {
    if (!parentUserId) throw new Error("Parent user ID is required")

    console.log("Getting sub-users for parent:", parentUserId)

    // Get the parent user with populated sub-users
    const parentUser = await this.userRepository.getByIdWithSubUsers(parentUserId)
    if (!parentUser) throw new Error("Parent user not found")

    return parentUser.subUsers || []
  }
}

module.exports = UserService

