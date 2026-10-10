import { body } from 'express-validator';
import { mongoIdParam } from './common.validator.js';

export const createRequestValidator = [
  mongoIdParam('listingId'),
  body('message').optional().trim(),
];

export const listingIdParamValidator = [mongoIdParam('listingId')];

export const requestIdParamValidator = [mongoIdParam('id')];

export const reviewRequestValidator = [
  mongoIdParam('id'),
  body('reviewNote').optional().trim(),
];