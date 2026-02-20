const express = require("express");
const { randomUUID } = require("crypto");

const DEFAULT_PORT = 3001;

const successResponse = (data = {}) => ({
	statusCode: 1,
	statusString: "OK",
	data,
});

const errorResponse = (message) => ({
	statusCode: 0,
	statusString: message,
});

const buildEvent = (user) => ({
	eventId: randomUUID(),
	userId: user.id,
	userName: user.name || "Unknown",
	eventTime: new Date().toISOString(),
	deviceName: "Mock Hikvision DS-K1T8003EF",
	attendanceType: "fingerprint",
});

function createMockDeviceServer({ port = DEFAULT_PORT } = {}) {
	const app = express();
	const store = {
		users: new Map(),
		logs: [],
	};

	app.use(express.json({ limit: "256kb" }));

	// Add User
	app.post("/ISAPI/AccessControl/UserInfo/Record", (req, res) => {
		console.log('Add user request:', JSON.stringify(req.body, null, 2));
		const userInfo = req.body?.UserInfo;
		if (!userInfo) {
			return res.status(400).json(errorResponse("UserInfo payload missing"));
		}

		const id = userInfo.id || userInfo.employeeNo || randomUUID();
		const storedUser = {
			id,
			name: userInfo?.name || userInfo?.employeeName || "Unknown",
			...userInfo,
		};

		store.users.set(id, storedUser);
		console.log('User added:', storedUser);
		console.log('Users in store:', Array.from(store.users.keys()));

		return res.json(
			successResponse({
				UserInfo: storedUser,
			})
		);
	});

	// Edit User
	app.put("/ISAPI/AccessControl/UserInfo/Modify", (req, res) => {
		console.log('Edit user request:', JSON.stringify(req.body, null, 2));
		const userInfo = req.body?.UserInfo;
		if (!userInfo) {
			return res.status(400).json(errorResponse("UserInfo payload missing"));
		}

		const id = userInfo.id || userInfo.employeeNo;
		console.log('Looking for user ID:', id);
		console.log('Users in store:', Array.from(store.users.keys()));
		
		if (!id) {
			return res.status(400).json(errorResponse("User id is required"));
		}

		const existing = store.users.get(id);
		if (!existing) {
			return res.status(404).json(errorResponse("User not found"));
		}

		const updatedUser = { ...existing, ...userInfo };
		store.users.set(id, updatedUser);
		console.log('User updated:', updatedUser);

		return res.json(
			successResponse({
				UserInfo: updatedUser,
			})
		);
	});

	// Delete User
	app.put("/ISAPI/AccessControl/UserInfo/Delete", (req, res) => {
		console.log('Delete user request:', JSON.stringify(req.body, null, 2));
		const userInfo = req.body?.UserInfo;
		if (!userInfo) {
			return res.status(400).json(errorResponse("UserInfo payload missing"));
		}

		const id = userInfo.id || userInfo.employeeNo;
		if (!id) {
			return res.status(400).json(errorResponse("User id is required"));
		}

		if (!store.users.has(id)) {
			return res.status(404).json(errorResponse("User not found"));
		}

		store.users.delete(id);
		console.log('User deleted:', id);

		return res.json(
			successResponse({
				UserInfo: { id },
			})
		);
	});

	// Get Attendance Logs
	app.post("/ISAPI/AccessControl/AcsEvent", (req, res) => {
		console.log('Get logs request:', JSON.stringify(req.body, null, 2));
		const search = req.body?.SearchDescription || {};
		const startTime = search.startTime ? new Date(search.startTime) : null;
		const endTime = search.endTime ? new Date(search.endTime) : null;
		const limit = Number(search.maxResults || 100);

		let filtered = [...store.logs];
		if (startTime) {
			filtered = filtered.filter(
				(event) => new Date(event.eventTime).getTime() >= startTime.getTime()
			);
		}
		if (endTime) {
			filtered = filtered.filter(
				(event) => new Date(event.eventTime).getTime() <= endTime.getTime()
			);
		}

		if (Number.isFinite(limit) && limit > 0) {
			filtered = filtered.slice(-limit);
		}

		console.log('Returning logs:', filtered.length);
		return res.json(
			successResponse({
				total: filtered.length,
				events: filtered,
			})
		);
	});

	// Simulate Fingerprint Scan
	app.post("/simulate-scan", (req, res) => {
		console.log('Simulate scan request:', JSON.stringify(req.body, null, 2));
		const { userId, employeeNo } = req.body || {};
		const id = userId || employeeNo;
		
		if (!id) {
			return res.status(400).json(errorResponse("userId or employeeNo is required"));
		}

		const user = store.users.get(id);
		if (!user) {
			console.log('User not found for scan, available users:', Array.from(store.users.keys()));
			return res.status(404).json(errorResponse("User not found"));
		}

		const event = buildEvent(user);
		store.logs.push(event);
		console.log('Scan event created:', event);

		return res.json(
			successResponse({
				event,
			})
		);
	});

	const server = app.listen(port, () => {
		console.log(`Mock Hikvision server listening on http://localhost:${port}`);
	});

	return { server, store };
}

if (require.main === module) {
	const { server } = createMockDeviceServer();
	
	// Keep the process alive
	process.on('SIGINT', () => {
		console.log('\nShutting down mock device server...');
		server.close(() => {
			console.log('Mock device server stopped');
			process.exit(0);
		});
	});
	
	console.log('Mock device server is running. Press Ctrl+C to stop.');
}

module.exports = { createMockDeviceServer };