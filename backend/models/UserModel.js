const { pool } = require('../services/dbConnection');

const findByEmail = async (email) => {
    try {
        const [users] = await pool.query(
            'SELECT id, nombre, email, password, rol, status FROM usuarios WHERE email = ?',
            [email]
        );
        return users.length > 0 ? users[0] : null;
    } catch (error) {
        console.error("Error en UserModel.findByEmail:", error);
        throw error;
    }
};

const findById = async (userId) => {
    try {
        const [users] = await pool.query(
            'SELECT id, nombre, email, rol, status FROM usuarios WHERE id = ?',
            [userId]
        );
        return users.length > 0 ? users[0] : null;
    } catch (error) {
        console.error("Error en UserModel.findById:", error);
        throw error;
    }
};

const findActiveById = async (userId) => {
    try {
        const [users] = await pool.query(
            'SELECT id, nombre, email, rol FROM usuarios WHERE id = ? AND status = 1',
            [userId]
        );
        return users.length > 0 ? users[0] : null;
    } catch (error) {
        console.error("Error en UserModel.findActiveById:", error);
        throw error;
    }
};

const getPasswordById = async (userId) => {
    try {
        const [users] = await pool.query(
            'SELECT password FROM usuarios WHERE id = ? AND status = 1',
            [userId]
        );
        return users.length > 0 ? users[0] : null;
    } catch (error) {
        console.error("Error en UserModel.getPasswordById:", error);
        throw error;
    }
};

const emailExists = async (email, excludeId = null) => {
    try {
        let query = 'SELECT id FROM usuarios WHERE email = ?';
        let params = [email];
        
        if (excludeId !== null) {
            query += ' AND id != ?';
            params.push(excludeId);
        }
        
        const [users] = await pool.query(query, params);
        return users.length > 0;
    } catch (error) {
        console.error("Error en UserModel.emailExists:", error);
        throw error;
    }
};

const createUser = async ({ nombre, email, hashedPassword, rol = 0, status = 1 }) => {
    try {
        const [result] = await pool.query(
            'INSERT INTO usuarios (nombre, email, password, rol, status) VALUES (?, ?, ?, ?, ?)',
            [nombre, email, hashedPassword, rol, status]
        );
        return result;
    } catch (error) {
        console.error("Error en UserModel.createUser:", error);
        throw error;
    }
};

const updateProfile = async (userId, nombre, email) => {
    try {
        const [result] = await pool.query(
            'UPDATE usuarios SET nombre = ?, email = ? WHERE id = ? AND status = 1',
            [nombre, email, userId]
        );
        return result;
    } catch (error) {
        console.error("Error en UserModel.updateProfile:", error);
        throw error;
    }
};

const updatePassword = async (userId, hashedPassword) => {
    try {
        const [result] = await pool.query(
            'UPDATE usuarios SET password = ? WHERE id = ?',
            [hashedPassword, userId]
        );
        return result;
    } catch (error) {
        console.error("Error en UserModel.updatePassword:", error);
        throw error;
    }
};

module.exports = {
    findByEmail,
    findById,
    findActiveById,
    getPasswordById,
    emailExists,
    createUser,
    updateProfile,
    updatePassword
};
