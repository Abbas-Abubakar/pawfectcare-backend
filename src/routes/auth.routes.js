import { Router } from "express";
import { protect } from "../middeware/auth.middleware.js"
import { getMe, logOut, refresh, resendOtp, signIn, signUp, verifyOtp } from "../controller/auth.controller.js";


const router = Router()

router.post("/signup", signUp)
router.post("/verify-otp", verifyOtp)
router.post("/resend-otp", resendOtp)
router.post("/signin", signIn)
router.post("/logout", logOut)
router.post("/refresh", refresh)
router.post("/me",protect, getMe)

export default router