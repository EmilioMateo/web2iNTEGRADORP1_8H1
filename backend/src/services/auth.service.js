const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const validateRegisterPayload = ({ username, password }) => {
    if (!username || !password) {
        const error = new Error('Faltan datos');
        error.status = 400;
        throw error;
    }
};

const validateLoginPayload = ({ username, password }) => {
    if (!username || !password) {
        const error = new Error('Faltan datos');
        error.status = 400;
        throw error;
    }
};

const buildUserForRegister = async ({ username, password, rol = 'usuario' }) => {
    const hashedPassword = await bcrypt.hash(password, 10);

    return new User({
        username,
        password: hashedPassword,
        rol
    });
};

const validatePassword = async (plainPassword, hashedPassword) => {
    const validPassword = await bcrypt.compare(plainPassword, hashedPassword);

    if (!validPassword) {
        const error = new Error('Credenciales invalidas');
        error.status = 401;
        throw error;
    }
};

const generateToken = (user) => jwt.sign(
    {
        id: user.id,
        username: user.username,
        rol: user.rol
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
);

const buildLoginResponse = (user) => ({
    message: 'Login exitoso',
    token: generateToken(user),
    user: {
        id: user.id,
        username: user.username,
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
