import { env } from "../config/env.js"

const devErrors = (res, error) => {
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    stack: error.stack,
    error: error
  })
}

const prodErrors = (res, error) => {
  if(error.isOperational){
    res.status(error.status).json({
      status: error.status,
      message: error.message
    })
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went wrong, please try again later"
    })
  }
}

export const globalErrorHandler = (error, req, res, next) => {
  error.status = error.status || "error"
  error.statusCode = error.statusCode || 500

  if(env.nodeEnv === "development"){
    devErrors(res, error)
  }else if(env.nodeEnv === "production"){
    prodErrors(res, error)
  }
} 