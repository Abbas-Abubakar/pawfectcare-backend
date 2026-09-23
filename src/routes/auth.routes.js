import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js"
import { forgotPassowrd, getMe, logOut, refresh, resendOtp, resestPassword, signIn, signUp, verifyOtp } from "../controllers/auth.controller.js";


const router = Router()

router.post("/signup", signUp)
router.post("/verify-otp", verifyOtp)
router.post("/resend-otp", resendOtp)
router.post("/signin", signIn)
router.post("/logout", logOut)
router.post("/refresh", refresh)
router.post("/forgot-password", forgotPassowrd)
router.post("/reset-password/:token", resestPassword)

router.post("/me",protect, getMe)

export default router