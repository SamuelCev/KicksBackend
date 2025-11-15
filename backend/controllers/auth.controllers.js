const { pool } = require('../services/dbConnection');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registro de nuevo usuario
exports.register = async (req, res) => {
    const { nombre, email, password } = req.body;

    // Validación de campos
    if (!nombre || !email || !password) {
        return res.status(400).json({ 
            message: "Todos los campos son obligatorios: nombre, email, password" 
        });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Formato de email inválido" });
    }

    // Validar fortaleza de contraseña
    // Mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un carácter especial
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ 
            message: "La contraseña debe tener mínimo 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales" 
        });
    }

    try {
        // Verificar si el email ya está registrado
        const [existingUser] = await pool.query(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({ message: "El email ya está registrado" });
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar nuevo usuario
        const [result] = await pool.query(
            'INSERT INTO usuarios (nombre, email, password, rol, status) VALUES (?, ?, ?, ?, ?)',
            [nombre, email, hashedPassword, 0, 1] // rol 0 = usuario normal, status 1 = activo
        );

        res.status(201).json({
            message: "Usuario registrado exitosamente",
            user: {
                id: result.insertId,
                nombre,
                email,
                rol: 0
            }
        });
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        res.status(500).json({ message: "Error al registrar usuario" });
    }
};

// Login de usuario
exports.login = async (req, res) => {
    const { email, password } = req.body;

    // Validación de campos
    if (!email || !password) {
        return res.status(400).json({ 
            message: "Email y contraseña son obligatorios" 
        });
    }

    try {
        // Buscar usuario por email
        const [users] = await pool.query(
            'SELECT id, nombre, email, password, rol, status FROM usuarios WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        const user = users[0];

        // Verificar si el usuario está activo
        if (user.status === 0) {
            return res.status(403).json({ message: "Usuario desactivado" });
        }

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        // Generar token JWT
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email,
                rol: user.rol 
            },
            process.env.JWT_SECRET || 'ioufrwenfcierowcnoewnrcuiewqoty4370829147',
            { expiresIn: '24h' }
        );

        // Enviar el token como cookie httpOnly
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 60 * 60 * 1000 // 1 hora
        });
        res.json({
            message: "Login exitoso",
            user: {
                id: user.id,
                nombre: user.nombre,
                rol: user.rol
            }
        });
    } catch (error) {
        console.error("Error al hacer login:", error);
        res.status(500).json({ message: "Error al hacer login" });
    }
};

// Obtener perfil del usuario autenticado
exports.getProfile = async (req, res) => {
    const userId = req.userId; // Viene del middleware de autenticación

    try {
        const [users] = await pool.query(
            'SELECT id, nombre, email, rol FROM usuarios WHERE id = ? AND status = 1',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.json(users[0]);
    } catch (error) {
        console.error("Error al obtener perfil:", error);
        res.status(500).json({ message: "Error al obtener perfil" });
    }
};

// Actualizar perfil del usuario
exports.updateProfile = async (req, res) => {
    const userId = req.userId;
    const { nombre, email } = req.body;

    if (!nombre || !email) {
        return res.status(400).json({ 
            message: "Nombre y email son obligatorios" 
        });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Formato de email inválido" });
    }

    try {
        // Verificar si el email ya está en uso por otro usuario
        const [existingUser] = await pool.query(
            'SELECT id FROM usuarios WHERE email = ? AND id != ?',
            [email, userId]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({ message: "El email ya está en uso" });
        }

        // Actualizar usuario
        const [result] = await pool.query(
            'UPDATE usuarios SET nombre = ?, email = ? WHERE id = ? AND status = 1',
            [nombre, email, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.json({
            message: "Perfil actualizado exitosamente",
            user: { id: userId, nombre, email }
        });
    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        res.status(500).json({ message: "Error al actualizar perfil" });
    }
};

// Cambiar contraseña
exports.changePassword = async (req, res) => {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
            message: "Contraseña actual y nueva contraseña son obligatorias" 
        });
    }

    // Validar fortaleza de la nueva contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ 
            message: "La nueva contraseña debe tener mínimo 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales" 
        });
    }

    try {
        // Obtener usuario
        const [users] = await pool.query(
            'SELECT password FROM usuarios WHERE id = ? AND status = 1',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Verificar contraseña actual
        const isPasswordValid = await bcrypt.compare(currentPassword, users[0].password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Contraseña actual incorrecta" });
        }

        // Hash de la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar contraseña
        await pool.query(
            'UPDATE usuarios SET password = ? WHERE id = ?',
            [hashedPassword, userId]
        );

        res.json({ message: "Contraseña actualizada exitosamente" });
    } catch (error) {
        console.error("Error al cambiar contraseña:", error);
        res.status(500).json({ message: "Error al cambiar contraseña" });
    }
};

// Logout de usuario
exports.logout = (req, res) => {
    try {
        // Eliminar la cookie del token
        res.clearCookie('token', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
        });
        
        res.json({ message: "Logout exitoso" });
    } catch (error) {
        console.error("Error al hacer logout:", error);
        res.status(500).json({ message: "Error al hacer logout" });
    }
};