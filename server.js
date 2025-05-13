const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Database connection
const db = mysql.createPool({
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password: 'Sachinten@123', // Replace with your MySQL password
    database: 'AirForceDB',
    port: 3306, // Default MySQL port, change if different
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection on startup
async function testConnection() {
    try {
        const [rows] = await db.query('SELECT 1');
        console.log('Database connection successful:', rows);
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1); // Exit if connection fails
    }
}
testConnection();

// Basic Authentication Middleware
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const correctPassword = 'airforce123';
    if (!authHeader || authHeader !== `Bearer ${correctPassword}`) {
        return res.status(401).json({ error: 'Unauthorized. Invalid or missing password.' });
    }
    next();
};

// GET: Fetch all Personnel
app.get('/api/personnel', authenticate, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM Personnel');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching personnel:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET: Fetch all Aircraft
app.get('/api/aircraft', authenticate, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM Aircraft');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching aircraft:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET: Fetch all Missions
app.get('/api/missions', authenticate, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM Missions');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching missions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET: Fetch all Security
app.get('/api/security', authenticate, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM Security');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching security:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET: Fetch all Logistics
app.get('/api/logistics', authenticate, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM Logistics');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching logistics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 1. Update Personnel Rank and Security Clearance (Promotion)
app.put('/api/personnel/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const { Ranks, SecurityClearance } = req.body;

    if (!Ranks || !SecurityClearance) {
        return res.status(400).json({ error: 'Ranks and SecurityClearance are required' });
    }

    try {
        const [result] = await db.execute(
            'UPDATE Personnel SET Ranks = ?, SecurityClearance = ? WHERE PersonnelID = ?',
            [Ranks, SecurityClearance, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Personnel not found' });
        }

        await db.execute(
            'UPDATE Security SET ClearanceLevel = ? WHERE PersonnelID = ?',
            [SecurityClearance, id]
        );

        res.json({ message: 'Personnel updated successfully' });
    } catch (error) {
        console.error('Error updating personnel:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 2. Delete Personnel (Retirement)
app.delete('/api/personnel/:id', authenticate, async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.execute(
            'DELETE FROM Personnel WHERE PersonnelID = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Personnel not found' });
        }

        res.json({ message: 'Personnel retired successfully' });
    } catch (error) {
        console.error('Error deleting personnel:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 3. Update Aircraft Maintenance Date
app.put('/api/aircraft/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const { LastMaintenanceDate } = req.body;

    if (!LastMaintenanceDate) {
        return res.status(400).json({ error: 'LastMaintenanceDate is required' });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(LastMaintenanceDate)) {
        return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    try {
        const [result] = await db.execute(
            'UPDATE Aircraft SET LastMaintenanceDate = ? WHERE AircraftID = ?',
            [LastMaintenanceDate, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Aircraft not found' });
        }

        res.json({ message: 'Aircraft maintenance updated successfully' });
    } catch (error) {
        console.error('Error updating aircraft:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 4. Delete Aircraft (Damage)
app.delete('/api/aircraft/:id', authenticate, async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.execute(
            'DELETE FROM Aircraft WHERE AircraftID = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Aircraft not found' });
        }

        res.json({ message: 'Aircraft deleted successfully' });
    } catch (error) {
        console.error('Error deleting aircraft:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 5. Update Mission Start Date or End Date
app.put('/api/missions/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const { Start_Date, End_Date } = req.body;

    if (!Start_Date && !End_Date) {
        return res.status(400).json({ error: 'At least one of Start_Date or End_Date is required' });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (Start_Date && !dateRegex.test(Start_Date)) {
        return res.status(400).json({ error: 'Invalid Start_Date format. Use YYYY-MM-DD' });
    }
    if (End_Date && !dateRegex.test(End_Date)) {
        return res.status(400).json({ error: 'Invalid End_Date format. Use YYYY-MM-DD' });
    }

    try {
        const [result] = await db.execute(
            'UPDATE Missions SET Start_Date = COALESCE(?, Start_Date), End_Date = COALESCE(?, End_Date) WHERE MissionID = ?',
            [Start_Date || null, End_Date || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Mission not found' });
        }

        res.json({ message: 'Mission updated successfully' });
    } catch (error) {
        console.error('Error updating mission:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 6. Delete Mission (Cancelled)
app.delete('/api/missions/:id', authenticate, async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.execute(
            'DELETE FROM Missions WHERE MissionID = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Mission not found' });
        }

        res.json({ message: 'Mission deleted successfully' });
    } catch (error) {
        console.error('Error deleting mission:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 7. Update Logistics Stock Level and LastRestocked
app.put('/api/logistics/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const { StockLevel, LastRestocked } = req.body;

    if (!StockLevel || !LastRestocked) {
        return res.status(400).json({ error: 'StockLevel and LastRestocked are required' });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(LastRestocked)) {
        return res.status(400).json({ error: 'Invalid LastRestocked format. Use YYYY-MM-DD' });
    }

    try {
        // Verify table and columns exist
        const [columns] = await db.execute("SHOW COLUMNS FROM Logistics");
        const columnNames = columns.map(col => col.Field);
        if (!columnNames.includes('StockLevel') || !columnNames.includes('LastRestocked') || !columnNames.includes('LogisticsID')) {
            return res.status(400).json({ error: 'Invalid table schema. Required columns: LogisticsID, StockLevel, LastRestocked' });
        }

        const [result] = await db.execute(
            'UPDATE Logistics SET StockLevel = ?, LastRestocked = ? WHERE LogisticsID = ?',
            [StockLevel, LastRestocked, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Logistics entry not found' });
        }

        res.json({ message: 'Logistics updated successfully' });
    } catch (error) {
        console.error('Error updating logistics:', error.message, error.stack);
        res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
});

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});