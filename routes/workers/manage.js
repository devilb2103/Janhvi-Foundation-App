const { duplicateCheck } = require('../../utils/duplicateChecker');
const { db } = require('../../utils/firebase');

// Helper function to validate contact number format
const isValidContactNumber = (number) => /^\+\d{10,15}$/.test(number);
const isValidRole = (role) => role === 'WORKER' || role === 'ADMIN';

/**
 * GET /api/workers - Retrieves all workers
 * @function getAllWorkers
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<Object>} - All workers
 * @example
 * // Request
 * GET /api/workers
 * // Response
 * {
 *   "-LZJl8sZIzZJ8sZIzZ": {
 *     "username": "worker1",
 *     "password": "worker1Password",
 *     "role": "WORKER",
 *     "fullName": "John Doe",
 *     "contactNumber": "+123456789012",
 *     "dob": "1990-01-01",
 *     "doj": "1990-01-01",
 *     "address": "Worker Address"
 *   },
 *   "-LZJl9sZIzZJ9sZIzZ": {
 *     "username": "worker2",
 *     "password": "worker2Password",
 *     "role": "WORKER",
 *     "fullName": "Jane Doe",
 *     "contactNumber": "+987654321098",
 *     "dob": "1991-01-01",
 *     "doj": "1991-01-01",
 *     "address": "Worker Address"
 *   }
 * }
 */
const getAllWorkers = async (req, res) => {
	try {
		const snapshot = await db.ref('workers').once('value');
		const workers = snapshot.val() || {};
		res.status(200).json(workers);
	} catch (error) {
		res.status(500).json({ error: 'Failed to retrieve workers' });
	}
};

/**
 * POST /api/workers - Create a new worker
 * @param {Object} req.body - Request body
 * @param {string} req.body.username - Username
 * @param {string} req.body.password - Password
 * @param {string} req.body.role - Role (only 'WORKER' is supported)
 * @param {string} req.body.fullName - Full name
 * @param {string} req.body.contactNumber - Contact number in the format +xxxxxxxxxxxx
 * @param {string} req.body.dob - Date of birth in the format 'YYYY-MM-DD'
 * @param {string} req.body.doj - Date of joining in the format 'YYYY-MM-DD'
 * @param {string} req.body.address - Address
 * @returns {Promise<Object>} - Created worker with id
 * @example
 * // Request
 * {
 *   "username": "worker1",
 *   "password": "worker1Password",
 *   "role": "WORKER",
 *   "fullName": "John Doe",
 *   "contactNumber": "+123456789012",
 *   "dob": "1990-01-01",
 *   "doj": "1990-01-01",
 *   "address": "Worker Address"
 * }
 * // Response
 * {
 *   "message": "Worker added successfully",
 *   "workerId": "-LZJl8sZIzZJ8sZIzZ"
 * }
 */
const createWorker = async (req, res) => {
	const {
		username,
		password,
		role,
		fullName,
		contactNumber,
		dob,
		doj,
		address,
	} = req.body;

	// Validate role and required fields
	if (!isValidRole(role) || !password) {
		return res
			.status(400)
			.json({ error: 'Invalid role or missing password' });
	}

	try {
		const newWorker = {
			username,
			// password,
			role,
			fullName,
			contactNumber,
			dob,
			doj,
			address,
		};

		usernameExists = await duplicateCheck(
			db,
			'workers',
			'username',
			username
		);

		if (usernameExists) {
			return res.status(400).json({ error: 'username already exists' });
		}

		const ref = await db.ref('workers').push(newWorker);

		// Create login credentials
		const loginCredentials = {
			username: username, // Store worker ID
			password: password, // Store hashed password
			role: role,
		};

		// Push new login credentials to the logincredentials table
		await db.ref('logincredentials').push(loginCredentials);

		res.status(201).json({
			message: 'Worker added successfully',
			workerId: ref.key,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Failed to add worker' });
	}
};

module.exports = { getAllWorkers, createWorker };
