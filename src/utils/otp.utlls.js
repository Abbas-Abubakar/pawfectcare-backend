import crypto from "crypto"
import { env } from "../config/env.js"

/**
 * 
 * @returns a 6 digit numberic otp as a string
 */
export const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString()
}

/**
 * 
 * @param {*} otp 
 * @returns hashed otp
 */

export const hashOtp = (otp) => {
  return crypto.createHmac('sha256', env.otp.secret).update(otp).digest('hex')
}

export const OTP_EXPIRY_MS = env.otp.expiryMs