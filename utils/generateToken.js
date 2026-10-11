import { SignJWT } from "jose";
import { JWT_SECRET } from "./getJwtSecret.js";

/**|
 * Generates a JWT.
 * @param {Object} payload - Data to embed in the token.
 * @param {string} expriresIn - Expiration time (e.g. '15m', '7d', '14d')
 */
export const generateToken = async (payload, expriresIn = "15m") => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expriresIn)
    .sign(JWT_SECRET);
};
