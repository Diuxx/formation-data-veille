import prisma from "../../../database/prisma.js";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { getClientInfo } from "../../../utils/utils.js";

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
  static async Logout(session) {
    const { sessionId } = session.id;
    if (!sessionId) return { success: false };

    const sess = await prisma.sessions.findUnique({ where: { id: sessionId } });
    if (!sess) return { success: false };

    await prisma.$transaction([
      prisma.sessions.delete({ where: { id: sessionId } }),
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
      return null;
    }

    const now = new Date().toISOString();
    const passwordHash = await bcrypt.hash(payload.password, 10);
    const user = await prisma.users.create({
      data: {
        id: uuidv4(),
        email: payload.email,
        name: payload.fullName,
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
}