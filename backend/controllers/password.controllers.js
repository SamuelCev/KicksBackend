const { pool } = require('../services/dbConnection');
const bcrypt = require('bcryptjs');
const { sendMailWithPdf } = require('../services/emailSender');
const crypto = require('crypto'); // Para generar tokens seguros

// Almacén en memoria para códigos y tokens
const recoveryCodes = new Map();
const verifiedTokens = new Map(); // NUEVO: Tokens verificados

// Configuración
const CODE_EXPIRY_TIME = 15 * 60 * 1000; // 15 minutos
const TOKEN_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutos para cambiar contraseña después de verificar
const MAX_CODE_ATTEMPTS = 3;

// Generar código aleatorio
const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generar token seguro
const generateToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Limpiar códigos y tokens expirados
setInterval(() => {
    const now = Date.now();
    
    // Limpiar códigos
    for (const [email, data] of recoveryCodes.entries()) {
        if (now > data.expiresAt) {
            recoveryCodes.delete(email);
        }
    }
    
    // Limpiar tokens
    for (const [token, data] of verifiedTokens.entries()) {
        if (now > data.expiresAt) {
            verifiedTokens.delete(token);
        }
    }
}, 60000); // Cada minuto

// ============================================
// PASO 1: SOLICITAR CÓDIGO
// ============================================
exports.requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ 
            message: "El email es obligatorio" 
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Formato de email inválido" });
    }

    try {
        const [users] = await pool.query(
            'SELECT id, nombre, email, status FROM usuarios WHERE email = ?',
            [email]
        );

        // Siempre devolver el mismo mensaje (prevenir enumeración)
        if (users.length === 0 || users[0].status === 0) {
            return res.json({ 
                message: "Si el email existe en nuestro sistema, recibirás un código de recuperación" 
            });
        }

        const user = users[0];
        const code = generateCode();
        const expiresAt = Date.now() + CODE_EXPIRY_TIME;

        // Guardar código
        recoveryCodes.set(email, {
            code: code,
            expiresAt: expiresAt,
            attempts: 0,
            userId: user.id,
            userName: user.nombre
        });

        // Enviar email
        await sendMailWithPdf({
            to: email,
            subject: 'Código de recuperación de contraseña - KICKS',
            text: `
                <h3>Recuperación de Contraseña</h3>
                <p>Hola <strong>${user.nombre}</strong>,</p>
                <p>Hemos recibido una solicitud para restablecer tu contraseña. Utiliza el siguiente código para continuar:</p>
                
                <div style="font-size: 32px; font-weight: bold; color: #D01110; text-align: center; padding: 20px; background-color: white; border: 2px dashed #D01110; border-radius: 8px; margin: 20px 0; letter-spacing: 5px;">${code}</div>
                
                <p>Este código es válido por <strong>15 minutos</strong>.</p>
                
                <p style="color: #f44336; font-weight: bold; margin-top: 20px;">⚠️ Si no solicitaste este cambio, ignora este correo y tu contraseña permanecerá sin cambios.</p>
                
                <p>Por tu seguridad, nunca compartas este código con nadie.</p>
            `,
            pdfPath: null,
            pdfName: null
        });

        res.json({ 
            message: "Si el email existe en nuestro sistema, recibirás un código de recuperación",
            success: true
        });

    } catch (error) {
        console.error("Error al solicitar recuperación:", error);
        res.status(500).json({ 
            message: "Error al procesar la solicitud. Por favor, intenta más tarde" 
        });
    }
};

