const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// File to store form submissions
const submissionsFile = path.join(dataDir, 'submissions.json');

// Initialize submissions file if it doesn't exist
if (!fs.existsSync(submissionsFile)) {
    fs.writeFileSync(submissionsFile, JSON.stringify([]));
}

// Route to handle form submissions
app.post('/api/contact', (req, res) => {
    try {
        // Get form data
        const { name, email, subject, message } = req.body;
        
        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        
        // Create submission object with timestamp
        const submission = {
            id: Date.now().toString(),
            name,
            email,
            subject,
            message,
            timestamp: new Date().toISOString()
        };
        
        // Read existing submissions
        const submissions = JSON.parse(fs.readFileSync(submissionsFile));
        
        // Add new submission
        submissions.push(submission);
        
        // Write updated submissions back to file
        fs.writeFileSync(submissionsFile, JSON.stringify(submissions, null, 2));
        
        res.status(200).json({ success: true, message: 'Form submitted successfully!' });
    } catch (error) {
        console.error('Error saving form data:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
});

// Route to serve the HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
