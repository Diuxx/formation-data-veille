import bcrypt from 'bcrypt';

/**
 * Add days to a date.
 * @param {Date} date 
 * @param {*} days 
 * @returns The new date with added days.
 */
export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add years to a date.
 * @param {Date} date 
 * @param {*} years 
 * @returns The new date with added years.
 */
export function addYears(date, years) {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

/**
 * Crypt a password.
 * @param {*} plainPassword 
 * @param {*} saltRounds 
 * @returns The hashed password.
 */
export async function cryptPassword(plainPassword, saltRounds = 10) {
  return await bcrypt.hash(plainPassword, saltRounds);
}

/**
 * 
 * @param {*} req 
 */
export async function getClientInfo(req) {
  let ip = 
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    req.connection?.remoteAddress ||
    req.ip ||
    "unknown";


  // transform IPv6 localhost "::1" en "localhost"
  if (ip == "::1" || ip == "127.0.0.1") {
    ip = "localhost";
  }

  const userAgent = req.headers["user-agent"] || "Unknown";
  console.log("Client IP detected:", ip, userAgent);

  return { ip, userAgent };
}

export const ActionEvt = Object.freeze({
  LIST_USERS: 'LIST_USERS',
  GET_USER: 'GET_USER',
  UPDATE_USER: 'UPDATE_USER',
  DELETE_USER: 'DELETE_USER',
  DEACTIVATE_USER: 'DEACTIVATE_USER',
  CREATE_USER: 'CREATE_USER',
  LOGIN: 'LOGIN',
  API_KEY_USED: 'API_KEY_USED',
  SYSTEM_TASK: 'SYSTEM_TASK',
  AUTHENTICATE: 'AUTHENTICATE',
  LOGOUT: 'LOGOUT',
});

export const RequestMessage = Object.freeze({
  SERVER_ERROR: 'Internal Server Error',
  INVALID_REQUEST_DATA: 'Invalid request data',
  INVALID_CREDENTIALS: 'Invalid credentials'
});

export const TokenType = Object.freeze({
  AUTHENTICATION: 1
})