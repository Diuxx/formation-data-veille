import prisma from "../../../database/prisma.js";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { getClientInfo } from "../../../utils/utils.js";
import { sendEmail } from "../../../services/mail.service.js";
import { cryptPassword } from "../../../utils/utils.js";

export default class AuthService {

  /**
   * Authenticate a user and create a session + auth token.
   * @param {{email:string,password:string}} credentials
   * @param {*} req Express request (for IP + UA)
   */
  static async Authenticate(credentials, req) {
    const { email, password } = credentials;
    const sessionExpirationHours = Number(process.env.SESSION_H ?? 4);
    const { ip, userAgent } = await getClientInfo(req);

    // lazy cleanup of expired sessions
    await this.lazyCleanupSessions();

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return { success: false };

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return { success: false };

    // todo: optimize by reusing existing valid session if IP and UA match (optional) 
    let existingSession = await prisma.sessions.findFirst({ 
      where: {
        userId: user.id,
        userAgent: userAgent,
        expiresAt: { gt: new Date() }
      }
    });

    if (existingSession) {
      return {
        success: true,
        sessionId: existingSession.id,
        expiresAt: existingSession.expiresAt.toISOString(),
      };
    } 
    else {
      const createdAt = new Date();
      const expiresAt = new Date(createdAt.getTime() + sessionExpirationHours * 60 * 60 * 1000);
      const session = await prisma.sessions.create({
        data: {
          id: uuidv4(),
          userId: user.id,
          userAgent,
          ipAddress: ip,
          createdAt: createdAt.toISOString(),
          expiresAt: expiresAt.toISOString(),
        },
      });
  
      return {
        success: true,
        sessionId: session.id,
        expiresAt: expiresAt.toISOString(),
      };
    }
  }

  /**
   * Logout by invalidating session and deleting related auth tokens.
   * @param {{sessionId:string}} payload
   */
  static async Logout(sessionId) {
    if (!sessionId) 
      return { success: false };

    const session = await prisma.sessions.findUnique({ where: { id: sessionId } });
    if (!session) return { success: false };

    await prisma.$transaction([
      prisma.sessions.delete({ where: { id: session.id } }),
    ]);

    return { success: true };
  }

  /**
   * Register a new user.
   * @param {{email:string,password:string,fullName:string}} payload
   */
  static async register(payload) {
    const exists = await prisma.users.findUnique({ where: { email: payload.email } });
    if (exists) {
      return false;
    }

    const now = new Date().toISOString();
    const passwordHash = await bcrypt.hash(payload.password, 10);
    const name = payload.email.split('@')[0];
    const user = await prisma.users.create({
      data: {
        id: uuidv4(),
        email: payload.email,
        name: name,
        passwordHash,
        role: 'USER',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    });
    return user;
  }

  /**
   * Reset the user password.
   * @param {*} payload 
   */
  static async resetPassword(payload) {
    const token = await prisma.tokens.findFirst(
      { 
        where: { 
          token: payload.token,
          expiresAt: { gt: new Date() }
        }, 
        include: { users: true },
      });

    if (!token) return false;

    const hash = await cryptPassword(payload.password, 10);
    await prisma.$transaction([
      prisma.users.update({ where: { id: token.users.id }, data: { passwordHash: hash } }),
      prisma.tokens.delete({ where: { id: token.id } }),
      prisma.sessions.deleteMany({ where: { userId: token.users.id } })
    ]);

    return true;
  }

  /**
   * Send a reset link to the user.
   * @param {*} payload 
   */
  static async remindPassword(payload) {
    const user = await prisma.users.findUnique({ where: { email: payload.email } });
    if (!user) {
      return false;
    }

    const token = this.generateToken();
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 1000 * 60 * 15);
    const id = uuidv4();

    await prisma.tokens.create({
      data: {
        id: uuidv4(),
        userId: user.id,
        type: 'RESET_PASSWORD',
        token: token,
        createdAt: createdAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
      },
    });

    const link = `${process.env.FRONT_URL}${token}`;
    const result = await sendEmail({
      to: user.email,
      title: "Reset password",
      subject: "Reset your password",
      html:   `
        <p>Tu as demandé une réinitialisation.</p>
        <a href="${link}">Changer mon mot de passe</a>
        <p>Si ce n'était pas toi, ignore ce message.</p>
      `
    });
    if (!result) {
      await prisma.tokens.delete({ where: { id: id } })
      return false;
    }

    return true;
  }

  /**
   * Generate a reset token.
   * @returns 
   */
  static generateToken() {
    const token = crypto.randomBytes(32).toString("hex");
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  /**
   * Deletes all expired sessions. Should be called periodically (e.g. on a schedule) to clean up the database.
   */
  static async lazyCleanupSessions() {
    const now = new Date();
    await prisma.sessions.deleteMany({
      where: {
        expiresAt: { lt: now }
      }
    });
  }

  /**
   * Reset all session for the user.
   * @param {*} userId 
   */
  static async resetAllSessions(userId) {
    await prisma.sessions.deleteMany({
      where: {
        userId: userId
      }
    });
  }
}