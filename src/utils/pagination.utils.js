/**
 * Parses page/limit query params into safe, bounded values.
 * Defaults to page 1, 20 items per page. Caps limit at 100 to prevent
 * someone requesting an unbounded/huge page size.
 */
export const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Builds a consistent pagination metadata object for API responses.
 */
export const buildPaginationMeta = (page, limit, totalCount) => {
  const totalPages = Math.ceil(totalCount / limit) || 1;

  return {
    page,
    limit,
    totalCount,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};