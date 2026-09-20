const pool = require('../config/db');

async function getAuthors(req, res, next) {
    try {
        const result = await pool.query('SELECT id, name, nationality FROM authors ORDER BY name ASC');
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
}

async function createAuthor(req, res, next) {
    try {
        const { name, nationality } = req.body;
        const result = await pool.query(
            'INSERT INTO authors (name, nationality) VALUES ($1, $2) RETURNING id, name, nationality',
            [String(name).trim(), String(nationality).trim()]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
}

async function updateAuthor(req, res, next) {
    try {
        const { id } = req.params;
        const { name, nationality } = req.body;
        const result = await pool.query(
            'UPDATE authors SET name = $1, nationality = $2 WHERE id = $3 RETURNING id, name, nationality',
            [String(name).trim(), String(nationality).trim(), id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Auteur introuvable.' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
}

async function deleteAuthor(req, res, next) {
    try {
        const result = await pool.query('DELETE FROM authors WHERE id = $1 RETURNING id', [req.params.id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Auteur introuvable.' });
        }

        res.json({ message: 'Auteur supprime.' });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAuthors,
    createAuthor,
    updateAuthor,
    deleteAuthor
};
