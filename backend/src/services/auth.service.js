const bcrypt = require('bcrypt');
const User = require('../models/user.model');

const register = async ({ username, password, rol = 'usuario' }) => {
    if (!username || !password) {
        const error = new Error('Faltan datos');
        error.status = 400;
        throw error;
    }

    const existingUser = await User.findByUsername(username);
    if (existingUser) {
        const error = new Error('El usuario ya existe');
        error.status = 400;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, password: hashedPassword, rol });

    return { message: 'Usuario registrado exitosamente' };
};

const login = async ({ username, password }) => {
    if (!username || !password) {
        const error = new Error('Faltan datos');
        error.status = 400;
        throw error;
    }

    const user = await User.findByUsername(username);
    if (!user) {
        const error = new Error('Credenciales invalidas');
        error.status = 401;
        throw error;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        const error = new Error('Credenciales invalidas');
        error.status = 401;
        throw error;
    }

    return {
        message: 'Login exitoso',
        user: {
            id: user.id,
            username: user.username,
            rol: user.rol
        }
    };
};

module.exports = {
    register,
    login
};
