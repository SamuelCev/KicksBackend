const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "mi_usuario",
  password: process.env.DB_PASSWORD || "mi_password",
  database: process.env.DB_NAME || "mi_app_db",
  port: process.env.DB_PORT || 3306,
  timezone: '-06:00'
});


async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Conexión a la base de datos exitosa.");
    connection.release();
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error);
    throw error;
  }
}

module.exports = { pool, testConnection };