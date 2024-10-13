const express = require('express');
const router = express.Router();
const { getAllWorkers, createWorker } = require('./manage');

// Register worker routes
router.get('/', getAllWorkers); // GET /api/workers
router.post('/', createWorker); // POST /api/workers

module.exports = router;
