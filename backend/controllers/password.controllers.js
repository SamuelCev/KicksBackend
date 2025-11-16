const { pool } = require('../services/dbConnection');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// Almacén en memoria para códigos de recuperación (en producción usa Redis)
const recoveryCodes = new Map();

// Configuración
const CODE_LENGTH = 6;
const CODE_EXPIRY_TIME = 15 * 60 * 1000; // 15 minutos en milisegundos
const MAX_CODE_ATTEMPTS = 3;

// Configurar transporte de email (actualiza con tus credenciales)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true para 465, false para otros puertos
    auth: {
        user: process.env.EMAIL_USER, // Tu email
        pass: process.env.EMAIL_PASSWORD // Tu contraseña o app password
    }
});

// Función para generar código aleatorio
const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Limpiar códigos expirados periódicamente
setInterval(() => {
    const now = Date.now();
    for (const [email, data] of recoveryCodes.entries()) {
        if (now > data.expiresAt) {
            recoveryCodes.delete(email);
        }
    }
}, 60000); // Limpiar cada minuto

// Solicitar código de recuperación
exports.requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    // Validación de campo
    if (!email) {
        return res.status(400).json({ 
            message: "El email es obligatorio" 
        });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Formato de email inválido" });
    }

    try {
        // Verificar si el usuario existe
        const [users] = await pool.query(
            'SELECT id, nombre, email, status FROM usuarios WHERE email = ?',
            [email]
        );

        // Por seguridad, siempre devolver el mismo mensaje aunque el email no exista
        // Esto previene la enumeración de usuarios
        if (users.length === 0) {
            return res.json({ 
                message: "Si el email existe en nuestro sistema, recibirás un código de recuperación" 
            });
        }

        const user = users[0];

        // Verificar si el usuario está activo
        if (user.status === 0) {
            return res.json({ 
                message: "Si el email existe en nuestro sistema, recibirás un código de recuperación" 
            });
        }

        // Generar código de recuperación
        const code = generateCode();
        const expiresAt = Date.now() + CODE_EXPIRY_TIME;

        // Guardar código en memoria
        recoveryCodes.set(email, {
            code: code,
            expiresAt: expiresAt,
            attempts: 0,
            userId: user.id
        });

        // Configurar email
        const mailOptions = {
            from: `"${process.env.APP_NAME || 'Tu Aplicación'}" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Código de recuperación de contraseña',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                        .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
                        .code { font-size: 32px; font-weight: bold; color: #4CAF50; text-align: center; padding: 20px; background-color: white; border: 2px dashed #4CAF50; border-radius: 5px; margin: 20px 0; letter-spacing: 5px; }
                        .warning { color: #f44336; font-weight: bold; margin-top: 20px; }
                        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Recuperación de Contraseña</h1>
                        </div>
                        <div class="content">
                            <p>Hola <strong>${user.nombre}</strong>,</p>
                            <p>Hemos recibido una solicitud para restablecer tu contraseña. Utiliza el siguiente código para continuar:</p>
                            
                            <div class="code">${code}</div>
                            
                            <p>Este código es válido por <strong>15 minutos</strong>.</p>
                            
                            <p class="warning">⚠️ Si no solicitaste este cambio, ignora este correo y tu contraseña permanecerá sin cambios.</p>
                            
                            <p>Por tu seguridad, nunca compartas este código con nadie.</p>
                        </div>
                        <div class="footer">
                            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        // Enviar email
        await transporter.sendMail(mailOptions);

        res.json({ 
            message: "Si el email existe en nuestro sistema, recibirás un código de recuperación",
            // En desarrollo, puedes descomentar esta línea para ver el código
            // code: code // ⚠️ ELIMINAR EN PRODUCCIÓN
        });

    } catch (error) {
        console.error("Error al solicitar recuperación de contraseña:", error);
        res.status(500).json({ 
            message: "Error al procesar la solicitud. Por favor, intenta más tarde" 
        });
    }
};

// Validar código y cambiar contraseña
exports.resetPasswordWithCode = async (req, res) => {
    const { email, code, newPassword } = req.body;

    // Validación de campos
    if (!email || !code || !newPassword) {
        return res.status(400).json({ 
            message: "Email, código y nueva contraseña son obligatorios" 
        });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Formato de email inválido" });
    }

    // Validar fortaleza de la nueva contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ 
            message: "La contraseña debe tener mínimo 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales" 
        });
    }

    try {
        // Verificar si existe un código de recuperación para este email
        const recoveryData = recoveryCodes.get(email);

        if (!recoveryData) {
            return res.status(400).json({ 
                message: "Código inválido o expirado. Solicita uno nuevo" 
            });
        }

        // Verificar si el código ha expirado
        if (Date.now() > recoveryData.expiresAt) {
            recoveryCodes.delete(email);
            return res.status(400).json({ 
                message: "El código ha expirado. Solicita uno nuevo" 
            });
        }

        // Verificar límite de intentos
        if (recoveryData.attempts >= MAX_CODE_ATTEMPTS) {
            recoveryCodes.delete(email);
            return res.status(429).json({ 
                message: "Demasiados intentos fallidos. Solicita un nuevo código" 
            });
        }

        // Validar el código
        if (recoveryData.code !== code) {
            recoveryData.attempts += 1;
            recoveryCodes.set(email, recoveryData);
            
            const remainingAttempts = MAX_CODE_ATTEMPTS - recoveryData.attempts;
            return res.status(400).json({ 
                message: "Código incorrecto",
                remainingAttempts: remainingAttempts
            });
        }

        // Código válido - proceder a cambiar la contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const [result] = await pool.query(
            'UPDATE usuarios SET password = ? WHERE id = ? AND status = 1',
            [hashedPassword, recoveryData.userId]
        );

        if (result.affectedRows === 0) {
            recoveryCodes.delete(email);
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Eliminar el código usado
        recoveryCodes.delete(email);

        // Enviar email de confirmación
        try {
            await transporter.sendMail({
                from: `"${process.env.APP_NAME || 'Tu Aplicación'}" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Contraseña cambiada exitosamente',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                            .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
                            .success { color: #4CAF50; font-size: 48px; text-align: center; }
                            .warning { color: #f44336; margin-top: 20px; padding: 15px; background-color: #ffebee; border-radius: 5px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>Contraseña Actualizada</h1>
                            </div>
                            <div class="content">
                                <div class="success">✓</div>
                                <p>Tu contraseña ha sido cambiada exitosamente.</p>
                                <p>Ya puedes iniciar sesión con tu nueva contraseña.</p>
                                <div class="warning">
                                    <strong>⚠️ ¿No realizaste este cambio?</strong><br>
                                    Si no fuiste tú quien cambió la contraseña, contacta inmediatamente con soporte.
                                </div>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            });
        } catch (emailError) {
            console.error("Error al enviar email de confirmación:", emailError);
            // No fallar la operación si el email de confirmación falla
        }

        res.json({ 
            message: "Contraseña cambiada exitosamente. Ya puedes iniciar sesión" 
        });

    } catch (error) {
        console.error("Error al cambiar contraseña:", error);
        res.status(500).json({ 
            message: "Error al cambiar la contraseña. Por favor, intenta más tarde" 
        });
    }
};
