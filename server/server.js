const express = require('express');
const cors = require('cors');
const chargerRoutes = require('./routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('admin')); // Serve frontend files

// API Routes
app.use('/api', chargerRoutes);

// Start Server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
