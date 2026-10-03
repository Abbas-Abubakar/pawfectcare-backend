import mongoSanitize from 'express-mongo-sanitize';

/**
 * Sanitizes req.body, req.params, and req.query against NoSQL injection
 * (strips any keys containing '$' or '.') by mutating each object in place,
 * rather than reassigning req.query — which throws in newer Express versions
 * where req.query is a getter-only property.
 */
export const sanitizeInput = (req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  if (req.query) mongoSanitize.sanitize(req.query);
  next();
};