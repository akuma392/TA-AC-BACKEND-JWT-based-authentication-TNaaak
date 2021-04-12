var express = require('express');
var router = express.Router();
var auth = require('../middleware/auth');
var Article = require('../models/article');
var Comment = require('../models/comment');

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
  console.log('hello', req.url);
  try {
    var articles = await Article.find()
      .populate('author', 'username bio image')
      .populate('comments');
    res.json({
      articles: articles,
    });
  } catch (error) {
    next(error);
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
