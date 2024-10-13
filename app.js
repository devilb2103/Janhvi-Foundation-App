const express = require('express');
const { db } = require('./utils/firebase');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const workerRoutes = require('./routes/workers');
const attendanceRoutes = require('./routes/attendance');
const { initializeTables } = require('./initialize_db');

const app = express();
app.use(express.json());

// Register all routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/attendance', attendanceRoutes);

// Initialize Firebase tables on server startup before first request
initializeTables();

app.get('/', (req, res) => {
	res.send('Server is running and database is initialized!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
