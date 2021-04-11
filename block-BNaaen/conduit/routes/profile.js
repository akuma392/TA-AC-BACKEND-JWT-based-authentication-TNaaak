var express = require('express');
var router = express.Router();
var User = require('../models/user');
var auth = require('../middleware/auth');

router.get('/:id', auth.verifyToken, async (req, res, next) => {
  let id = req.params.id;
  try {
    var profile = await User.findOne(
      { username: id },
      '_id username bio image email'
    );
    if (profile) {
      res.json({
        profile: profile,
      });
    } else {
      res.json({
        error: 'username doesnt exists',
      });
    }
  } catch (error) {
    next(error);
  }
});
module.exports = router;
