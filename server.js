const express = require('express');
const mysql = require('mysql2');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// MySQL Connection Pool
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'priya@1405', // MySQL password
    database: 'AirForceDB',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Test connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('MySQL Connection Failed:', err);
        return;
    }
    console.log('MySQL Connected');
    connection.release();
});

// Handle connection errors
db.on('error', (err) => {
    console.error('MySQL Pool Error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Reconnecting to MySQL...');
    } else {
        throw err;
    }
});


// ------------------- Personnel Endpoints -------------------

app.post('/api/personnel', (req, res) => {
    const { Personnel_Name, Ranks, Roles, Unit, DateOfEnlistment, SecurityClearance, ContactInfo } = req.body;
    console.log('Received personnel data:', req.body);

    if (!Personnel_Name || !Ranks || !Roles || !DateOfEnlistment || !SecurityClearance) {
        console.error('Missing required fields:', req.body);
        res.status(400).send('Missing required fields');
        return;
    }

    const sql = `
        INSERT INTO Personnel (Personnel_Name, Ranks, Roles, Unit, DateOfEnlistment, SecurityClearance, ContactInfo)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [Personnel_Name, Ranks, Roles, Unit, DateOfEnlistment, SecurityClearance, ContactInfo], (err, result) => {
        if (err) {
            console.error('Error inserting personnel:', err);
            res.status(500).send(`Error inserting personnel: ${err.sqlMessage || err.message}`);
            return;
        }
        res.status(200).send('Personnel added successfully');
    });
});

app.get('/api/personnel', (req, res) => {
    const sql = 'SELECT * FROM Personnel';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching personnel:', err);
            res.status(500).send(`Error fetching personnel: ${err.sqlMessage || err.message}`);
            return;
        }
        res.status(200).json(results);
    });
});

// ------------------- Missions Endpoints -------------------

app.post('/api/missions', (req, res) => {
    const { MissionID, MissionName, Mission_Type, StartDate, EndDate } = req.body;
    console.log('Received mission data:', req.body);

    if (!MissionID || !MissionName || !Mission_Type || !StartDate) {
        console.error('Missing required fields:', req.body);
        res.status(400).send('Missing required fields');
        return;
    }

    const sql = `
        INSERT INTO Missions (MissionID, MissionName, Mission_Type, StartDate, EndDate)
        VALUES (?, ?, ?, ?, ?)
    `;
    db.query(sql, [MissionID, MissionName, Mission_Type, StartDate, EndDate], (err, result) => {
        if (err) {
            console.error('Error inserting mission:', err);
            res.status(500).send(`Error inserting mission: ${err.sqlMessage || err.message}`);
            return;
        }
        res.status(200).send('Mission added successfully');
    });
});

app.get('/api/missions', (req, res) => {
    const sql = 'SELECT * FROM Missions';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching missions:', err);
            res.status(500).send(`Error fetching missions: ${err.sqlMessage || err.message}`);
            return;
        }
        res.status(200).json(results);
    });
});

// ------------------- Aircraft Endpoints -------------------

app.post('/api/aircraft', (req, res) => {
    const { Model, AirCraft_Type, SerialNumber, AirCraft_Status, LastMaintenanceDate, AssignedBase, PilotID } = req.body;
    console.log('Received aircraft data:', req.body);

    if (!Model || !AirCraft_Type || !SerialNumber || !AirCraft_Status) {
        console.error('Missing required fields:', req.body);
        res.status(400).send('Missing required fields');
        return;
    }

    const sql = `
        INSERT INTO Aircraft (Model, AirCraft_Type, SerialNumber, AirCraft_Status, LastMaintenanceDate, AssignedBase, PilotID)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [Model, AirCraft_Type, SerialNumber, AirCraft_Status, LastMaintenanceDate, AssignedBase, PilotID || null], (err, result) => {
        if (err) {
            console.error('Error inserting aircraft:', err);
            res.status(500).send(`Error inserting aircraft: ${err.sqlMessage || err.message}`);
            return;
        }
        res.status(200).send('Aircraft added successfully');
    });
});

app.get('/api/aircraft', (req, res) => {
    const sql = 'SELECT * FROM Aircraft';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching aircraft:', err);
            res.status(500).send(`Error fetching aircraft: ${err.sqlMessage || err.message}`);
            return;
        }
        res.status(200).json(results);
    });
});

// ------------------- Logistics Endpoints -------------------

app.post('/api/logistics', (req, res) => {
    const { ItemName, Category, StockLevel, LastRestocked, Supplier } = req.body;
    console.log('Received logistics data:', req.body);

    if (!ItemName || !Category || StockLevel === undefined) {
        console.error('Missing required fields:', req.body);
        res.status(400).send('Missing required fields');
        return;
    }

    const sql = `
        INSERT INTO Logistics (ItemName, Category, StockLevel, LastRestocked, Supplier)
        VALUES (?, ?, ?, ?, ?)
    `;
    db.query(sql, [ItemName, Category, StockLevel, LastRestocked, Supplier], (err, result) => {
        if (err) {
            console.error('Error inserting logistics item:', err);
            res.status(500).send(`Error inserting logistics: ${err.sqlMessage || err.message}`);
            return;
        }
        res.status(200).send('Logistics item added successfully');
    });
});

app.get('/api/logistics', (req, res) => {
    const sql = 'SELECT * FROM Logistics';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching logistics:', err);
            res.status(500).send(`Error fetching logistics: ${err.sqlMessage || err.message}`);
            return;
        }
        res.status(200).json(results);
    });
});

// ------------------- Security Endpoints -------------------

app.post('/api/security', (req, res) => {
    const { PersonnelID, ClearanceLevel, AccessAreas } = req.body;
    console.log('Received security data:', req.body);

    if (!PersonnelID || !ClearanceLevel) {
        console.error('Missing required fields:', req.body);
        res.status(400).send('Missing required fields');
        return;
    }

    const sql = `
        INSERT INTO Security (PersonnelID, ClearanceLevel, AccessAreas)
        VALUES (?, ?, ?)
    `;
    db.query(sql, [PersonnelID, ClearanceLevel, AccessAreas], (err, result) => {
        if (err) {
            console.error('Error inserting security clearance:', err);
            res.status(500).send(`Error inserting security clearance: ${err.sqlMessage || err.message}`);
            return;
        }
        res.status(200).send('Security clearance added successfully');
    });
});

app.get('/api/security', (req, res) => {
    const sql = 'SELECT * FROM Security';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching security records:', err);
            res.status(500).send(`Error fetching security: ${err.sqlMessage || err.message}`);
            return;
        }
        res.status(200).json(results);
    });
});

// ------------------- Server Start -------------------

app.listen(3000, () => console.log('Server running on port 3000'));