// ============================================
// PASO 2: VERIFICAR CÓDIGO 
// ============================================
exports.verifyCode = async (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ 
            message: "Email y código son obligatorios" 
        });
    }

    try {
        const recoveryData = recoveryCodes.get(email);

        if (!recoveryData) {
            return res.status(400).json({ 
                valid: false,
                message: "Código inválido o expirado. Solicita uno nuevo" 
            });
        }

        // Verificar expiración
        if (Date.now() > recoveryData.expiresAt) {
            recoveryCodes.delete(email);
            return res.status(400).json({ 
                valid: false,
                message: "El código ha expirado. Solicita uno nuevo" 
            });
        }

        // Verificar límite de intentos
        if (recoveryData.attempts >= MAX_CODE_ATTEMPTS) {
            recoveryCodes.delete(email);
            return res.status(429).json({ 
                valid: false,
                message: "Demasiados intentos fallidos. Solicita un nuevo código" 
            });
        }

        // Validar código
        if (recoveryData.code !== code) {
            recoveryData.attempts += 1;
            recoveryCodes.set(email, recoveryData);
            
            const remainingAttempts = MAX_CODE_ATTEMPTS - recoveryData.attempts;
            return res.status(400).json({ 
                valid: false,
                message: "Código incorrecto",
                remainingAttempts: remainingAttempts
            });
        }

        const resetToken = generateToken();
        
        verifiedTokens.set(resetToken, {
            email: email,
            userId: recoveryData.userId,
            userName: recoveryData.userName,
            expiresAt: Date.now() + TOKEN_EXPIRY_TIME,
            used: false
        });

        // Eliminar el código usado
        recoveryCodes.delete(email);

        res.json({ 
            valid: true,
            message: "Código verificado correctamente",
            resetToken: resetToken // Token para el paso 3
        });

    } catch (error) {
        console.error("Error al verificar código:", error);
        res.status(500).json({ 
            valid: false,
            message: "Error al verificar el código" 
        });
    }
};

// ============================================
// PASO 3: CAMBIAR CONTRASEÑA 
// ============================================
exports.resetPassword = async (req, res) => {
    const { resetToken, newPassword } = req.body;

    // Validación de campos
    if (!resetToken || !newPassword) {
        return res.status(400).json({ 
            message: "Token y nueva contraseña son obligatorios" 
        });
    }

    // Validar fortaleza de la contraseña
    if (newPassword.length < 8) {
        return res.status(400).json({ 
            message: "La contraseña debe tener mínimo 8 caracteres" 
        });
    }

    // Validación más estricta (opcional - ajusta según tus necesidades)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ 
            message: "La contraseña debe incluir mayúsculas, minúsculas, números y caracteres especiales" 
        });
    }

    try {
        // Verificar token
        const tokenData = verifiedTokens.get(resetToken);

        if (!tokenData) {
            return res.status(400).json({ 
                message: "Token inválido o expirado" 
            });
        }

        // Verificar expiración
        if (Date.now() > tokenData.expiresAt) {
            verifiedTokens.delete(resetToken);
            return res.status(400).json({ 
                message: "El token ha expirado. Debes verificar el código nuevamente" 
            });
        }

        // Verificar que no haya sido usado
        if (tokenData.used) {
            verifiedTokens.delete(resetToken);
            return res.status(400).json({ 
                message: "Este token ya fue utilizado" 
            });
        }

        // Hashear nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar contraseña en BD
        const [result] = await pool.query(
            'UPDATE usuarios SET password = ? WHERE id = ? AND status = 1',
            [hashedPassword, tokenData.userId]
        );

        if (result.affectedRows === 0) {
            verifiedTokens.delete(resetToken);
            return res.status(404).json({ 
                message: "Usuario no encontrado o inactivo" 
            });
        }

        // Marcar token como usado y eliminarlo
        verifiedTokens.delete(resetToken);

        // Enviar email de confirmación
        try {
            await sendMailWithPdf({
                to: tokenData.email,
                subject: 'Contraseña actualizada exitosamente - KICKS',
                text: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0;">✓ Contraseña Actualizada</h1>
                        </div>
                        <div style="background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px;">
                            <p>Hola <strong>${tokenData.userName}</strong>,</p>
                            <p>Tu contraseña ha sido cambiada exitosamente.</p>
                            <p>Ya puedes iniciar sesión con tu nueva contraseña.</p>
                            <div style="margin-top: 30px; padding: 15px; background-color: #ffebee; border-left: 4px solid #f44336; border-radius: 4px;">
                                <strong style="color: #f44336;">⚠️ ¿No realizaste este cambio?</strong><br>
                                Si no fuiste tú quien cambió la contraseña, contacta inmediatamente con soporte.
                            </div>
                        </div>
                    </div>
                `,
                pdfPath: null,
                pdfName: null
            });
        } catch (emailError) {
            console.error("Error al enviar email de confirmación:", emailError);
            // No fallar la operación principal
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
