const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ mensaje: 'Token invalido o expirado' });
    }
};

const adminMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            mensaje: 'Usuario no autenticado'
        });
    }

    if (req.user.rol !== 'admin') {
        return res.status(403).json({
            mensaje: 'Acceso denegado. Solo administradores.'
        });
    }

    next();
};

module.exports = {
    verifyToken,
    adminMiddleware
};
