var express = require('express');
var router = express.Router();
var auth = require('../middleware/auth');
var Article = require('../models/article');

/* GET users listing. */
router.get('/', async (req, res, next) => {
  try {
    var articles = await Article.find().populate(
      'author',
      'username bio image'
    );
    res.json({
      articles: articles,
    });
  } catch (error) {
    next(error);
  }
});

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

module.exports = router;
