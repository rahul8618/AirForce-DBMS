const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (public folder)
app.use(express.static('public'));

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Sachinten@123',
    database: 'AirForceDB'
});

db.connect((err) => {
    if (err) {
        console.error('MySQL Connection Error:', err);
        throw err;
    }
    console.log('MySQL Connected');
});

// API Endpoints for Data Fetching
app.get('/api/personnel', (req, res) => {
    db.query('SELECT PersonnelID, Personnel_Name, Ranks, Roles, Unit, DateOfEnlistment, SecurityClearance, ContactInfo FROM Personnel', (err, results) => {
        if (err) {
            console.error('Error fetching personnel:', err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        console.log('Personnel data:', results);
        res.json(results);
    });
});

app.get('/api/missions', (req, res) => {
    db.query('SELECT MissionID, Mission_Name, Mission_Type, Start_Date, End_Date, Location, Commander, Status FROM Missions', (err, results) => {
        if (err) {
            console.error('Error fetching missions:', err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        console.log('Missions data:', results);
        res.json(results);
    });
});

app.get('/api/aircraft', (req, res) => {
    db.query('SELECT AircraftID, Model, AirCraft_Type, SerialNumber, AirCraft_Status, LastMaintenanceDate, AssignedBase, PilotID FROM Aircraft', (err, results) => {
        if (err) {
            console.error('Error fetching aircraft:', err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        console.log('Aircraft data:', results);
        res.json(results);
    });
});

// API Endpoints for Form Submission
app.post('/api/personnel', (req, res) => {
    const { Personnel_Name, Ranks, Roles, Unit, DateOfEnlistment, SecurityClearance, ContactInfo } = req.body;
    const query = 'INSERT INTO Personnel (Personnel_Name, Ranks, Roles, Unit, DateOfEnlistment, SecurityClearance, ContactInfo) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [Personnel_Name, Ranks, Roles, Unit, DateOfEnlistment, SecurityClearance, ContactInfo], (err, results) => {
        if (err) {
            console.error('Error inserting personnel:', err);
            res.status(500).json({ error: 'Error saving personnel data' });
            return;
        }
        res.json({ success: true, message: 'Personnel data saved successfully' });
    });
});

app.post('/api/missions', (req, res) => {
    const { Mission_Name, Mission_Type, Start_Date, End_Date, Location, Commander, Status } = req.body;
    const query = 'INSERT INTO Missions (Mission_Name, Mission_Type, Start_Date, End_Date, Location, Commander, Status) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [Mission_Name, Mission_Type, Start_Date, End_Date, Location, Commander, Status], (err, results) => {
        if (err) {
            console.error('Error inserting mission:', err);
            res.status(500).json({ error: 'Error saving mission data' });
            return;
        }
        res.json({ success: true, message: 'Mission data saved successfully' });
    });
});

app.post('/api/aircraft', (req, res) => {
    const { Model, AirCraft_Type, SerialNumber, AirCraft_Status, LastMaintenanceDate, AssignedBase, PilotID } = req.body;
    const query = 'INSERT INTO Aircraft (Model, AirCraft_Type, SerialNumber, AirCraft_Status, LastMaintenanceDate, AssignedBase, PilotID) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [Model, AirCraft_Type, SerialNumber, AirCraft_Status, LastMaintenanceDate, AssignedBase, PilotID || null], (err, results) => {
        if (err) {
            console.error('Error inserting aircraft:', err);
            res.status(500).json({ error: 'Error saving aircraft data' });
            return;
        }
        res.json({ success: true, message: 'Aircraft data saved successfully' });
    });
});

// Form Submission Endpoints (for direct form submission without AJAX)
app.post('/personnel', (req, res) => {
    const { Personnel_Name, Ranks, Roles, Unit, DateOfEnlistment, SecurityClearance, ContactInfo } = req.body;
    const query = 'INSERT INTO Personnel (Personnel_Name, Ranks, Roles, Unit, DateOfEnlistment, SecurityClearance, ContactInfo) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [Personnel_Name, Ranks, Roles, Unit, DateOfEnlistment, SecurityClearance, ContactInfo], (err, results) => {
        if (err) {
            console.error('Error inserting personnel:', err);
            res.status(500).send('Error saving personnel data');
            return;
        }
        res.redirect('/personnel.html');
    });
});

app.post('/missions', (req, res) => {
    const { Mission_Name, Mission_Type, Start_Date, End_Date, Location, Commander, Status } = req.body;
    const query = 'INSERT INTO Missions (Mission_Name, Mission_Type, Start_Date, End_Date, Location, Commander, Status) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [Mission_Name, Mission_Type, Start_Date, End_Date, Location, Commander, Status], (err, results) => {
        if (err) {
            console.error('Error inserting mission:', err);
            res.status(500).send('Error saving mission data');
            return;
        }
        res.redirect('/missions.html');
    });
});

app.post('/aircraft', (req, res) => {
    const { Model, AirCraft_Type, SerialNumber, AirCraft_Status, LastMaintenanceDate, AssignedBase, PilotID } = req.body;
    const query = 'INSERT INTO Aircraft (Model, AirCraft_Type, SerialNumber, AirCraft_Status, LastMaintenanceDate, AssignedBase, PilotID) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [Model, AirCraft_Type, SerialNumber, AirCraft_Status, LastMaintenanceDate, AssignedBase, PilotID || null], (err, results) => {
        if (err) {
            console.error('Error inserting aircraft:', err);
            res.status(500).send('Error saving aircraft data');
            return;
        }
        res.redirect('/aircraft.html');
    });
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});