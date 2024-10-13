const { db } = require('./utils/firebase');
const { duplicateCheck } = require('./utils/duplicateChecker');

const initializeTables = async () => {
	console.log('Checking and initializing required tables...');

	// Check and create default admin user if not exists
	const workersRef = db.ref('workers');
	const workersSnapshot = await workersRef.once('value');
	if (!workersSnapshot.exists()) {
		console.log('Creating default admin user...');
		workersRef.push({
			username: 'admin',
			// password: 'jahnvi', // Should be hashed in production
			role: 'ADMIN',
			fullName: 'Default Admin',
			contactNumber: '+0000000000',
			dob: '1990-01-01',
			doj: '1990-01-01',
			address: 'Admin Office',
		});
	}

	const loginCredentials = {
		username: 'admin', // Store worker ID
		password: 'jahnvi', // Store hashed password
		role: 'ADMIN',
	};

	// Check if login credentials already exist
	credentialsExist = await duplicateCheck(
		db,
		'logincredentials',
		'username',
		loginCredentials.username
	);

	// Push new login credentials to the logincredentials table
	if (!credentialsExist)
		await db.ref('logincredentials').push(loginCredentials);

	// // Initialize empty tables if they don't exist
	// const tables = ['attendance', 'projects', 'project_members', 'member_info'];
	// for (const table of tables) {
	// 	const ref = db.ref(table);
	// 	const snapshot = await ref.once('value');
	// 	if (!snapshot.exists()) {
	// 		console.log(`Initializing '${table}' table...`);
	// 		ref.set({});
	// 	}
	// }
	// console.log('Database initialization complete!');
};

module.exports = {
	initializeTables: initializeTables,
};
