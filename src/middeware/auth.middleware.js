import User from "../model/user.model.js"
import AppError from "../utils/appError.js"
import asyncErrorHandler from "../utils/asyncErrorHandler.js"
import { veriftyAccessToken } from "../utils/jwt.utils.js"

/**
 * Protect routes: verifies the access token cookie and attaches
 * the authenticated user
 */

export const protect = asyncErrorHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken
  
  if(!token) throw new AppError("You are not logged in. Please log in to continue", 401)
  
  const decoded = veriftyAccessToken(token)

  if(!decoded) throw new AppError("Invalid or expired session. Please log in again", 401)

  const user  = await User.findById(decoded.id)

  if(!user) throw new AppError("User does not exist")
  
  const isPasswordChanged = await user.isPasswordChanged(decoded.iat)

  if(isPasswordChanged) throw new AppError("Password wasn recently changed, please log in again", 401)

  req.user = user 
  next()
}) 

/**
 * Restrict rout access to specific roles
 * 
 */

export const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if(!req.user) throw new AppError("Authentication required", 401)
    
    if(!allowedRoles.includes(req.user.role)) throw new AppError("You do not have permission to perform this action", 403)
    next()
  }


}