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

module.exports = router;
