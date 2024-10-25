const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = 3001; // Port for the Express server

// Enable CORS maine copy paste kis tha thoda kuch syntax error aaye the so i give to chatgpt okay
app.use(cors());

// PostgreSQL Pool Configuration

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', // Your machine’s public IP address
    database: 'fourth',
    password: 'arisha01',
    port: 5433,
   
});              


// Middleware to parse JSON bodies
app.use(express.json());

// Configure Multer for File Uploads
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage }); // Create multer instance

// Route to Upload Name and Image
app.post('/upload', upload.single('image'), async (req, res) => {
    const { name } = req.body; // Expecting JSON body with only name
    const imageBuffer = req.file ? req.file.buffer : null; // Get image buffer

    try {
        const query = 'INSERT INTO img (name, image) VALUES ($1, $2) RETURNING *'; // Changed table name to 'user1'
        const values = [name, imageBuffer]; // Include image buffer

        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]); // Respond with the inserted row
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).json({ error: 'Failed to upload data', details: error.message });
    }
});

// Route to Retrieve Records
app.get('/records', async (req, res) => {
    try {
        const query = 'SELECT id, name, image FROM img'; // Changed table name to 'user1'
        const result = await pool.query(query);

        // Convert images to Base64 format
        const recordsWithBase64Images = result.rows.map(record => ({
            id: record.id,
            name: record.name,
            image: record.image ? `data:image/jpeg;base64,${record.image.toString('base64')}` : null // Fixed string interpolation
        }));

        res.status(200).json(recordsWithBase64Images); // Respond with the modified records
    } catch (error) {
        console.error('Error fetching records:', error);
        res.status(500).json({ error: 'Failed to fetch records', details: error.message });
    }
});

// Graceful shutdown to close the pool when exiting
process.on('exit', () => {
    pool.end();
});

// Server Setup
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


