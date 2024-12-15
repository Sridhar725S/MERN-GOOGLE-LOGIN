// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const MongoStore = require('connect-mongo');
require('dotenv').config();
require('./config/passportConfig');

const authRoutes = require('./routes/authRoutes');
const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

app.use(cors({
    origin: 'https://mern-google-login.onrender.com', // Update with client domain
    credentials: true // Allow cookies to be sent
}));

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI, // MongoDB connection
            collectionName: 'sessions',
        }),
        cookie: {
            secure: true, // For HTTPS
            httpOnly: true,
            sameSite: 'none', // Required for cross-origin cookies
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        },
    })
);



app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);

app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Starting the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
