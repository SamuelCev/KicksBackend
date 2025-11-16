const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function searchProducts(params) {
    const { query, categoria, precioMin, precioMax } = params;
    
    let sql = `
        SELECT 
            id, 
            nombre, 
            marca, 
            descripcion, 
            precio, 
            stock, 
            categoria, 
            descuento,
            hasDescuento,
            imagen,
            CASE 
                WHEN hasDescuento = 1 THEN precio * (1 - descuento)
                ELSE precio
            END as precio_final
        FROM productos 
        WHERE estado = 1
    `;
    const sqlParams = [];
    
    if (query) {
        sql += ' AND (nombre LIKE ? OR marca LIKE ? OR descripcion LIKE ?)';
        sqlParams.push(`%${query}%`, `%${query}%`, `%${query}%`);
    }
    
    if (categoria) {
        sql += ' AND categoria = ?';
        sqlParams.push(categoria);
    }
    
    if (precioMin !== undefined) {
        sql += ' AND precio >= ?';
        sqlParams.push(precioMin);
    }
    
    if (precioMax !== undefined) {
        sql += ' AND precio <= ?';
        sqlParams.push(precioMax);
    }
    
    sql += ' ORDER BY nombre LIMIT 10';
    
    const [productos] = await pool.query(sql, sqlParams);
    return { ok: true, productos };
}
async function getCategories() {
    const [categorias] = await pool.query(
       `SELECT DISTINCT categoria
        FROM productos
        WHERE categoria IS NOT NULL AND estado = 1
        ORDER BY categoria`
    );
    return { ok: true, categorias: categorias.map(c => c.categoria) };
}
async function getBrands() {
    const [marcas] = await pool.query(
        `SELECT DISTINCT marca
        FROM productos
        WHERE marca IS NOT NULL AND estado = 1
        ORDER BY marca`
    );
    return { ok: true, marcas: marcas.map(m => m.marca) };
}
async function getProductDetails(params) {
    const { productId } = params;
    
    const [producto] = await pool.query(
        `SELECT
            p.*
            CASE
                WHEN p.hasDescuento = 1 THEN p.precio * (1 - p.descuento)
                ELSE p.precio
            END as precio_final
        FROM productos p
        WHERE p.id = ? AND p.estado = 1`,
        [productId]
    );

    if(producto.length === 0) {
        return { ok: false, message: "Producto no encontrado" };
    }

    const [imagenes] = await pool.query(
        'SELECT url FROM producto_imagenes WHERE producto_id = ?',
        [productId] 
    );

    return {
        ok: true,
        peoducto: {
            ...producto[0],
            imagenes_adicionales: imagenes.map(img => img.url)
        }
    };
}
async function getDiscontedProducts() {
    const [productos] = await pool.query(
        `SELECT
            id,
            nombre,
            marca,
            precio,
            descuento,
            precio * (1 - descuento) as precio_final,
            stock,
            categoria,
            imagen
        FROM productos
        WHERE hasDescuento = 1 AND estado = 1
        ORDER BY descuento DESC
        LIMIT 10`
    );
    return { ok: true, productos };
}

// Ejecutor de Funciones
async function executeFunction(functionName, functionArgs) {
    try {
        switch (functionName) {
            case 'search_products':
                return await searchProducts(functionArgs);
            case 'get_categories':
                return await getCategories();
            case 'get_brands':
                return await getBrands();
            case 'get_product_details':
                return await getProductDetails(functionArgs);
            case 'get_disconted_products':
                return await getDiscontedProducts();
            default:
                return { ok: false, message: "Función no encontrada" };
        }

    } catch (error) {
        console.error(`Error ejecutando ${functionName}: `, error);
        return { ok: false, error: error.message };
    }
}

