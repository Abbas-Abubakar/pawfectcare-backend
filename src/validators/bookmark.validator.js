import { mongoIdParam } from './common.validator.js';

export const postIdParamValidator = [mongoIdParam('postId')];