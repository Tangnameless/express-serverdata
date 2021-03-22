var express = require('express');
var router = express.Router();

// GET 请求主页
// 将主页请求重定向至访问主页
router.get('/', (req, res) => {
  res.redirect('/api');
});

module.exports = router;
