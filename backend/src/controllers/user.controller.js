const db = require('../config/db');
const userService = require('../services/user.service');

const getProfile = (req, res) => {
    const sql = 'SELECT id, username AS correo, rol FROM usuarios WHERE id = ?';

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
    const sql = 'SELECT id, total, fecha, orden_paypal, xml_cfdi FROM registro_compras WHERE id_usuario = ? ORDER BY id DESC';

    db.query(sql, [req.user.id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al obtener historial' });
        }

        res.json(results);
    });
};

const getAccounts = (req, res) => {
    const sql = 'SELECT id, username AS correo, rol FROM usuarios ORDER BY id DESC';

    db.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al obtener cuentas' });
        }

        res.json(results);
    });
};

const deleteAccount = (req, res) => {
    const accountId = Number(req.params.id);

    if (!accountId) {
        return res.status(400).json({ error: 'El id de la cuenta es obligatorio' });
    }

    if (accountId === req.user.id) {
        return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta de administrador' });
    }

    const findSql = 'SELECT id, username AS correo FROM usuarios WHERE id = ?';

    db.query(findSql, [accountId], (findError, users) => {
        if (findError) {
            return res.status(500).json({ error: 'Error en la base de datos' });
        }

        if (users.length === 0) {
            return res.status(404).json({ error: 'Cuenta no encontrada' });
        }

        const user = users[0];

        db.query('DELETE FROM carrito WHERE usernameUsuario = ?', [user.correo], (cartError) => {
            if (cartError) {
                return res.status(500).json({ error: 'No se pudo limpiar el carrito de la cuenta' });
            }

            db.query('UPDATE registro_compras SET id_usuario = NULL WHERE id_usuario = ?', [accountId], (historyError) => {
                if (historyError) {
                    return res.status(500).json({ error: 'No se pudo actualizar el historial de la cuenta' });
                }

                db.query('DELETE FROM usuarios WHERE id = ?', [accountId], (deleteError) => {
                    if (deleteError) {
                        return res.status(500).json({ error: 'Error al eliminar la cuenta' });
                    }

                    res.json({ message: 'Cuenta eliminada correctamente', id: accountId });
                });
            });
        });
    });
};

const updateProfile = (req, res) => {
    try {
        userService.validateProfileUpdatePayload(req.body);
    } catch (error) {
        return res.status(error.status || 500).json({ error: error.message || 'Error al actualizar perfil' });
    }

    const { correo, currentPassword } = req.body;
    const currentUserSql = 'SELECT id, username AS correo, password, rol FROM usuarios WHERE id = ?';

    db.query(currentUserSql, [req.user.id], async (error, users) => {
        if (error) {
            return res.status(500).json({ error: 'Error en la base de datos' });
        }

        if (users.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        try {
            const user = users[0];
            await userService.validateCurrentPassword(currentPassword, user.password);

            if (correo && correo !== user.correo) {
                const existsSql = 'SELECT id FROM usuarios WHERE username = ? AND id <> ?';

                db.query(existsSql, [correo, req.user.id], async (existsError, results) => {
                    if (existsError) {
                        return res.status(500).json({ error: 'Error en la base de datos' });
                    }

                    if (results.length > 0) {
                        return res.status(400).json({ error: 'Ese correo ya esta registrado en otra cuenta' });
                    }

                    await saveProfileUpdate(req, res, user);
                });

                return;
            }

            await saveProfileUpdate(req, res, user);
        } catch (serviceError) {
            res.status(serviceError.status || 500).json({ error: serviceError.message || 'Error al actualizar perfil' });
        }
    });
};

const saveProfileUpdate = async (req, res, currentUser) => {
    try {
        const update = await userService.buildProfileUpdate(req.body);
        const sql = `UPDATE usuarios SET ${update.fields.join(', ')} WHERE id = ?`;

        db.query(sql, [...update.values, req.user.id], (error) => {
            if (error) {
                return res.status(500).json({ error: 'Error al actualizar perfil' });
            }

            const updatedCorreo = req.body.correo || currentUser.correo;

            if (updatedCorreo !== currentUser.correo) {
                db.query('UPDATE carrito SET usernameUsuario = ? WHERE usernameUsuario = ?', [updatedCorreo, currentUser.correo], (cartError) => {
                    if (cartError) {
                        return res.status(500).json({ error: 'Perfil actualizado, pero no se pudo actualizar el carrito' });
                    }

                    res.json(buildProfileResponse(currentUser, updatedCorreo));
                });

                return;
            }

            res.json(buildProfileResponse(currentUser, updatedCorreo));
        });
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || 'Error al actualizar perfil' });
    }
};

const buildProfileResponse = (currentUser, correo) => ({
    message: 'Perfil actualizado correctamente',
    user: {
        id: currentUser.id,
        correo,
        rol: currentUser.rol
    }
});

module.exports = {
    getProfile,
    getOrderHistory,
    updateProfile,
    getAccounts,
    deleteAccount
};
