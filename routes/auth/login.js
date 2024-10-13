const { db } = require('../../utils/firebase');

/**
 * POST /api/auth - Login
 * @function login
 * @param {Object} req.body - Request body
 * @param {string} req.body.username - Username
 * @param {string} req.body.password - Password
 * @param {string} req.body.role - Role (only 'ADMIN' is supported)
 * @returns {Promise<Object>} - { message: 'Login successful' }
 * @example
 * // Request
 * {
 *   "username": "admin",
 *   "password": "adminPassword",
 *   "role": "ADMIN"
 * }
 * // Response
 * {
 *   "message": "Login successful"
 * }
 */
const login = async (req, res) => {
	const { username, password, role } = req.body;

	// Validate request body
	if (!username || !password || !role) {
		return res
			.status(400)
			.json({ message: 'Username, password, and role are required' });
	}

	try {
		// Fetch login credentials from Firebase
		const loginRef = db.ref('logincredentials');
		const snapshot = await loginRef.once('value');
		const credentials = snapshot.val();

		// Find user by username
		const userEntry = Object.values(credentials).find(
			(user) => user.username.toLowerCase() === username.toLowerCase()
		);

		// If username is not found
		if (!userEntry) {
			return res
				.status(401)
				.json({ message: 'Invalid username or password.' });
		}

		// Check password
		if (userEntry.password !== password) {
			return res
				.status(401)
				.json({ message: 'Invalid username or password.' });
		}

		// Check role
		if (userEntry.role !== role) {
			return res
				.status(403)
				.json({ message: 'You do not have admin access' });
		}

		// If login is successful
		res.status(200).json({ message: 'Login successful' });
	} catch (error) {
		console.error('Error during login:', error);
		res.status(500).json({
			message: 'Server error. Please try again later.',
		});
	}
};

module.exports = { login };
