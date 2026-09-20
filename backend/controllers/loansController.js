const pool = require('../config/db');

async function getLoans(req, res, next) {
    try {
        const status = String(req.query.status || 'all');
        let where = '';

        if (status === 'active') {
            where = 'WHERE l.returned_at IS NULL AND l.due_date >= CURRENT_DATE';
        } else if (status === 'overdue') {
            where = 'WHERE l.returned_at IS NULL AND l.due_date < CURRENT_DATE';
        } else if (status === 'returned') {
            where = 'WHERE l.returned_at IS NOT NULL';
        }

        const result = await pool.query(
            `SELECT l.id, l.loan_date, l.due_date, l.returned_at,
                    l.member_id, m.name AS member_name,
                    l.book_id, b.title AS book_title,
                    CASE
                        WHEN l.returned_at IS NULL AND l.due_date < CURRENT_DATE THEN 'overdue'
                        WHEN l.returned_at IS NULL THEN 'active'
                        ELSE 'returned'
                    END AS loan_status
             FROM loans l
             JOIN members m ON m.id = l.member_id
             JOIN books b ON b.id = l.book_id
             ${where}
             ORDER BY l.loan_date DESC, l.id DESC`,
            []
        );

        res.json(result.rows);
    } catch (error) {
        next(error);
    }
}

async function createLoan(req, res, next) {
    const client = await pool.connect();

    try {
        const { member_id, book_id, due_date } = req.body;
        if (!Number.isInteger(Number(member_id)) || !Number.isInteger(Number(book_id))) {
            return res.status(400).json({ message: 'Adherent ou livre invalide.' });
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(String(due_date))) {
            return res.status(400).json({ message: 'Date de retour invalide.' });
        }
        await client.query('BEGIN');

        const memberResult = await client.query('SELECT id FROM members WHERE id = $1', [member_id]);
        if (memberResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Adherent introuvable.' });
        }

        const bookResult = await client.query(
            'SELECT id, title, status FROM books WHERE id = $1 FOR UPDATE',
            [book_id]
        );

        if (bookResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Livre introuvable.' });
        }

        if (bookResult.rows[0].status !== 'available') {
            await client.query('ROLLBACK');
            return res.status(409).json({ message: 'Le livre est deja emprunte.' });
        }

        const loanResult = await client.query(
            `INSERT INTO loans (member_id, book_id, due_date)
             VALUES ($1, $2, $3)
             RETURNING id, member_id, book_id, loan_date, due_date`,
            [member_id, book_id, due_date]
        );

        await client.query(
            "UPDATE books SET status = 'borrowed' WHERE id = $1",
            [book_id]
        );

        await client.query('COMMIT');
        res.status(201).json(loanResult.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }
}

async function returnLoan(req, res, next) {
    const client = await pool.connect();

    try {
        const { id } = req.params;
        await client.query('BEGIN');

        const loanResult = await client.query(
            `SELECT id, book_id, returned_at
             FROM loans
             WHERE id = $1
             FOR UPDATE`,
            [id]
        );

        if (loanResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Emprunt introuvable.' });
        }

        const loan = loanResult.rows[0];
        if (loan.returned_at) {
            await client.query('ROLLBACK');
            return res.status(409).json({ message: 'Ce livre a deja ete rendu.' });
        }

        await client.query(
            'UPDATE loans SET returned_at = CURRENT_DATE WHERE id = $1',
            [id]
        );

        await client.query(
            "UPDATE books SET status = 'available' WHERE id = $1",
            [loan.book_id]
        );

        await client.query('COMMIT');
        res.json({ message: 'Livre rendu avec succes.' });
    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }
}

async function getStats(req, res, next) {
    try {
        const [books, members, active, overdue, topBook, topMember] = await Promise.all([
            pool.query('SELECT COUNT(*) AS count FROM books'),
            pool.query('SELECT COUNT(*) AS count FROM members'),
            pool.query("SELECT COUNT(*) AS count FROM loans WHERE returned_at IS NULL"),
            pool.query("SELECT COUNT(*) AS count FROM loans WHERE returned_at IS NULL AND due_date < CURRENT_DATE"),
            pool.query(
                `SELECT b.title, COUNT(l.id)::int AS loan_count
                 FROM books b
                 LEFT JOIN loans l ON l.book_id = b.id
                 GROUP BY b.id, b.title
                 ORDER BY loan_count DESC, b.title ASC
                 LIMIT 1`
            ),
            pool.query(
                `SELECT m.name, COUNT(l.id)::int AS loan_count
                 FROM members m
                 LEFT JOIN loans l ON l.member_id = m.id
                 GROUP BY m.id, m.name
                 ORDER BY loan_count DESC, m.name ASC
                 LIMIT 1`
            )
        ]);

        res.json({
            totalBooks: Number(books.rows[0].count),
            totalMembers: Number(members.rows[0].count),
            activeLoans: Number(active.rows[0].count),
            overdueLoans: Number(overdue.rows[0].count),
            mostBorrowedBook: topBook.rows[0] || null,
            mostActiveMember: topMember.rows[0] || null
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getLoans,
    createLoan,
    returnLoan,
    getStats
};
