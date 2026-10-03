import Product from '../models/product.model.js';
import BlogPost from '../models/blogPost.model.js';
import AdoptionListing from '../models/adoptionListing.model.js';
import AppError from '../utils/appError.utils.js';
import { buildTextSearchStage } from '../utils/atlasSearch.utils.js';
import asyncErrorHandler from '../utils/asyncErrorHandler.utils.js'

/**
 * @route   GET /api/search?q=...
 * @desc    Unified search across products, blog posts, and adoption listings
 *          using Atlas Search, with per-field relevance boosting and fuzzy matching.
 */
export const globalSearch = asyncErrorHandler(async (req, res) => {

    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      throw new AppError('Search query must be at least 2 characters.', 400);
    }

    const [products, posts, adoptions] = await Promise.all([
      Product.aggregate([
        buildTextSearchStage('product_search', q, [
          { path: 'name', boost: 3 },
          { path: 'description', boost: 1 },
        ]),
        { $match: { isActive: true } },
        { $limit: 5 },
        { $project: { name: 1, category: 1, price: 1, image: 1 } },
      ]),
      BlogPost.aggregate([
        buildTextSearchStage('blog_search', q, [
          { path: 'title', boost: 3 },
          { path: 'excerpt', boost: 2 },
          { path: 'content', boost: 1 },
        ]),
        { $match: { isActive: true } },
        { $limit: 5 },
        { $project: { title: 1, excerpt: 1, category: 1, coverImage: 1 } },
      ]),
      AdoptionListing.aggregate([
        buildTextSearchStage('adoption_search', q, [
          { path: 'name', boost: 3 },
          { path: 'breed', boost: 2 },
          { path: 'description', boost: 1 },
        ]),
        { $match: { isActive: true, status: 'available' } },
        { $limit: 5 },
        { $project: { name: 1, species: 1, breed: 1, photos: 1 } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      query: q,
      results: {
        products,
        blogPosts: posts,
        adoptions,
      },
      totalResults: products.length + posts.length + adoptions.length,
    });
  
});