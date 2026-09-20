function errorHandler(err, req, res, next) {
    console.error(err);

    if (err.code === '23503' || err.code === '23001') {
        return res.status(409).json({
            message: 'Cette donnee est encore utilisee dans une autre partie de la base.'
        });
    }

    if (err.code === '23505') {
        return res.status(409).json({
            message: 'Cette operation cree un doublon interdit.'
        });
    }

    if (err.code === '23514') {
        return res.status(400).json({
            message: 'Une contrainte de la base de donnees n est pas respectee.'
        });
    }

    if (err.code === '22P02' || err.code === '22003') {
        return res.status(400).json({
            message: 'Format de donnee invalide.'
        });
    }

    res.status(500).json({ message: 'Une erreur interne est survenue.' });
}

module.exports = errorHandler;