// Definicion de herramientas
const tools = [
    {
        type: "function",
        function: {
            name: "search_products",
            description: "Busca productos de tenis/sneakers activos en el inventario. Usa esta función cuando el usuario busque productos específicos o pida recomendaciones.",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "Término de búsqueda para nombre, marca o descripción"
                    },
                    categoria: {
                        type: "string",
                        description: "Categoría específica (running, basketball, casual, etc.)"
                    },
                    precioMin: {
                        type: "number",
                        description: "Precio mínimo en MXN"
                    },
                    precioMax: {
                        type: "number",
                        description: "Precio máximo en MXN"
                    }
                },
                required: []
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_categories",
            description: "Obtiene todas las categorías disponibles de productos activos.",
            parameters: {
                type: "object",
                properties: {},
                required: []
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_brands",
            description: "Obtiene todas las marcas disponibles de productos activos.",
            parameters: {
                type: "object",
                properties: {},
                required: []
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_product_details",
            description: "Obtiene detalles completos de un producto específico incluyendo todas sus imágenes.",
            parameters: {
                type: "object",
                properties: {
                    productId: {
                        type: "number",
                        description: "ID del producto"
                    }
                },
                required: ["productId"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_discounted_products",
            description: "Obtiene productos que tienen descuento activo. Usa esto cuando el usuario pregunte por ofertas, promociones o descuentos.",
            parameters: {
                type: "object",
                properties: {},
                required: []
            }
        }
    }
];

// Controlador Principal
const generateAIResponse = async (req, res) => {
    try {
        const { messages } = req.body;

       const systemPrompt = {
            role: "system",
            content: `Eres Kicksy, el asistente virtual de Kicks, una tienda mexicana especializada EXCLUSIVAMENTE en la venta de tenis/sneakers. 

            TU PERSONALIDAD:
            - Amigable, entusiasta y conocedor de sneakers
            - Ayudas a los clientes a encontrar los tenis perfectos
            - Respondes en español mexicano de forma natural
            - Eres honesto sobre disponibilidad y precios

            RESTRICCIÓN IMPORTANTE - SOLO TENIS:
            - SOLO respondes preguntas relacionadas con tenis, sneakers, calzado deportivo
            - Temas permitidos: productos, marcas, precios, categorías, recomendaciones de tenis, dudas sobre compra
            - Si te preguntan sobre CUALQUIER otra cosa (ropa, accesorios, otros productos, temas generales, etc.):
            * Rechaza amablemente
            * Explica que solo ayudas con tenis
            * Redirige a buscar tenis
            
            EJEMPLOS DE RECHAZO:
            - Usuario: "¿Qué tiempo hace hoy?" 
            Kicksy: "Lo siento, solo puedo ayudarte con tenis y sneakers. ¿Buscas algún modelo en particular?"
            
            - Usuario: "¿Venden playeras?"
            Kicksy: "En Kicks nos especializamos únicamente en tenis. ¿Te gustaría ver nuestros sneakers disponibles?"
            
            - Usuario: "¿Cómo hago un pastel?"
            Kicksy: "No puedo ayudarte con eso, pero sí puedo ayudarte a encontrar los tenis perfectos. ¿Qué estilo buscas?"

            FORMATO DE PRECIOS:
            - SIEMPRE muestra el precio_final si el producto tiene descuento
            - Formato: "Precio: $X,XXX MXN" o "Precio original: $X,XXX, ahora: $X,XXX MXN"
            - Menciona el descuento cuando aplique: "¡Tiene X% de descuento!"

            INFORMACIÓN DE STOCK:
            - Si stock > 5: "Disponible"
            - Si stock 1-5: "Pocas unidades disponibles"
            - Si stock = 0: "Agotado (ofrecer alternativas)"

            REGLAS CRÍTICAS:
            - SIEMPRE usa las funciones para datos reales
            - NUNCA inventes información sobre productos o precios
            - Sé específico: nombre, marca, precio y características
            - Ofrece alternativas si no hay exactamente lo que buscan
            - RECHAZA amablemente cualquier pregunta fuera del tema de tenis`
        };

        let completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [systemPrompt, ...messages],
            tools: tools,
            tool_choice: "auto"
        });

        let assistantMessage = completion.choices[0].message;
        
        while (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
            messages.push(assistantMessage);
            
            for (const toolCall of assistantMessage.tool_calls) {
                const functionName = toolCall.function.name;
                const functionArgs = JSON.parse(toolCall.function.arguments);
                
                console.log(`[Kicksy] Ejecutando: ${functionName}`, functionArgs);
                
                const functionResult = await executeFunction(functionName, functionArgs);
                
                console.log(`[Kicksy] Resultado:`, functionResult);
                
                messages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(functionResult)
                });
            }
            
            completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [systemPrompt, ...messages],
                tools: tools,
                tool_choice: "auto"
            });
            
            assistantMessage = completion.choices[0].message;
        }

        res.json({ response: assistantMessage });
        
    } catch (error) {
        console.error("Error generating AI response:", error);
        res.status(500).json({ error: "Error generating AI response" });
    }
};

module.exports = { generateAIResponse };
