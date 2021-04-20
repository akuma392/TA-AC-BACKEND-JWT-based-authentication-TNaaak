var express = require('express');
var router = express.Router();
var auth = require('../middleware/auth');
var Article = require('../models/article');
var Comment = require('../models/comment');
var User = require('../models/user');

// create article

router.post('/', auth.verifyToken, async (req, res, next) => {
  req.body.article.author = req.user.userId;
  try {
    var article = await Article.create(req.body.article);
    console.log(article);
    res.json({
      article: article,
    });
  } catch (error) {
    next(error);
  }
});

// feed

router.get('/feed', auth.verifyToken, async (req, res, next) => {
  let loggedinUserId = req.user.userId;

  try {
    var user = await User.findById(loggedinUserId);
    var article = await Article.find({ author: { $in: user.followings } })
      .sort({ createdAt: -1 })
      .populate('author', 'username bio image');

    res.json({
      articles: article,
    });
  } catch (error) {
    next(error);
  }
});

// update article

router.put('/:slug', auth.verifyToken, async (req, res, next) => {
  let slug = req.params.slug;

  try {
    var article = await Article.findOne({ slug: slug });

    if (req.user.userId == article.author) {
      var updatedArticle = await Article.findOneAndUpdate(
        { slug: slug },
        req.body.article
      );
      console.log(article);
      res.json({
        article: updatedArticle,
      });
    } else {
      res.status(400).json({
        error: 'You are not authorized to update',
      });
    }
  } catch (error) {
    next(error);
  }
});

// create comments

router.post('/:slug/comments', auth.verifyToken, async (req, res, next) => {
  let slug = req.params.slug;
  console.log(req.body);
  req.body.comments.author = req.user.userId;
  try {
    var article = await Article.findOne({ slug: slug });
    req.body.comments.articleId = article._id;
    var comment = await Comment.create(req.body.comments);

    var updatedArticle = await Article.findByIdAndUpdate(article._id, {
      $push: { comments: comment._id },
    });
    var populatedComment = await Comment.findById(comment._id)
      .populate('author', '-_id bio image username following')
      .exec();

    res.json({
      comments: populatedComment,
    });
  } catch (error) {
    next(error);
  }
});

// all articles
router.get('/', async (req, res, next) => {
  var query = {};
  var limit = +req.query.limit || 20;
  var offset = +req.query.offset || 0;

  if (req.query.author) {
    var username = req.query.author;
    var user = await User.findOne({ username });
    query.author = user._id;
  }
  if (req.query.favourited) {
    console.log(req.query.favourited);
    var username = req.query.favourited;
    var user = await User.findOne({ username });
    console.log(user);
    query._id = { $in: user.favourites };
  }
  if (req.query.tag) {
    var tag = req.query.tag;
    query.tagList = tag;
  }
  console.log(query);
  try {
    var articles = await Article.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .populate('author', 'username bio image');
    return res.json({ articles });
  } catch (error) {
    return next(error);
  }
});

// single article using slug

router.get('/:slug', async (req, res, next) => {
  let slug = req.params.slug;

  try {
    var article = await Article.findOne({ slug: slug }).populate('comments');
    res.json({
      article: article,
    });
  } catch (error) {
    next(error);
  }
});

// list all comments of article
router.get('/:slug/comments', async (req, res, next) => {
  let slug = req.params.slug;

  try {
    var article = await Article.findOne({ slug: slug });

    var comments = await Comment.find({ articleId: article._id }).populate(
      'author',
      '_id name bio email username image'
    );
    res.json({
      comments: comments,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:slug/favorite', auth.verifyToken, async (req, res, next) => {
  let slug = req.params.slug;
  let loggedinUser = req.user.userId;
  var user = await User.findById(loggedinUser);

  try {
    var article = await Article.findOne({ slug: slug })
      .populate('author', 'username bio image following')
      .exec();

    console.log(article, 'textttttttttttttttttttt');
    if (!article.favouritedBy.includes(loggedinUser)) {
      article.favouritedBy.push(loggedinUser);

      article.favoritesCount += 1;
      article.save();
      article.favourite = true;
      res.json({
        article: article.toJSONFor(user),
      });
    }
  } catch (error) {
    next(error);
  }
});

// unfavorite article

router.delete('/:slug/favorite', auth.verifyToken, async (req, res, next) => {
  let slug = req.params.slug;
  let loggedinUser = req.user.userId;
  var user = await User.findById(loggedinUser);

  try {
    var article = await Article.findOne({ slug: slug })
      .populate('author')
      .exec();
    console.log(article, 'articleeeeee');
    if (article.favouritedBy.includes(loggedinUser)) {
      article.favouritedBy.pull(loggedinUser);

      article.favoritesCount -= 1;
      article.save();
      article.favourite = false;
      res.json({
        article: article.toJSONFor(user),
      });
    }
  } catch (error) {
    next(error);
  }
});
// delete article

router.delete('/:slug', auth.verifyToken, async (req, res, next) => {
  let slug = req.params.slug;
  let userId = req.user.userId;

  try {
    var article = await Article.findOne({ slug: slug });

    if (userId == article.author) {
      var deletedArticle = await Article.findOneAndDelete({ slug: slug });
      var comments = await Comment.deleteMany({ articleId: article._id });
    } else {
      return res.json(400).json({
        error: 'You are not authorized',
      });
    }
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
