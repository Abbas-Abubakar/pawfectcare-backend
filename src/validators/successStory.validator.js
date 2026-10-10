import { body } from 'express-validator';
import { mongoIdParam } from './common.validator.js';

export const createStoryValidator = [
  body('adoptionRequestId').isMongoId().withMessage('A valid adoption request is required.'),
  body('title').trim().notEmpty().withMessage('Title is required.'),
  body('story').trim().notEmpty().withMessage('Story content is required.'),
];

export const storyIdParamValidator = [mongoIdParam('id')];