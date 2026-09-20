function validateFields(fields) {
    return (req, res, next) => {
        const errors = [];
        const body = req.body || {};

        for (const field of fields) {
            const value = body[field];

            if (value === undefined || value === null || String(value).trim() === '') {
                errors.push(`${field} est obligatoire`);
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({ message: 'Donnees invalides', errors });
        }

        next();
    };
}

module.exports = validateFields;
