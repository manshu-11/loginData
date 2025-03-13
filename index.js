const express = require("express");
const loginData = require("./db.json");
const fs = require('fs');
const { json } = require("stream/consumers");
const app = express();
const PORT = 8000;
//middleware
app.use(express.json());
//Routs

app.get('/loginData', (req, res) => {
	return res.json(loginData);
});

app.post('/loginData', (req, res) => {
	const body = req.body;
	console.log(body);

	// Read existing data
	fs.readFile('./db.json', 'utf8', (err, data) => {
		let loginData = [];
		if (!err && data) {
			loginData = JSON.parse(data);
		}

		// Add new login data
		const newEntry = { ...body, id: loginData.length + 1 };
		loginData.push(newEntry);

		// Write updated data back to the file
		fs.writeFile('./db.json', JSON.stringify(loginData, null, 2), (err) => {
			if (err) {
				return res.status(500).json({ status: "Error", message: "Failed to write data" });
			}
			return res.json({ status: "Success", id: newEntry.id });
		});
	});
});

const getLoginData = () => {
	try {
		const data = fs.readFileSync('./db.json', 'utf8');
		return JSON.parse(data) || [];
	} catch (error) {
		console.error("Error reading file:", error);
		return [];
	}
};

const saveLoginData = (data, res, successMessage) => {
	fs.writeFile('./db.json', JSON.stringify(data, null, 2), (err) => {
		if (err) {
			return res.status(500).json({ status: "Error", message: "Failed to update data" });
		}
		return res.json({ status: "Success", message: successMessage });
	});
};

app.route('/loginData/:id')
	.get((req, res) => {
		const id = Number(req.params.id);
		const loginData = getLoginData();
		const loginInfo = loginData.find((logIfo) => logIfo.id === id);

		if (!loginInfo) {
			return res.status(404).json({ status: "Error", message: "User not found" });
		}
		return res.json(loginInfo);
	})

	.patch((req, res) => {
		const id = Number(req.params.id);
		const body = req.body;
		let loginData = getLoginData();
		let userIndex = loginData.findIndex((logIfo) => logIfo.id === id);

		if (userIndex === -1) {
			return res.status(404).json({ status: "Error", message: "User not found" });
		}

		// Update the user data
		loginData[userIndex] = { ...loginData[userIndex], ...body };

		saveLoginData(loginData, res, "User updated successfully");
	})

	.delete((req, res) => {
		const id = Number(req.params.id);
		let loginData = getLoginData();
		const filteredData = loginData.filter((logIfo) => logIfo.id !== id);

		if (filteredData.length === loginData.length) {
			return res.status(404).json({ status: "Error", message: "User not found" });
		}

		saveLoginData(filteredData, res, "User deleted successfully");
	});
app.listen(PORT, () => console.log(`Server stated at PORT: ${PORT}`));