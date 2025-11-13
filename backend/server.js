const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const productsRoutes = require("./routes/products.routes");
const cartRoutes = require("./routes/cart.routes");

dotenv.config();

const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Servir archivos estáticos desde la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    optionsSuccessStatus: 200
}));

app.get("api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/products", productsRoutes);
app.use("/api/cart", cartRoutes);

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
