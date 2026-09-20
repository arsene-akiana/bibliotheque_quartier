const { Pool, types } = require('pg');
require('dotenv').config();

// Les colonnes DATE sont renvoyees telles quelles ("2026-09-19") au lieu d'objets Date.
// Cela evite les decalages de fuseau horaire dans l'interface.
types.setTypeParser(1082, (value) => value);

// En ligne (Render) : on utilise DATABASE_URL. En local : on garde les variables DB_*.
const config = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 5432),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    };

const pool = new Pool(config);

module.exports = pool;
