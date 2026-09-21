import User from "../model/user.model.js";
import AppError from "../utils/appError.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import { clearAuthCookies, setAuthCookies } from "../utils/cookie.utils.js";
import { generateAuthToken, signAccessToken, verifyRefreshToken } from "../utils/jwt.utils.js";
import { sendOtpEmail } from "../utils/mailer.utils.js";
import { generateOtp, hashOtp, OTP_EXPIRY_MS } from "../utils/otp.utlls.js";

/**
 * @route POST /api/auth/signup
 * @desc Register an new user, (pet owner, veterinarian, shelter admin)
 */

export const signUp = asyncErrorHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body

  if (!name || !email || !password || !phone || !role) throw new AppError("Name, email, password, phone, role are all required", 400)

  const validRoles = ["pet_owner", "veterinarian"]

  if (!validRoles.includes(role)) throw new AppError("Invalid role selected", 400)

  const normalizedEmail = email.toLowerCase()

  const existingUser = await User.findOne({ email: normalizedEmail })

  if (existingUser) throw new AppError("User already exists", 409)

  const otp = generateOtp()

  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    phone,
    role,
    isVerified: false,
    otp: hashOtp(otp),
    otpExpires: new Date(Date.now() + OTP_EXPIRY_MS)

  })

  await sendOtpEmail(user.email, otp, user.name)

  res.status(201).json({
    status: "success",
    message: "Registration successful. Please check your email for verification code.",
    userId: user._id,
    email: user.email
  })
})

/**
 * @route POST /api/auth/verify-otp
 * @desc Verify OTP at registration
 */

export const verifyOtp = asyncErrorHandler(async (req, res, next) => {
  const { email, otp } = req.body

  if (!email || !otp) throw new AppError("Email and Otp are required", 400)

  const normalizedEmail = email.trim().toLowerCase()

  const user = await User.findOne({ email: normalizedEmail }).select('+otp +otpExpires')

  if (!user) throw new AppError("Email not found", 404)

  if (user.isVerified) throw new AppError("This account is already verified", 400)

  if (!user.otp || !user.otpExpires) throw new AppError("No pending verification for the account. Please request a new code", 400)

  if (user.otpExpires.getTime() < Date.now()) throw new AppError("Code has expired. Please request a new one", 400)

  if (hashOtp(otp) !== user.otp) throw new AppError("invalid valid verification code", 400)

  user.isVerified = true
  user.otp = undefined
  user.otpExpires = undefined

  await user.save({ validateBeforeSave: false })

  const { accessToken, refreshToken } = generateAuthToken(user._id, user.role)
  setAuthCookies(res, accessToken, refreshToken)

  res.status(200).json({
    status: "success",
    message: "Account verified successfully",
    user: user.toSafeObject()
  })
})

/**
 * @route POST /api/auth/resend-otp
 * @desc resend otp to user email
 */

export const resendOtp = asyncErrorHandler(async (req, res) => {
  const { email } = req.body

  if (!email) throw new AppError("Email is required", 400)

  const normalizedEmail = email.trim().toLowerCase()

  const user = await User.findOne({ email: normalizedEmail }).select("+otp +otpExpires")

  if (user.isVerified) throw new AppError("This account is already verified", 400)

  if (user.otpLastSentAt && (Date.now() - user.otpLastSentAt.getTime()) < 60 * 1000) throw new AppError("You can only request a new code once every 60 seconds. Please wait before trying again.", 429)

  const otp = generateOtp()
  user.otp = hashOtp(otp)
  user.otpExpires = new Date(Date.now() + OTP_EXPIRY_MS)
  user.otpLastSentAt = new Date()

  await user.save({ validateBeforeSave: false })

  await sendOtpEmail(user.email, otp, user.name)

  res.status(200).json({
    status: "success",
    message: "A verification code has been sent to your email"
  })
})

/**
 * @route POST /api/auth/signin
 * @desc  Log in existing user
 */
export const signIn = asyncErrorHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) throw new AppError("Email and password are required", 400)

  const normalizedEmail = email.trim().toLowerCase()

  const user = await User.findOne({ email: normalizedEmail }).select("+password +loginAttempts +loginLockUntil")

  if (!user) throw new AppError("Invalid email or password", 401)

  if (user.loginLockUntil && user.loginLockUntil > new Date()) throw new AppError("Too many failed login attempts, please try again later", 429)

  if (!user.isActive) throw new AppError("This account has been deactivated", 403)

  if (!user.isVerified) throw new AppError("Please verify your email before logging in", 403)

  if (!(await user.matchPassword(password))) {
    user.loginAttempts += 1
    if (user.loginAttempts >= 5) {
      user.loginLockUntil = new Date(Date.now() + 15 * 60 * 1000)
    }

    await user.save({ validateBeforeSave: false })
    throw new AppError("Incorrect email or password", 401)
  }


  user.loginAttempts = 0
  user.loginLockUntil = undefined
  await user.save({ validateBeforeSave: false })

  const { accessToken, refreshToken } = generateAuthToken(user._id, user.role)
  setAuthCookies(res, accessToken, refreshToken)

  res.status(200).json({
    status: "success",
    message: "Login successful",
    user: user.toSafeObject()
  })
})

/**
 * @route POST /ap/auth/logout
 * @desc logout the current user 
 */

export const logOut = (req, res) => {
  clearAuthCookies(res)
  res.status(200).json({
    status: "success",
    message: "Logged out successfully"
  })
}

/**
 * @route POST /api/auth/refresh
 * @desc Issue new access token using the refresh token cookie
 */

export const refresh = asyncErrorHandler(async (req, res) => {
  const token = req.cookies?.refreshToken

  if (!token) throw new AppError("Invalid or expired token. Please log in again", 401)

  const decoded = verifyRefreshToken(token)

  if (!decoded) throw new AppError("Invalid or expired refresh token. Please log in  again", 401)

  const user = await User.findById(decoded.id)

  if (!user || !user.isActive) throw new AppError("User no longer exist or is inactive", 401)

  const newAccessToken = signAccessToken(user._id, user.role)

  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV == "production",
    sameSite: Process.env.NODE_ENV == "production" ? "strict" : "lax",
    maxAge: 15 * 60 * 1000
  })

  res.status(200).json({
    status: "success",
    message: "Access token refreshed."
  })
})

export const getMe = (req, res) => {
  res.status(200).json({
    status: "success",
    user: req.user.toSafeObject()
  })
}