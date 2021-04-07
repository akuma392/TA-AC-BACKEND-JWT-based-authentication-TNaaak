var express = require('express');
var router = express.Router();
var auth = require('../middleware/auth');
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use(auth.verifyToken);
router.get('/protected', (req, res, next) => {
  console.log(req.user);
  res.json({ message: 'Protected content' });
});
module.exports = router;
