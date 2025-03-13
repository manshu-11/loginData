const express = require("express");
const fs = require('fs');
const app = express();
const PORT = 8000;

// Middleware
app.use(express.json());

// Function to read data from db.json
const getLoginData = () => {
	try {
		const data = fs.readFileSync('./db.json', 'utf8');
		return JSON.parse(data) || [];
	} catch (error) {
		console.error("Error reading file:", error);
		return [];
	}
};

// Function to write data to db.json
const saveLoginData = (data, res, successMessage) => {
	fs.writeFile('./db.json', JSON.stringify(data, null, 2), (err) => {
		if (err) {
			return res.status(500).json({ status: "Error", message: "Failed to update data" });
		}
		return res.json({ status: "Success", message: successMessage });
	});
};

// ✅ GET all data
app.get('/loginData', (req, res) => {
	const loginData = getLoginData();
	return res.json(loginData);
});

// ✅ POST new data
app.post('/loginData', (req, res) => {
	const body = req.body;

	// Get current data from db.json
	let loginData = getLoginData();

	// Add new data with unique ID
	const newEntry = { ...body, id: loginData.length + 1 };
	loginData.push(newEntry);

	// Save to db.json
	saveLoginData(loginData, res, "User added successfully");
});

// ✅ CRUD routes
app.route('/loginData/:id')
	// Get single user by ID
	.get((req, res) => {
		const id = Number(req.params.id);
		const loginData = getLoginData();
		const loginInfo = loginData.find((logIfo) => logIfo.id === id);

		if (!loginInfo) {
			return res.status(404).json({ status: "Error", message: "User not found" });
		}
		return res.json(loginInfo);
	})

	// Update user data by ID
	.patch((req, res) => {
		const id = Number(req.params.id);
		const body = req.body;
		let loginData = getLoginData();
		let userIndex = loginData.findIndex((logIfo) => logIfo.id === id);

		if (userIndex === -1) {
			return res.status(404).json({ status: "Error", message: "User not found" });
		}

		// Update data
		loginData[userIndex] = { ...loginData[userIndex], ...body };

		saveLoginData(loginData, res, "User updated successfully");
	})

	// Delete user by ID
	.delete((req, res) => {
		const id = Number(req.params.id);
		let loginData = getLoginData();
		const filteredData = loginData.filter((logIfo) => logIfo.id !== id);

		if (filteredData.length === loginData.length) {
			return res.status(404).json({ status: "Error", message: "User not found" });
		}

		saveLoginData(filteredData, res, "User deleted successfully");
	});

// Start Server
app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));
