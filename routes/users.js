var express = require('express');
var router = express.Router();

const users = require("../models/users.js");

router.post('/login', (req, res) => users.login(res, req.body));
router.post('/register', (req, res) => users.register(res, req.body));

module.exports = router;
