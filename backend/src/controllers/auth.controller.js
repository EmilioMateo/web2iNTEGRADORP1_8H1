const authService = require('../services/auth.service');

const register = async (req, res) => {
    try {
        const result = await authService.register(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.status ? error.message : 'Error del servidor' });
    }
};

const login = async (req, res) => {
    try {
        const result = await authService.login(req.body);
        res.json(result);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.status ? error.message : 'Error del servidor' });
    }
};

module.exports = {
    register,
    login
};
