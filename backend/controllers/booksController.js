const pool = require('../config/db');

async function getBooks(req, res, next) {
    try {
        const search = String(req.query.search || '').trim();
        const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 50);
        const offset = (page - 1) * limit;
        const searchValue = `%${search}%`;

        const countResult = await pool.query(
            `SELECT COUNT(*) AS total
             FROM books b
             JOIN authors a ON a.id = b.author_id
             WHERE b.title ILIKE $1 OR a.name ILIKE $1`,
            [searchValue]
        );

        const result = await pool.query(
            `SELECT b.id, b.title, b.publication_year, b.status,
                    a.id AS author_id, a.name AS author_name, a.nationality AS author_nationality
             FROM books b
             JOIN authors a ON a.id = b.author_id
             WHERE b.title ILIKE $1 OR a.name ILIKE $1
             ORDER BY b.title ASC
             LIMIT $2 OFFSET $3`,
            [searchValue, limit, offset]
        );

        const total = Number(countResult.rows[0].total);

        res.json({
            data: result.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.max(Math.ceil(total / limit), 1)
            }
        });
    } catch (error) {
        next(error);
    }
}

async function createBook(req, res, next) {
    try {
        const { title, author_id, publication_year } = req.body;
        if (!Number.isInteger(Number(author_id)) || !Number.isInteger(Number(publication_year))) {
            return res.status(400).json({ message: 'Auteur ou annee invalide.' });
        }
        const result = await pool.query(
            `INSERT INTO books (title, author_id, publication_year)
             VALUES ($1, $2, $3)
             RETURNING id, title, author_id, publication_year, status`,
            [String(title).trim(), Number(author_id), Number(publication_year)]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
}

async function updateBook(req, res, next) {
    try {
        const { id } = req.params;
        const { title, author_id, publication_year } = req.body;
        if (!Number.isInteger(Number(author_id)) || !Number.isInteger(Number(publication_year))) {
            return res.status(400).json({ message: 'Auteur ou annee invalide.' });
        }
        const result = await pool.query(
            `UPDATE books
             SET title = $1, author_id = $2, publication_year = $3
             WHERE id = $4
             RETURNING id, title, author_id, publication_year, status`,
            [String(title).trim(), Number(author_id), Number(publication_year), id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Livre introuvable.' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
}

async function deleteBook(req, res, next) {
    try {
        const result = await pool.query('DELETE FROM books WHERE id = $1 RETURNING id', [req.params.id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Livre introuvable.' });
        }

        res.json({ message: 'Livre supprime.' });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getBooks,
    createBook,
    updateBook,
    deleteBook
};
