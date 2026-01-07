const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const workoutRoutes = require("./routes/workouts");
const programRoutes = require('./routes/programs');
const logRoutes = require('./routes/logs');
const gymRoutes = require("./routes/gym");

const app = express();
const corsOptions = {
    origin: process.env.FRONTEND_URL || '*', // Allow FRONTEND_URL or all if not set (fallback)
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static('uploads'));


app.use("/api/auth", authRoutes);
app.use("/api/workouts", workoutRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/logs', logRoutes);
app.use("/api/user", require("./routes/user"));
app.use("/api/meals", require("./routes/meals"));
app.use("/api/logs", require("./routes/logs"));
app.use("/api/friends", require("./routes/friends"));
app.use("/api/gym", gymRoutes);
app.use("/api/admin", require('./routes/admin'));
app.use("/api/trainer", require('./routes/trainer'));
app.use('/api/attendance', require('./routes/attendance'));



// Serve static assets in production
const path = require('path');
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static(path.join(__dirname, '../client/build')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'));
    });
}

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
