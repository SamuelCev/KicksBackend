const CartModel = require('../models/CartModel');
const ProductModel = require('../models/ProductModel');

exports.getCartByUserId = async (req, res) => {
    //const userId  = req.userId;
    const userId = 1; // Temporalmente fijo para pruebas

    try {
        const rows = await CartModel.getCartItemsByUserId(userId);

        for (const row of rows) {
            const productInfo = await ProductModel.getProductInfo(row.producto_id);
            const productImage = await ProductModel.getProductFirstImage(row.producto_id);
            
            row.info_producto = {
                ...productInfo,
                imagen: productImage
            };
        }

        res.json(rows);
    } catch (error) {
        console.error("Error al obtener el carrito:", error);
        res.status(500).json({ message: "Error al obtener el carrito" });
    }
}

exports.addItemToCart = async (req, res) => {
    //const userId  = req.userId;
    const userId = 1; // Temporalmente fijo para pruebas

    const { productId, cantidad } = req.body;
    
    if (productId === undefined || cantidad === undefined) {
        return res.status(400).json({ message: "Los campos productId y cantidad son obligatorios" });
    }
    try {
        const result = await CartModel.addItem(userId, productId, cantidad);
        res.status(201).json({ id: result.insertId, userId, productId, cantidad });
    } catch (error) {
        console.error("Error al agregar el ítem al carrito:", error);
        res.status(500).json({ message: "Error al agregar el ítem al carrito" });
    }
}

exports.removeItemFromCart = async (req, res) => {
    //const userId  = req.userId;
    const userId = 1; // Temporalmente fijo para pruebas

    const { itemId } = req.params;
    
    try {
        const result = await CartModel.removeItem(itemId, userId);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Ítem no encontrado en el carrito" });
        }
        res.json({ message: "Ítem eliminado del carrito" });
    } catch (error) {
        console.error("Error al eliminar el ítem del carrito:", error);
        res.status(500).json({ message: "Error al eliminar el ítem del carrito" });
    }
}

exports.updateItemQuantity = async (req, res) => {
    //const userId  = req.userId;
    const userId = 1; // Temporalmente fijo para pruebas

    const { itemId } = req.params;
    const { cantidad } = req.body;
    
    if (cantidad === undefined || cantidad < 1) {
        return res.status(400).json({ message: "La cantidad debe ser al menos 1" });
    }

    try {
        // Verificar que el item existe y obtener el producto_id
        const item = await CartModel.getItemById(itemId, userId);
        
        if (!item) {
            return res.status(404).json({ message: "Ítem no encontrado en el carrito" });
        }

        // Verificar stock disponible
        const product = await ProductModel.getProductStock(item.producto_id);

        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        if (cantidad > product.stock) {
            return res.status(400).json({ 
                message: "Cantidad solicitada excede el stock disponible",
                stockDisponible: product.stock
            });
        }

        // Actualizar cantidad
        const result = await CartModel.updateItemQuantity(itemId, userId, cantidad);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "No se pudo actualizar el ítem" });
        }

        res.json({ message: "Cantidad actualizada correctamente", itemId, cantidad });
    } catch (error) {
        console.error("Error al actualizar cantidad:", error);
        res.status(500).json({ message: "Error al actualizar la cantidad" });
    }
}