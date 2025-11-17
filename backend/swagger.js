const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Metadatos de tu API
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Kicks",
      version: "1.0.0",
      description: "Documentación de los endpoints del proyecto",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor Local",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  // Esto buscará en tu carpeta routes cualquier archivo que termine en .routes.js
  apis: ["./routes/*.routes.js"], 
};

// Documentación en formato JSON
const swaggerSpec = swaggerJSDoc(options);

// Función para configurar nuestra documentación
const swaggerDocs = (app, port) => {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  console.log(
    `Documentación disponible en http://localhost:${port}/api/docs`
  );
};

module.exports = { swaggerDocs };