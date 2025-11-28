import prisma from "../../../database/prisma.js";
import { v4 as uuidv4 } from 'uuid';
import { cryptPassword } from "../../../utils/utils.js";

/**
 * Service class for user-related operations.
 */
export default class UserService {

  /**
   * Get all users.
   * @returns A list of all users.
   */
  static async getAll() {
    return await prisma.user.findMany();
  }

  /**
   * Get a user by ID.
   * @param {*} userId The user ID.
   * @returns The user object if found, otherwise null.
   */
  static async getById(userId) {
    return await prisma.user.findUnique({
      where: { id: userId }
    });
  }

  /**
   * Update a user.
   * @param {*} userId The user ID.
   * @param {*} updateData The user data to update.
   * @returns The updated user object.
   */
  static async updateUser(userId, updateData) {
    if (updateData.password) {
      updateData.passwordHash = await cryptPassword(updateData.password, 10);
    }

    delete updateData.password; // Remove plain password from update data, does not exist in DB.
    return await prisma.user.update({
      where: { id: userId },
      data: updateData
    });
  }

  /**
   * Create a new user.
   * @param {*} userData The user data.
   * @returns The created user object.
   */
  static async createUser(userData) {
    const createdAt = new Date().toISOString();
    userData.passwordHash = await cryptPassword(userData.password, 10);

    if (!userData.role) {
      userData.role = 'USER';
    }

    delete userData.password; // Remove plain password from update data, does not exist in DB.
    return await prisma.user.create({
      data: {
        id: uuidv4(),
        ...userData,
        updatedAt: createdAt,
        createdAt: createdAt
      }
    });
  }

  /**
   * Delete a user.
   * @param {*} userId the user ID. 
   * @returns deleted user object.
   */
  static async deleteUser(userId) {
    return await prisma.user.delete({
      where: { id: userId }
    });
  }
}