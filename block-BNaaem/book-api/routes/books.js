var express = require('express');
var router = express.Router();

var Book = require('../models/book');
var Comment = require('../models/comment');
var auth = require('../middleware/auth');

router.use(auth.verifyToken);
router.get('/', (req, res, next) => {
  console.log(req.user, 'verify token');
  Book.find({})
    .populate('comments')
    .exec((err, book) => {
      if (err) return next(err);

      res.json(book);
    });
});
router.get('/category', (req, res, next) => {
  Book.distinct('category').exec((err, result) => {
    if (err) return next(err);
    console.log(result, 'hi');
    res.json(result);
  });
});

router.get('/category/books', (req, res, next) => {
  Book.aggregate([
    {
      $unwind: '$category',
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
      },
    },
  ]).exec((err, book) => {
    res.json(book);
  });
});

router.get('/author', (req, res, next) => {
  console.log();
  Book.find({})
    .sort({ author: 1 })
    .populate('comments')
    .exec((err, book) => {
      if (err) return next(err);

      res.json(book);
    });
});
router.get('/:id', (req, res, next) => {
  let id = req.params.id;
  Book.findById(id, (err, book) => {
    if (err) return next(err);

    res.json(book);
  });
});

// router.use(auth.loggedInUser);

router.delete('/:id', (req, res, next) => {
  let id = req.params.id;
  Book.findByIdAndDelete(id, (err, book) => {
    if (err) return next(err);
    Comment.deleteMany({ bookId: id }, (err, comment) => {
      if (err) return next(err);
      res.json(book);
    });
  });
});

router.put('/:id', (req, res, next) => {
  let id = req.params.id;
  Book.findByIdAndUpdate(id, req.body, (err, book) => {
    if (err) return next(err);

    res.json(book);
  });
});
router.post('/', auth.verifyToken, (req, res, next) => {
  console.log(req.user, 'hello');
  Book.create(req.body, (err, book) => {
    if (err) return next(err);

    res.send(`${book.title} is added`);
  });
});

module.exports = router;
