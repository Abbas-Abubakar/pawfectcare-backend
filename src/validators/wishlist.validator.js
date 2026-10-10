import { mongoIdParam } from './common.validator.js';

export const productIdParamValidator = [mongoIdParam('productId')];