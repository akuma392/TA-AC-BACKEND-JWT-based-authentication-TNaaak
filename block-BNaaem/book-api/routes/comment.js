var express = require('express');
var router = express.Router();

var Book = require('../models/book');
var Comment = require('../models/comment');

router.get('/comment', (req, res, next) => {
  Comment.find({}, (err, comment) => {
    if (err) return next(err);

    res.json(comment);
  });
});

router.get('/:id/comment', (req, res, next) => {
  let id = req.params.id;
  Comment.findById(id, (err, comment) => {
    if (err) return next(err);

    res.json(comment);
  });
});
router.put('/:id', (req, res, next) => {
  let id = req.params.id;
  Comment.findByIdAndUpdate(id, req.body, (err, book) => {
    if (err) return next(err);

    res.json(book);
  });
});
router.delete('/:id', (req, res, next) => {
  let id = req.params.id;
  Comment.findByIdAndDelete(id, (err, comment) => {
    if (err) return next(err);

    res.json(comment);
  });
});

router.post('/:id/comments', (req, res, next) => {
  let id = req.params.id;
  req.body.bookId = id;
  Comment.create(req.body, (err, comment) => {
    if (err) return next(err);

    Book.findByIdAndUpdate(
      id,
      { $push: { comments: comment._id } },
      (err, book) => {
        if (err) return next(err);
        res.send(`${comment.comment} is added`);
      }
    );
  });
});

module.exports = router;
