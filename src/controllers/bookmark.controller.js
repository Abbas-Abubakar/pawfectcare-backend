import Bookmark from '../models/bookmark.model.js';
import BlogPost from '../models/blogPost.model.js';
import AppError from '../utils/appError.utils.js';
import asyncErrorHandler from '../utils/asyncErrorHandler.utils.js'
/**
 * @route   GET /api/bookmarks
 * @desc    Get the logged-in user's bookmarked posts
 */
export const getBookmarks = asyncErrorHandler(async (req, res, next) => {

  const bookmark = await Bookmark.findOne({ user: req.user._id }).populate({
    path: 'posts',
    match: { isActive: true },
    populate: { path: 'author', select: 'name role' },
  });

  if (!bookmark) {
    return res.status(200).json({
      success: true,
      bookmark: { posts: [] },
    });
  }

  res.status(200).json({
    success: true,
    bookmark,
  });

});

/**
 * @route   POST /api/bookmarks/:postId
 * @desc    Bookmark a blog post
 */
export const addBookmark = asyncErrorHandler(async (req, res, next) => {

  const { postId } = req.params;

  const post = await BlogPost.findOne({ _id: postId, isActive: true });
  if (!post) {
    throw new AppError('Blog post not found.', 404);
  }

  let bookmark = await Bookmark.findOne({ user: req.user._id });

  if (!bookmark) {
    bookmark = await Bookmark.create({ user: req.user._id, posts: [postId] });
  } else if (!bookmark.posts.includes(postId)) {
    bookmark.posts.push(postId);
    await bookmark.save();
  }

  res.status(200).json({
    success: true,
    message: 'Post bookmarked.',
    bookmark,
  });

});

/**
 * @route   DELETE /api/bookmarks/:postId
 * @desc    Remove a bookmark
 */
export const removeBookmark = asyncErrorHandler(async (req, res, next) => {

  const { postId } = req.params;

  const bookmark = await Bookmark.findOne({ user: req.user._id });

  if (!bookmark) {
    throw new AppError('Bookmark not found.', 404);
  }

  bookmark.posts = bookmark.posts.filter((id) => id.toString() !== postId);
  await bookmark.save();

  res.status(200).json({
    success: true,
    message: 'Bookmark removed.',
    bookmark,
  });

});