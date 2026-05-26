const db = require('../config/db');

const getProfile = (req, res) => {
    const sql = 'SELECT id, username, rol FROM usuarios WHERE id = ?';

    db.query(sql, [req.user.id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al obtener perfil' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(results[0]);
    });
};

const getOrderHistory = (req, res) => {
    const sql = 'SELECT * FROM registro_compras ORDER BY id DESC';

    db.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al obtener historial' });
        }

        res.json(results);
    });
};

module.exports = {
    getProfile,
    getOrderHistory
};
