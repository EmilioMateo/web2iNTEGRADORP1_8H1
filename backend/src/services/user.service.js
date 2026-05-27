const bcrypt = require('bcrypt');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateProfileUpdatePayload = ({ correo, currentPassword, newPassword, confirmPassword }) => {
    const wantsCorreoChange = correo !== undefined && correo !== '';
    const wantsPasswordChange = newPassword !== undefined && newPassword !== '';

    if (!wantsCorreoChange && !wantsPasswordChange) {
        const error = new Error('No hay cambios para guardar');
        error.status = 400;
        throw error;
    }

    if (!currentPassword) {
        const error = new Error('Ingresa tu contrasena actual');
        error.status = 400;
        throw error;
    }

    if (wantsCorreoChange && !emailRegex.test(correo)) {
        const error = new Error('Ingresa un correo valido');
        error.status = 400;
        throw error;
    }

    if (wantsPasswordChange && newPassword !== confirmPassword) {
        const error = new Error('Las contrasenas no coinciden');
        error.status = 400;
        throw error;
    }
};

const validateCurrentPassword = async (currentPassword, hashedPassword) => {
    const validPassword = await bcrypt.compare(currentPassword, hashedPassword);

    if (!validPassword) {
        const error = new Error('La contrasena actual es incorrecta');
        error.status = 401;
        throw error;
    }
};

const buildProfileUpdate = async ({ correo, newPassword }) => {
    const fields = [];
    const values = [];

    if (correo) {
        fields.push('username = ?');
        values.push(correo);
    }

    if (newPassword) {
        fields.push('password = ?');
        values.push(await bcrypt.hash(newPassword, 10));
    }

    return { fields, values };
};

module.exports = {
    validateProfileUpdatePayload,
    validateCurrentPassword,
    buildProfileUpdate
};
