/**
 * Builds a reusable Atlas Search `$search` aggregation stage using a
 * compound "should" query — matches across multiple fields with
 * per-field relevance boosting and fuzzy (typo-tolerant) matching.
 *
 * @param {string} indexName - the Atlas Search index name (created via the script below)
 * @param {string} query - the user's search text
 * @param {Array<{path: string, boost?: number}>} fields - fields to search, with optional relevance weight
 */
export const buildTextSearchStage = (indexName, query, fields) => {
  return {
    $search: {
      index: indexName,
      compound: {
        should: fields.map(({ path, boost = 1 }) => ({
          text: {
            query,
            path,
            fuzzy: { maxEdits: 1 }, // tolerates small typos (1 character edit)
            score: { boost: { value: boost } },
          },
        })),
        minimumShouldMatch: 1, // must match at least one field
      },
    },
  };
};