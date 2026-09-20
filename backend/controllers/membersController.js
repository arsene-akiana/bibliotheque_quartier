const pool = require('../config/db');

async function getMembers(req, res, next) {
    try {
        const result = await pool.query('SELECT id, name, contact FROM members ORDER BY name ASC');
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
}

async function createMember(req, res, next) {
    try {
        const { name, contact } = req.body;
        const result = await pool.query(
            'INSERT INTO members (name, contact) VALUES ($1, $2) RETURNING id, name, contact',
            [String(name).trim(), String(contact).trim()]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
}

async function updateMember(req, res, next) {
    try {
        const { id } = req.params;
        const { name, contact } = req.body;
        const result = await pool.query(
            'UPDATE members SET name = $1, contact = $2 WHERE id = $3 RETURNING id, name, contact',
            [String(name).trim(), String(contact).trim(), id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Adherent introuvable.' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
}

async function deleteMember(req, res, next) {
    try {
        const result = await pool.query('DELETE FROM members WHERE id = $1 RETURNING id', [req.params.id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Adherent introuvable.' });
        }

        res.json({ message: 'Adherent supprime.' });
    } catch (error) {
        next(error);
    }
}

async function getMemberLoans(req, res, next) {
    try {
        const result = await pool.query(
            `SELECT l.id, l.loan_date, l.due_date, l.returned_at,
                    b.id AS book_id, b.title,
                    CASE
                        WHEN l.returned_at IS NULL AND l.due_date < CURRENT_DATE THEN 'overdue'
                        WHEN l.returned_at IS NULL THEN 'active'
                        ELSE 'returned'
                    END AS loan_status
             FROM loans l
             JOIN books b ON b.id = l.book_id
             WHERE l.member_id = $1
             ORDER BY l.loan_date DESC, l.id DESC`,
            [req.params.id]
        );

        res.json(result.rows);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getMembers,
    createMember,
    updateMember,
    deleteMember,
    getMemberLoans
};
