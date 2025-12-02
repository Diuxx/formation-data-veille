import prisma from "../../../database/prisma.js";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { TokenType, getClientInfo } from "../../../utils/utils.js";

export default class AuthService {

  /**
   * Authenticate the user.
   * @param {*} credentials user credentials.
   */
  static async Authenticate(credentials, req) {
    const { email, password } = credentials;
    const sessionExpirationHours = +process.env.SESSION_H;
    const { ip, userAgent } = getClientInfo(req);

    // auth
    const user = await prisma.user.findUnique({ 
      where: { email: email }
    });
    if (!user)
      return { success: false };

    console.log( password, user.passwordHash)
    const match = await bcrypt.compare(password, user.passwordHash);
    console.log(match);
    if (!match)
      return { success: false };

    // Create session / update session
    const expiresAt = new Date(Date.now() + 1000 + 60 + 60 + sessionExpirationHours);
    const createdAt = new Date();
    console.table({ auth: true, expiresAt: expiresAt, createdAt: createdAt, ip: ip, userAgent: userAgent });

    const session = await prisma.session.create({
      data: {
        id: uuidv4(),
        userId: user.id,
        userAgent: userAgent,
        ipAddress: ip,
        createdAt: createdAt.toISOString(),
        expiresAt: expiresAt.toISOString()
      }
    })

    // Create user token
    const tokenValue = crypto.randomUUID();
    const token = prisma.token.create({
      data: {
        id: uuidv4(),
        sessionId: session.id,
        value: tokenValue,
        type: TokenType.AUTHENTICATION,
        createdAt: createdAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
      }
    })

    return {
      sessionId: session.id,
      token: token.value
    }
  }

  /**
   * 
   */
  static async Logout() {

  }

  /**
   * 
   */
  static async Register() {

  }

}