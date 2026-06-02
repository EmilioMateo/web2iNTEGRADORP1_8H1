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

const forgotPassword = (req, res) => {
    try {
        authService.validateForgotPasswordPayload(req.body);
    } catch (error) {
        return res.status(error.status || 500).json({ error: error.message || 'Error del servidor' });
    }

    const { correo } = req.body;
    const findSql = 'SELECT id FROM usuarios WHERE username = ?';

    db.query(findSql, [correo], async (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error en la base de datos' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'El correo no esta registrado' });
        }

        const resetCode = authService.buildResetCodeData();
        const updateSql = 'UPDATE usuarios SET reset_code_hash = ?, reset_code_expires = ? WHERE username = ?';

        db.query(updateSql, [resetCode.codeHash, resetCode.expiresAt, correo], async (updateError) => {
            if (updateError) {
                return res.status(500).json({ error: 'Error al guardar el codigo de recuperacion' });
            }

            try {
                await authService.sendResetCodeEmail(correo, resetCode.code);
                res.json({ message: 'Te enviamos un codigo de 6 digitos a tu correo' });
            } catch (sendError) {
                res.status(sendError.status || 500).json({ error: sendError.message || 'No se pudo enviar el correo' });
            }
        });
    });
};

const resetPassword = (req, res) => {
    try {
        authService.validateResetPasswordPayload(req.body);
    } catch (error) {
        return res.status(error.status || 500).json({ error: error.message || 'Error del servidor' });
    }

    const { correo, code, password } = req.body;
    const findSql = 'SELECT id, reset_code_hash, reset_code_expires FROM usuarios WHERE username = ?';

    db.query(findSql, [correo], async (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error en la base de datos' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'El correo no esta registrado' });
        }

        const user = results[0];

        try {
            authService.validateResetCodeForUser(user, code);
            const hashedPassword = await authService.buildPasswordHash(password);
            const updateSql = 'UPDATE usuarios SET password = ?, reset_code_hash = NULL, reset_code_expires = NULL WHERE id = ?';

            db.query(updateSql, [hashedPassword, user.id], (updateError) => {
                if (updateError) {
                    return res.status(500).json({ error: 'Error al actualizar la contrasena' });
                }

                res.json({ message: 'Contrasena actualizada correctamente' });
            });
        } catch (serviceError) {
            res.status(serviceError.status || 500).json({ error: serviceError.message || 'Error del servidor' });
        }
    });
};

module.exports = {
    register,
    login,
    forgotPassword,
    resetPassword
};
