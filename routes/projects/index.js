const express = require('express');
const router = express.Router();
const {
	getAllProjects,
	createProject,
	updateWorkers,
	updateProject,
	getUserProjectData,
} = require('./manage');

router.get('/', getAllProjects);
router.get('/loadPageInfo', getUserProjectData);
router.post('/', createProject);
router.put('/', updateWorkers);
router.patch('/', updateProject);

module.exports = router;
