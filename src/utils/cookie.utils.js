import { env } from "../config/env.js"

const isProduction = env.nodeEnv == "production"

const baseCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "strict" : "lax"
}

export const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    ...baseCookieOptions,
    maxAge: 15 * 60 * 1000
  })

  res.cookie("refreshToken", refreshToken, {
    ...baseCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "api/auth/refresh"
  })
}

export const clearAuthCookies = res => {
  res.clearCookie("accessToken", baseCookieOptions)
  res.clearCookie("refreshToken", { ...baseCookieOptions, path: "api/auth/refresh" })
}
