import { mongoIdParam } from './common.validator.js';

export const notificationIdParamValidator = [mongoIdParam('id')];

