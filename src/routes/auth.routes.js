import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js"
import { forgotPassowrd, getMe, logOut, refresh, resendOtp, resestPassword, signIn, signUp, verifyOtp } from "../controllers/auth.controller.js";
import { forgotPasswordLimiter, loginLimiter, otpLimiter, registerLimiter } from "../middleware/rateLimiter.middleware.js";


const router = Router()

router.post("/signup", registerLimiter, signUp)
router.post("/verify-otp", otpLimiter, verifyOtp)
router.post("/resend-otp", otpLimiter, resendOtp)
router.post("/signin", loginLimiter, signIn)
router.post("/logout", logOut)
router.post("/refresh", refresh)
router.post("/forgot-password", forgotPasswordLimiter, forgotPassowrd)
router.post("/reset-password/:token", resestPassword)

router.post("/me",protect, getMe)

export default router