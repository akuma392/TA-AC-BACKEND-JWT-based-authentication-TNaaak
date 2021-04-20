var express = require('express');
var router = express.Router();
var User = require('../models/user');
var auth = require('../middleware/auth');

/* GET users listing. */
router.get('/', auth.verifyToken, async function (req, res, next) {
  var { email, userId } = req.user;
  var token = req.user.token;
  console.log(email, userId);
  // console.log(req.user);
  try {
    var user = await User.findById(userId);
    console.log(user, 'userrrrrrrrrr');
    res.json({ user: user.userJSON(token) });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  console.log(req.body);
  try {
    var user = await User.create(req.body.users);
    console.log(user);
    var token = await user.signToken();
    res.status(201).json({ user: user.userJSON(token) });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  var { email, password } = req.body.users;

  console.log(req.body.users, email, password, 'userrr');
  if (!email || !password) {
    return res.status(400).json({
      error: 'Email/password required',
    });
  }
  try {
    var user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        error: 'Email not registered',
      });
    }
    var result = await user.verifyPassword(password);
    console.log(user, result);
    if (!result) {
      return res.status(400).json({
        error: 'Invalid password',
      });
    }
    // generate token
    var token = await user.signToken();
    res.json({ user: user.userJSON(token) });
  } catch (error) {
    next(error);
  }
});

router.put('/', auth.verifyToken, async (req, res, next) => {
  console.log(req.user, req.body.users);
  try {
    let id = req.user.userId;

    var updatedUser = await User.findByIdAndUpdate(id, req.body.users);
    var user = await User.findById(id);
    console.log(updatedUser);
    res.json({
      users: user,
    });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
