const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

// MySQL connection configurations for different databases
const dbConfigs = {
    default: {
        host: 'localhost',
        user: 'root',
        password: 'Bhuvana@2004',
        database: 'quizdb',
    },
    level2: {
        host: 'localhost',
        user: 'root',
        password: 'Bhuvana@2004',
        database: 'quizdb_level2',
    },
    software_testing: {
        host: 'localhost',
        user: 'root',
        password: 'Bhuvana@2004',
        database: 'software_testing_db',
    },
    software_config_management: {
        host: 'localhost',
        user: 'root',
        password: 'Bhuvana@2004',
        database: 'software_config_management_db',
    },
};

// Create a pool for each database configuration
const dbPools = {};
Object.keys(dbConfigs).forEach((key) => {
    dbPools[key] = mysql.createPool(dbConfigs[key]);
});

// Utility function to fetch a pool based on subject
const getPoolForSubject = (subject) => {
    if (subject === 'level2') return dbPools.level2;
    if (subject === 'software testing') return dbPools.software_testing;
    if (subject === 'software configuration management') return dbPools.software_config_management;
    return dbPools.default;
};

// Function to fetch questions for a subject
const getQuestions = (subject, numQuestions, callback) => {
    const pool = getPoolForSubject(subject);
    const tableName = 'questions';

    const query = `SELECT * FROM ${tableName} ORDER BY RAND() LIMIT ?`;

    pool.query(query, [parseInt(numQuestions)], (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results);
    });
};

// Endpoint to fetch questions
app.post('/get-questions', (req, res) => {
    const { subject, numQuestions } = req.body;

    getQuestions(subject, numQuestions, (err, questions) => {
        if (err) {
            res.status(500).json({ success: false, message: err.message });
            return;
        }
        res.json({ success: true, questions });
    });
});

app.listen(port, () => {
    console.log(`Quiz system running at http://localhost:${port}`);
});

app.get('/', (req, res) => {
    res.send('Backend is running!');
});
