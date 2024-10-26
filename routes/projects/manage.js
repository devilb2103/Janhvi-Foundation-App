const { duplicateCheck } = require('../../utils/duplicateChecker');
const { db } = require('../../utils/firebase');

/**
 * Retrieve all projects
 * @function getAllProjects
 * @returns {Promise<Object>} - All projects
 * @example
 * // Request
 * GET /api/projects
 * // Response
 * {
 *   "-LZJl8sZIzZJ8sZIzZ": {
 *     "projectName": "My Project",
 *     "projectOverview": "My project's overview"
 *   },
 *   "-LZJl9sZIzZJ9sZIzZ": {
 *     "projectName": "Another Project",
 *     "projectOverview": "Another project's overview"
 *   }
 * }
 */
const getAllProjects = async (req, res) => {
	try {
		const snapshot = await db.ref('projects').once('value');
		const projects = snapshot.val() || {};
		res.status(200).json(projects);
	} catch (error) {
		res.status(500).json({ error: 'Failed to retrieve projects' });
	}
};

/**
 * POST /api/projects - Create a new project
 * @param {Object} req.body - Request body
 * @param {string} req.body.projectName - Project name
 * @param {string} req.body.projectOverview - Project overview
 * @param {Array<string>} req.body.workers - List of worker IDs
 * @returns {Promise<Object>} - Created project with id
 * @example
 * // Request
 * {
 *   "projectName": "My Project",
 *   "projectOverview": "My project's overview",
 *   "workers": ["-LZJl8sZIzZJ8sZIzZ", "-LZJl9sZIzZJ9sZIzZ"]
 * }
 * // Response
 * {
 *   "message": "Project created",
 *   "projectId": "-LZJl8sZIzZJ8sZIzZ"
 * }
 */
