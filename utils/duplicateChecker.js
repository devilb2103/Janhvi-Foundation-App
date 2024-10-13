/**
 * Checks if a value exists in a specific attribute in a given firebase real-time
 * database table.
 * @param {Object} db - The firebase real-time database object.
 * @param {string} tableName - The name of the table to check.
 * @param {string} attributeName - The name of the attribute to check.
 * @param {string} value - The value to check for.
 * @returns {boolean} - true if the value exists, false otherwise.
 */
async function duplicateCheck(db, tableName, attributeName, value) {
	// Check for existing worker with the same username (case insensitive)
	const tableRef = db.ref(tableName);
	const tableSnapshot = await tableRef.once('value');
	if (!tableSnapshot.exists()) return false;
	const values = tableSnapshot.val();

	const valueExists = Object.values(values).some(
		(item) => item[attributeName].toLowerCase() === value.toLowerCase()
	);

	return valueExists;
}

module.exports = { duplicateCheck };
