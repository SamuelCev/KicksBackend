const express = require("express");
const dotenv = require("dotenv");
const productsRoutes = require("./routes/products.routes");

dotenv.config();

const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    optionsSuccessStatus: 200
}));

app.get("api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/products", productsRoutes);

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
