import crypto from "crypto"

export const generateResetToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex')

  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')

  return { rawToken, hashedToken }
}

export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex')

export const RESET_TOKEN_EXPIRY_MS = 10 * 60 * 1000