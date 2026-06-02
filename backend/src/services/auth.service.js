const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Resend } = require('resend');
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

const validateForgotPasswordPayload = ({ correo }) => {
    if (!correo) {
        const error = new Error('Ingresa tu correo');
        error.status = 400;
        throw error;
    }

    validateCorreo(correo);
};

const validateResetPasswordPayload = ({ correo, code, password, confirmPassword }) => {
    if (!correo || !code || !password || !confirmPassword) {
        const error = new Error('Faltan datos para cambiar la contrasena');
        error.status = 400;
        throw error;
    }

    validateCorreo(correo);

    if (!/^\d{6}$/.test(String(code))) {
        const error = new Error('El codigo debe tener 6 digitos');
        error.status = 400;
        throw error;
    }

    if (password !== confirmPassword) {
        const error = new Error('Las contrasenas no coinciden');
        error.status = 400;
        throw error;
    }
};

const generateResetCode = () => String(crypto.randomInt(100000, 1000000));

const hashResetCode = (code) => crypto
    .createHash('sha256')
    .update(code)
    .digest('hex');

const getResetExpiration = () => new Date(Date.now() + 10 * 60 * 1000);

const buildPasswordHash = (password) => bcrypt.hash(password, 10);

const buildResetCodeData = () => {
    const code = generateResetCode();

    return {
        code,
        codeHash: hashResetCode(code),
        expiresAt: getResetExpiration()
    };
};

const sendResetCodeEmail = async (correo, code) => {
    if (!process.env.RESEND_API_KEY) {
        const error = new Error('RESEND_API_KEY no configurado en el servidor');
        error.status = 500;
        throw error;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
        from: 'GymStar <noreply@lemamx.com>',
        to: correo,
        subject: 'Codigo para recuperar tu contrasena - GymStar',
        html: `
            <div style="font-family: Arial, sans-serif; background: #1a0000; color: #fff; padding: 28px; border-radius: 12px; max-width: 560px; margin: 0 auto;">
                <h1 style="color: #ffb3b3; margin-bottom: 8px;">Recuperar contrasena</h1>
                <p style="color: #ddd;">Usa este codigo para cambiar tu contrasena en GymStar:</p>
                <p style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #fff; background: #831111; padding: 16px; border-radius: 10px; text-align: center;">${code}</p>
                <p style="color: #ccc;">El codigo vence en 10 minutos.</p>
                <p style="color: #888; font-size: 12px;">Si no solicitaste este cambio, ignora este correo.</p>
            </div>
        `
    });

    if (error) {
        const sendError = new Error(error.message);
        sendError.status = 400;
        throw sendError;
    }
};

const validateResetCodeForUser = (user, code) => {
    if (!user.reset_code_hash || !user.reset_code_expires) {
        const error = new Error('Primero solicita un codigo de recuperacion');
        error.status = 400;
        throw error;
    }

    if (new Date(user.reset_code_expires).getTime() < Date.now()) {
        const error = new Error('El codigo ya expiro, solicita uno nuevo');
        error.status = 400;
        throw error;
    }

    if (hashResetCode(String(code)) !== user.reset_code_hash) {
        const error = new Error('El codigo es incorrecto');
        error.status = 400;
        throw error;
    }
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
    validateForgotPasswordPayload,
    validateResetPasswordPayload,
    buildUserForRegister,
    buildResetCodeData,
    sendResetCodeEmail,
    validateResetCodeForUser,
    buildPasswordHash,
    validatePassword,
    buildLoginResponse
};
