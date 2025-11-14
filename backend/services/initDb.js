const { pool } = require("./dbConnection");
const bcrypt = require("bcryptjs");

async function initTables() {
  const tables = [
    {
      name: "usuarios",
      createSQL: `
        CREATE TABLE usuarios (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nombre VARCHAR(100) NOT NULL,
          email VARCHAR(100) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          rol TINYINT DEFAULT 0,
          status TINYINT DEFAULT 1
        )
      `
    },
    {
        name: "productos",
        createSQL: `
          CREATE TABLE productos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL,
            descripcion TEXT NOT NULL,
            precio DECIMAL(10, 2) NOT NULL,
            stock INT NOT NULL,
            categoria VARCHAR(50) NOT NULL,
            descuento DECIMAL(3, 2) DEFAULT 0,
            imagen VARCHAR(255),
            hasDescuento TINYINT,
            estado TINYINT DEFAULT 1,
            INDEX idx_hasDescuento (hasDescuento)
          )
        `
    },
    {
      name: "producto_imagenes",
      createSQL: `
        CREATE TABLE producto_imagenes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          producto_id INT NOT NULL,
          url VARCHAR(255) NOT NULL,
          FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
          INDEX idx_producto (producto_id)
        )
      `
    },
    {
      name: "ordenes",
      createSQL: `
        CREATE TABLE ordenes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT NOT NULL,
            total DECIMAL(10, 2) NOT NULL,
            subtotal DECIMAL(10, 2) NOT NULL,
            impuestos DECIMAL(10, 2) NOT NULL,
            gasto_envio DECIMAL(10, 2) NOT NULL,
            metodo_pago VARCHAR(50) NOT NULL,
            nombre_envio VARCHAR(100) NOT NULL,
            direccion_envio VARCHAR(255) NOT NULL,
            ciudad VARCHAR(50) NOT NULL,
            codigo_postal VARCHAR(20) NOT NULL,
            telefono VARCHAR(20) NOT NULL,
            cupon VARCHAR(50),
            fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        )
      `
    },
    {
      name: "orden_items",
      createSQL: `
        CREATE TABLE orden_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            orden_id INT NOT NULL,
            producto_id INT NOT NULL,
            cantidad INT NOT NULL,
            precio_unitario DECIMAL(10, 2) NOT NULL,
            categoria VARCHAR(50) NOT NULL,
            FOREIGN KEY (orden_id) REFERENCES ordenes(id) ON DELETE CASCADE,
            FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT,
            INDEX idx_orden (orden_id),
            INDEX idx_producto (producto_id),
            INDEX idx_categoria (categoria)
        )
      `
    },
    {
      name: "carrito_items",
      createSQL: `
        CREATE TABLE carrito_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT NOT NULL,
            producto_id INT NOT NULL,
            cantidad INT NOT NULL,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT,
            INDEX idx_usuario (usuario_id),
            INDEX idx_producto (producto_id)
        )
      `        
    }

  ];

  try {
    const connection = await pool.getConnection();

    // Eliminar todas las tablas
    await connection.query("SET FOREIGN_KEY_CHECKS = 0");
    for (const table of tables) {
      await connection.query(`DROP TABLE IF EXISTS ${table.name}`);
    }
    await connection.query("SET FOREIGN_KEY_CHECKS = 1");

    // Crear tablas nuevas
    for (const table of tables) {
      await connection.query(table.createSQL);
    }

    // Crear usuario administrador por defecto
    const nombre = "Administrador";
    const email = "adminkicks@gmail.com";
    const passwordPlano = "Password1!";
    const passwordHasheado = await bcrypt.hash(passwordPlano, 10);
    const rol = 1;
    const status = 1;

    await connection.query(
      `INSERT INTO usuarios (nombre, email, password, rol, status)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, email, passwordHasheado, rol, status]
    );

    connection.release();
    console.log("Tablas eliminadas y recreadas desde cero.");
  } catch (error) {
    console.error("Error al reiniciar tablas:", error);
    throw error;
  }
}

initTables().then(() => {
  console.log("Inicialización de tablas completada.");
  process.exit(0);
}).catch((err) => {
  console.error("Error al inicializar tablas:", err);
  process.exit(1);
});