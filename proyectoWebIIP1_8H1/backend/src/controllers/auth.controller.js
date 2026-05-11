const db = require('../config/db');
const bcrypt = require('bcrypt');

const register = async (req, res) => {
    const { username, password, rol } = req.body;
    try {
        if (!username || !password) {
            return res.status(400).json({ error: 'Faltan datos' });
        }

        const checkSql = 'SELECT * FROM usuarios WHERE username = ?';
        db.query(checkSql, [username], async (error, results) => {
            if (error) return res.status(500).json({ error: 'Error en la base de datos' });
            if (results.length > 0) return res.status(400).json({ error: 'El usuario ya existe' });

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const insertSql = 'INSERT INTO usuarios (username, password, rol) VALUES (?, ?, ?)';
            const userRol = rol || 'usuario';
            db.query(insertSql, [username, hashedPassword, userRol], (insertError, result) => {
                if (insertError) return res.status(500).json({ error: 'Error al registrar usuario' });
                res.status(201).json({ message: 'Usuario registrado exitosamente' });
            });
        });
    } catch (err) {
        res.status(500).json({ error: 'Error del servidor' });
    }
};

const login = (req, res) => {
    const { username, password } = req.body;
    try {
        if (!username || !password) {
            return res.status(400).json({ error: 'Faltan datos' });
        }

        const sql = 'SELECT * FROM usuarios WHERE username = ?';
        db.query(sql, [username], async (error, results) => {
            if (error) return res.status(500).json({ error: 'Error en la base de datos' });
            if (results.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });

            const user = results[0];
            const validPassword = await bcrypt.compare(password, user.password);

            if (!validPassword) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            res.json({
                message: 'Login exitoso',
                user: {
                    id: user.id,
                    username: user.username,
                    rol: user.rol
                }
            });
        });
    } catch (err) {
        res.status(500).json({ error: 'Error del servidor' });
    }
};

module.exports = {
    register,
    login
};
