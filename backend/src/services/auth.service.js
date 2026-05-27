const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateCorreo = (correo) => {
    if (!correo || !emailRegex.test(correo)) {
        const error = new Error('Ingresa un correo valido');
        error.status = 400;
        throw error;
    }
};

const validateRegisterPayload = ({ correo, password, confirmPassword }) => {
    if (!correo || !password || !confirmPassword) {
        const error = new Error('Faltan datos');
        error.status = 400;
        throw error;
    }

    validateCorreo(correo);

    if (password !== confirmPassword) {
        const error = new Error('Las contrasenas no coinciden');
        error.status = 400;
        throw error;
    }
};

const validateLoginPayload = ({ correo, password }) => {
    if (!correo || !password) {
        const error = new Error('Faltan datos');
        error.status = 400;
        throw error;
    }

    validateCorreo(correo);
};

const buildUserForRegister = async ({ correo, password }) => {
    const hashedPassword = await bcrypt.hash(password, 10);

    return new User({
        correo,
        password: hashedPassword,
        rol: 'usuario'
    });
};

const validatePassword = async (plainPassword, hashedPassword) => {
    const validPassword = await bcrypt.compare(plainPassword, hashedPassword);

    if (!validPassword) {
        const error = new Error('La contrasena es incorrecta');
        error.status = 401;
        throw error;
    }
};

const getCorreoFromUser = (user) => user.correo || user.username;

const getJwtSecret = () => {
    if (!process.env.JWT_SECRET) {
        const error = new Error('JWT_SECRET no configurado');
        error.status = 500;
        throw error;
    }

    return process.env.JWT_SECRET;
};

const generateToken = (user) => jwt.sign(
    {
        id: user.id,
        correo: getCorreoFromUser(user),
        rol: user.rol
    },
    getJwtSecret(),
    { expiresIn: '1h' }
);

const buildLoginResponse = (user) => ({
    message: 'Login exitoso',
    token: generateToken(user),
    user: {
        id: user.id,
        correo: getCorreoFromUser(user),
        rol: user.rol
    }
});

module.exports = {
    validateRegisterPayload,
    validateLoginPayload,
    buildUserForRegister,
    validatePassword,
    buildLoginResponse
};
