const express = require('express');
const router = express.Router();
const { getDB } = require('./backup');

router.get('/GetDB', getDB);

module.exports = router;