const createProject = async (req, res) => {
	try {
		const { projectName, projectOverview, workers } = req.body;

		if (!projectName) {
			return res
				.status(400)
				.json({ message: 'Project name is required' });
		}
		if (!projectOverview) {
			return res
				.status(400)
				.json({ message: 'Project overview is required' });
		}

		if (!workers) {
			return res.status(400).json({ message: 'worker list is required' });
		}

		projectExists = await duplicateCheck(
			db,
			'projects',
			'projectName',
			projectName
		);

		if (projectExists) {
			return res
				.status(400)
				.json({ error: 'project name already exists' });
		}

		const newProject = { projectName, projectOverview, workers: workers };
		const ref = await db.ref('projects').push(newProject);
		res.status(201).json({
			message: 'Project created',
			projectId: ref.key,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Failed to add project' });
	}
};

/**
 * PUT /api/projects - Update a project's workers
 * @param {Object} req.body - Request body
 * @param {string} req.body.projectName - Project name
 * @param {string[]} req.body.workerUsernames - List of worker usernames to add
 * @returns {Promise<Object>} - Updated project with projectId
 * @example
 * // Request
 * {
 *   "projectName": "My Project",
 *   "workerUsernames": ["worker1", "worker2"]
 * }
 * // Response
 * {
 *   "message": "Workers added successfully to the project",
 *   "projectId": "-LZJl8sZIzZJ8sZIzZ"
 * }
 */
const updateWorkers = async (req, res) => {
	const { projectName, workerUsernames } = req.body;

	if (!projectName) {
		return res.status(400).json({ error: 'Project name is required' });
	}

	if (!workerUsernames || workerUsernames.length === 0) {
		return res.status(400).json({ error: 'No workers provided' });
	}

	try {
		// 1. Find the project by projectName
		const projectsRef = db.ref('projects');
		const projectsSnapshot = await projectsRef.once('value');
		const allProjects = projectsSnapshot.val();

		const projectEntry = Object.entries(allProjects).find(
			([key, project]) =>
				project.projectName.toLowerCase() === projectName.toLowerCase()
		);

		if (!projectEntry) {
			return res.status(404).json({ error: 'Project not found' });
		}

		const [projectId, projectData] = projectEntry;

		// 2. Fetch all workers
		const workersRef = db.ref('workers');
		const workersSnapshot = await workersRef.once('value');
		const allWorkers = workersSnapshot.val();

		// 3. Validate that each username exists
		const validUsernames = workerUsernames.filter((username) =>
			Object.values(allWorkers).some(
				(worker) => worker.username === username
			)
		);

		if (validUsernames.length === 0) {
			return res.status(404).json({
				error: 'No valid workers found with provided usernames',
			});
		}

		// 4. Update project's workers field with usernames
		const updatedWorkers = validUsernames;

		// 5. Update the project in Firebase
		await projectsRef.child(projectId).update({ workers: updatedWorkers });

		res.status(200).json({
			message: 'Workers added successfully to the project',
			projectId: projectId,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Failed to add workers to project' });
	}
};

/**
 * PATCH /api/projects - Update a project's details
 * @param {Object} req.body - Request body
 * @param {string} req.body.projectName - Project name
 * @param {string} [req.body.newProjectName] - New project name (optional)
 * @param {string} [req.body.projectOverview] - Project overview (optional)
 * @returns {Promise<Object>} - Updated project with projectId
 * @example
 * // Request
 * {
 *   "projectName": "My Project",
 *   "newProjectName": "My Renamed Project",
 *   "projectOverview": "This is my project's overview"
 * }
 * // Response
 * {
 *   "message": "Project updated successfully",
 *   "projectId": "-LZJl8sZIzZJ8sZIzZ"
 * }
 */
const updateProject = async (req, res) => {
	const { projectName, newProjectName, projectOverview } = req.body;

	if (!projectName) {
		return res.status(400).json({ error: 'Project name is required' });
	}

	try {
		// 1. Find the project by projectName
		const projectsRef = db.ref('projects');
		const projectsSnapshot = await projectsRef.once('value');
		const allProjects = projectsSnapshot.val();

		const projectEntry = Object.entries(allProjects).find(
			([key, project]) =>
				project.projectName.toLowerCase() === projectName.toLowerCase()
		);

		if (!projectEntry) {
			return res.status(404).json({ error: 'Project not found' });
		}

		const [projectId, projectData] = projectEntry;

		// 2. Prepare the updated data (only update provided fields)
		const updates = {};
		if (newProjectName) updates.projectName = newProjectName;
		if (projectOverview) updates.projectOverview = projectOverview;

		if (
			!updates.projectOverview ||
			updates.projectOverview == null ||
			updates.projectOverview.length === 0
		) {
			return res.status(404).json({
				error: 'You need to specifiy project overview to change',
			});
		}

		// 3. Update the project in Firebase
		await projectsRef.child(projectId).update(updates);

		res.status(200).json({
			message: 'Project updated successfully',
			projectId: projectId,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Failed to update project' });
	}
};

/**
 * GET /api/projects/user - Retrieves projects for a given worker
 * @function getUserProjectData
 * @param {Object} req - Request object
 * @param {string} req.query.username - Worker username
 * @returns {Promise<Object[]>} - List of projects with worker details
 * @example
 * // Request
 * GET /api/projects/user?username=worker1
 * // Response
 * [
 *   {
 *     "project_name": "My Project",
 *     "description": "My project's overview",
 *     "workers": [
 *       {
 *         "username": "worker1",
 *         "name": "John Doe",
 *         "contact_number": "+123456789012",
 *         "address": "Worker Address",
 *         "dob": "1990-01-01",
 *         "doj": "1990-01-01",
 *         "role": "WORKER"
 *       },
 *       {
 *         "username": "worker2",
 *         "name": "Jane Doe",
 *         "contact_number": "+987654321098",
 *         "address": "Worker Address",
 *         "dob": "1991-01-01",
 *         "doj": "1991-01-01",
 *         "role": "WORKER"
 *       }
 *     ]
 *   }
 * ]
 */
const getUserProjectData = async (req, res) => {
	const workerUsername = req.query.username; // Access the worker's username from query params

	if (!workerUsername) {
		return res.status(400).json({ error: 'Worker username is required' });
	}

	try {
		// Retrieve all projects
		const projectSnapshot = await db.ref('projects').once('value');
		if (!projectSnapshot.exists()) {
			return res.status(404).json({ error: 'No projects found' });
		}

		const allProjects = projectSnapshot.val();
		const projectsWithWorker = [];

		// Loop through projects and check if the worker is in the workers array
		for (const projectKey in allProjects) {
			const project = allProjects[projectKey];
			if (project.workers.includes(workerUsername)) {
				// Retrieve worker details for each worker in the project
				const workerDetails = await Promise.all(
					project.workers.map(async (workerUsername) => {
						const workerSnapshot = await db
							.ref('workers')
							.orderByChild('username')
							.equalTo(workerUsername)
							.once('value');
						const workerData = workerSnapshot.val();
						const workerKey = Object.keys(workerData)[0]; // Assuming worker keys are unique
						const worker = workerData[workerKey];

						return {
							username: worker.username,
							name: worker.fullName,
							contact_number: worker.contactNumber,
							address: worker.address,
							dob: worker.dob,
							doj: worker.doj,
							role: worker.role,
						};
					})
				);

				// Add the project with worker details to the response list
				projectsWithWorker.push({
					project_name: project.projectName,
					description: project.projectOverview,
					workers: workerDetails,
				});
			}
		}

		if (projectsWithWorker.length === 0) {
			return res
				.status(404)
				.json({ error: 'No projects found for the given worker' });
		}

		// Send the list of projects with detailed worker info
		return res.json(projectsWithWorker);
	} catch (error) {
		console.error('Error fetching projects:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
};

/**
 * DELETE /api/projects - Delete a project by project name
 * @param {Object} req - Request object
 * @param {string} req.body.projectName - Name of the project to delete
 * @returns {Promise<Object>} - Confirmation message of deletion
 * @example
 * // Request
 * DELETE /api/projects
 * {
 *   "projectName": "My Project"
 * }
 * // Response
 * {
 *   "message": "Project deleted successfully",
 *   "projectId": "-LZJl8sZIzZJ8sZIzZ"
 * }
 */
const deleteProject = async (req, res) => {
	const { projectName } = req.body;

	if (!projectName) {
		return res.status(400).json({ error: 'Project name is required' });
	}

	try {
		// Find the project by projectName
		const projectsRef = db.ref('projects');
		const projectsSnapshot = await projectsRef.once('value');
		const allProjects = projectsSnapshot.val();

		const projectEntry = Object.entries(allProjects).find(
			([key, project]) =>
				project.projectName.toLowerCase() === projectName.toLowerCase()
		);

		if (!projectEntry) {
			return res.status(404).json({ error: 'Project not found' });
		}

		const [projectId] = projectEntry;

		// Delete the project from Firebase
		await projectsRef.child(projectId).remove();

		res.status(200).json({
			message: 'Project deleted successfully',
			projectId: projectId,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Failed to delete project' });
	}
};

module.exports = {
	getAllProjects,
	createProject,
	updateWorkers,
	updateProject,
	getUserProjectData,
	deleteProject,
};
