const db = require('../config/db');
const authService = require('../services/auth.service');

const register = async (req, res) => {
    try {
        authService.validateRegisterPayload(req.body);
    } catch (error) {
        return res.status(error.status || 500).json({ error: error.message || 'Error del servidor' });
    }

    const { correo } = req.body;
    const checkSql = 'SELECT * FROM usuarios WHERE username = ?';

    db.query(checkSql, [correo], async (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error en la base de datos' });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: 'El correo ya existe' });
        }

        try {
            const user = await authService.buildUserForRegister(req.body);
            const insertSql = 'INSERT INTO usuarios (username, password, rol) VALUES (?, ?, ?)';

            db.query(insertSql, [user.correo, user.password, user.rol], (insertError) => {
                if (insertError) {
                    return res.status(500).json({ error: 'Error al registrar usuario' });
                }

                res.status(201).json({ message: 'Cuenta registrada exitosamente' });
            });
        } catch (serviceError) {
            res.status(serviceError.status || 500).json({ error: serviceError.message || 'Error del servidor' });
        }
    });
};

const login = (req, res) => {
    try {
        authService.validateLoginPayload(req.body);
    } catch (error) {
        return res.status(error.status || 500).json({ error: error.message || 'Error del servidor' });
    }

    const { correo, password } = req.body;
    const sql = 'SELECT * FROM usuarios WHERE username = ?';

    db.query(sql, [correo], async (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error en la base de datos' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'El correo no esta registrado' });
        }

        try {
            const user = results[0];
            await authService.validatePassword(password, user.password);
            res.json(authService.buildLoginResponse(user));
        } catch (serviceError) {
            res.status(serviceError.status || 500).json({ error: serviceError.message || 'Error del servidor' });
        }
    });
};

module.exports = {
    register,
    login
};
