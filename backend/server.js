const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');
const authorsRoutes = require('./routes/authorsRoutes');
const membersRoutes = require('./routes/membersRoutes');
const booksRoutes = require('./routes/booksRoutes');
const loansRoutes = require('./routes/loansRoutes');
const pool = require('./config/db');

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());
app.use(logger);

app.get('/api/health', async (req, res, next) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'ok', message: 'API et base de donnees accessibles.' });
    } catch (error) {
        next(error);
    }
});

app.use('/api/authors', authorsRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/loans', loansRoutes);

app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ message: 'Route API introuvable.' });
    }

    next();
});

app.use((err, req, res, next) => errorHandler(err, req, res, next));

app.listen(port, () => {
    console.log(`Serveur demarre sur http://localhost:${port}`);
});
