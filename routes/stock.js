const express = require('express');
const router = express.Router();

const stock = require("../models/stock.js");
const auth = require("../models/auth.js");

router.get('/overview/:email',
    (req, res, next) => auth.checkToken(req, res, next),
    (req, res) => stock.userOverview(req, res));
router.get('/add-balance/:email',
    (req, res, next) => auth.checkToken(req, res, next),
    (req, res) => stock.getBalance(req, res));
router.post('/add-balance/',
    (req, res, next) => auth.checkToken(req, res, next),
    (req, res) => stock.addBalance(req, res));
router.post('/search/',
    (req, res, next) => auth.checkToken(req, res, next),
    (req, res) => stock.searchStock(req, res));
router.post('/buy/',
    (req, res, next) => auth.checkToken(req, res, next),
    (req, res) => stock.buyStock(req, res));
router.post('/sell/',
    (req, res, next) => auth.checkToken(req, res, next),
    (req, res) => stock.sellStock(req, res));

module.exports = router;
