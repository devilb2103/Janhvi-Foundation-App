const express = require('express');
const router = express.Router();
const {
	getAllProjects,
	createProject,
	updateWorkers,
	updateProject,
	getUserProjectData,
	deleteProject,
} = require('./manage');

router.get('/', getAllProjects);
router.get('/loadPageInfo', getUserProjectData);
router.post('/', createProject);
router.put('/', updateWorkers);
router.patch('/', updateProject);
router.delete('/deleteProject', deleteProject);

module.exports = router;
