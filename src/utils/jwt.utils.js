import jwt from "jsonwebtoken"
import {env} from "../config/env.js"

export const signAccessToken = (id, role) => {
  return jwt.sign({id, role}, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn
  })
}

export const signRefreshToken = id => {
  return jwt.sign({id}, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn
  })
}

export const veriftyAccessToken = token => {
  return jwt.verify(token, env.jwtAccessSecret)
}

export const verifyRefreshToken = token => {
  return jwt.verify(token, env.jwtRefreshSecret)
}

export const generateAuthToken = (id, role) => {
  const accessToken = signAccessToken(id, role)
  const refreshToken = signRefreshToken(id)

  return { accessToken, refreshToken }
}