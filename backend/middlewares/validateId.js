function validateId(req, res, next, value) {
    if (!/^[1-9]\d*$/.test(value)) {
        return res.status(400).json({ message: 'Identifiant invalide.' });
    }

    next();
}

module.exports = validateId;
