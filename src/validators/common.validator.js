import { param } from 'express-validator';


export const mongoIdParam = (paramName) =>
  param(paramName).isMongoId().withMessage(`Invalid ${paramName}.`);