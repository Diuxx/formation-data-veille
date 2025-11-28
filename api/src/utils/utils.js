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
});

export const RequestMessage = Object.freeze({
  INVALID_REQUEST_DATA: 'Invalid request data',
});