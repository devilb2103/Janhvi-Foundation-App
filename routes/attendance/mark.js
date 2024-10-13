const { db } = require('../../utils/firebase');

/**
 * POST /api/attendance - Mark attendance for a worker in a project
 * @param {string} req.body.workerID - Worker ID
 * @param {string} req.body.projectName - Project name
 * @param {string} req.body.Date - Date of attendance in the format 'YYYY-MM-DD'
 * @param {string} req.body.workDescription - Description of the work done
 * @param {string} [req.body.imagePath] - Image path (optional)
 * @returns {Promise<Object>} - Message and worker ID
 * @example
 * // Request
 * {
 *   "workerID": "worker1",
 *   "projectName": "My Project",
 *   "Date": "2022-01-01",
 *   "workDescription": "Work done on this day",
 *   "imagePath": "path/to/image.jpg"
 * }
 * // Response
 * {
 *   "message": "Attendance added successfully",
 *   "workerId": "worker1"
 * }
 */
const addAttendance = async (req, res) => {
	const { workerID, projectName, Date, workDescription, imagePath } =
		req.body;

	// Validate the required fields
	if (!workerID || !projectName || !Date || !workDescription || !imagePath) {
		return res.status(400).json({
			error: 'worker Id, Project name, date, and work description and image path are required',
		});
	}

	try {
		// Check if the project exists in the 'projects' table
		const projectSnapshot = await db.ref('projects').once('value');
		const projects = projectSnapshot.val() || {};

		const projectExists = Object.values(projects).some(
			(project) =>
				project.projectName.toLowerCase() === projectName.toLowerCase()
		);

		if (!projectExists) {
			return res.status(404).json({
				error: 'Project not found',
			});
		}

		// Prepare the attendance entry
		const attendanceData = {
			Date,
			workDescription,
			imagePath: imagePath || 'No image provided', // Optional field
		};

		// Reference to the specific worker and project in the attendance table
		const attendanceRef = db.ref(`attendance/${workerID}/${projectName}`);

		// Check if an entry with the same date already exists
		const snapshot = await attendanceRef
			.orderByChild('Date')
			.equalTo(Date)
			.once('value');
		const existingAttendance = snapshot.val();

		if (existingAttendance) {
			// If an entry with the same date exists, update it
			const attendanceKey = Object.keys(existingAttendance)[0]; // Get the key of the existing entry
			await attendanceRef.child(attendanceKey).update(attendanceData);

			res.status(200).json({
				message: 'Attendance updated successfully',
				workerId: workerID,
			});
		} else {
			// If no entry exists with the same date, create a new one
			await attendanceRef.push(attendanceData);

			res.status(200).json({
				message: 'Attendance added successfully',
				workerId: workerID,
			});
		}
	} catch (error) {
		console.error('Error adding/updating attendance:', error);
		res.status(500).json({
			error: 'Failed to add/update attendance entry',
		});
	}
};

/**
 * GET /api/attendance - Retrieves attendance records for a worker
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.workerID - Worker ID
 * @returns {Promise<Object>} - Attendance records
 * @example
 * // Request
 * GET /api/attendance?workerID=worker1
 * // Response
 * {
 *   "-LZJl8sZIzZJ8sZIzZ": {
 *     "Date": "2021-01-01",
 *     "Image": "worker1_20210101.jpg",
 *     "Project": "Project 1",
 *     "Status": "Present"
 *   },
 *   "-LZJl9sZIzZJ9sZIzZ": {
 *     "Date": "2021-01-02",
 *     "Image": "worker1_20210102.jpg",
 *     "Project": "Project 1",
 *     "Status": "Absent"
 *   }
 * }
 */
const getAttendance = async (req, res) => {
	const { workerID } = req.query;

	try {
		const snapshot = await db.ref(`attendance/${workerID}`).once('value');
		const attendanceRecords = snapshot.val();

		res.status(200).json(attendanceRecords);
	} catch (error) {
		console.error(error);
		res.status(500).json({
			error: 'Failed to retrieve attendance records',
		});
	}
};

module.exports = { addAttendance, getAttendance };
