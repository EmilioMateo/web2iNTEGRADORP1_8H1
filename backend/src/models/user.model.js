const db = require('../config/db');

const findByUsername = (username) => new Promise((resolve, reject) => {
    db.query('SELECT * FROM usuarios WHERE username = ?', [username], (error, results) => {
        if (error) reject(error);
        resolve(results[0] || null);
    });
});

const create = ({ username, password, rol }) => new Promise((resolve, reject) => {
    db.query(
        'INSERT INTO usuarios (username, password, rol) VALUES (?, ?, ?)',
        [username, password, rol],
        (error, result) => {
            if (error) reject(error);
            resolve({ id: result.insertId, username, rol });
        }
    );
});

module.exports = {
    findByUsername,
    create
};
