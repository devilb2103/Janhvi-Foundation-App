const express = require('express');
const router = express.Router();
const { getAllWorkers, createWorker, deleteWorker } = require('./manage');

// Register worker routes
router.get('/', getAllWorkers); // GET /api/workers
router.post('/', createWorker); // POST /api/workers
router.delete('/deleteWorker', deleteWorker); // POST /api/workers

module.exports = router;
