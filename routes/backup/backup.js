const { db } = require('../../utils/firebase');

/**
 * GET /api/db - Retrieve entire database
 * @function getEntireDB
 * @returns {Promise<Object>} - Entire database contents
 * @example
 * // Request
 * GET /api/db
 * // Response
 * {
 *   "projects": { ... },
 *   "workers": { ... },
 *   "logincredentials": { ... }
 * }
 */
const getDB = async (req, res) => {
	try {
		const snapshot = await db.ref().once('value'); // Reference to root
		const entireDB = snapshot.val();
		res.status(200).json(entireDB);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Failed to retrieve database' });
	}
};

module.exports = { getDB };
