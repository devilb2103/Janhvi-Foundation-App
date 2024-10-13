const express = require('express');
const router = express.Router();
const { addAttendance, getAttendance } = require('./mark');

router.get('/', getAttendance);
router.post('/', addAttendance);

module.exports = router;
