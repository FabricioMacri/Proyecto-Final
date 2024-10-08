const express = require("express");
const router = express.Router();

const sgMail = require('@sendgrid/mail');

const CartManager = require("../controllers/cartManager_db.js");
const cartManager = new CartManager();
const CartModel = require("../models/cart.model.js");

const TicketManager = require("../controllers/ticket.controller.js");
const ticketManager = new TicketManager();


router.get("/", async (req, res) => {
    try {
        if(!req.session.user.cart) {
            const carrito = await cartManager.linkedCart(req.session.user.email);
            if (!carrito) {
                const nuevoCarrito = await cartManager.crearCarrito();
                const cartID = await cartManager.asignarCarrito(nuevoCarrito._id, req.session.user.email);
                req.session.user.cart = await cartID.toString();
            } else {
                req.session.user.cart = carrito;
            }
        }
        res.redirect("/products");
    } catch (error) {
        console.error("Error al crear un nuevo carrito", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});


router.get("/:cid", async (req, res) => {
    const cartId = req.params.cid;

    try {
        const carrito = await CartModel.findById(cartId);

        let result = {
            products: []
        };
            
        if (!carrito) {
            const nuevoCarrito = await cartManager.crearCarrito();
            const cartID = await cartManager.asignarCarrito(nuevoCarrito._id, req.session.user.email);
            req.session.user.cart = await cartID.toString();
            let result = nuevoCarrito.toObject();
        }
        else {
            let result = carrito.toObject();
        }

        return res.json(result.products);
    } catch (error) {
        console.error("Error al obtener el carrito", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});


router.post("/:cid/purchase", async (req, res) => {
    const cartId = req.params.cid;

    try {

        const code = req.session.user.first_name[0] + "-" + cartId + "-" + req.session.user.last_name[0];
        
        const ticket = await ticketManager.addTicket( code, req.session.user.email, cartId);

        if (ticket) {
            const cart = await cartManager.deleteCarrito(req.session.user.email, cartId);
            console.log("Ticket aprobado!");
            sgMail.setApiKey(process.env.TWILIO_KEY);
            const msg = {
            to: req.session.user.email,
            from: 'TICKET@emacrisolutions.com.ar',
            subject: 'Nueva compra',
            text: 'Felicitaciones por tu compra! Tu codigo de compra es: ' + code
            }
            sgMail
            .send(msg)
            .then(() => {
                console.log('Email sent');
            })
            .catch((error) => {
                console.log(error);
            })
            res.redirect("/purchase");
        } else {
            console.log("Hubo problemas con el ticket ");
            res.status(400).json({mensaje : "Hubo problemas con el ticket"});
        }

    } catch (error) {
        console.error("Error al procesar la compra", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

router.post("/addProduct", async (req, res) => {

    const cartId = req.body.cart;
    const productId = req.body.product;
    const quantity = req.body.quantity || 1;

    try {
        console.log("cartId: " + cartId + " - productId: " + productId +" - quantity: " + quantity);
        const actualizarCarrito = await cartManager.agregarProductoAlCarrito(cartId, productId, quantity);
        res.redirect("/products");
    } catch (error) {
        console.error("Error al agregar producto al carrito", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});


router.delete('/:cid/product/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;

        const updatedCart = await cartManager.eliminarProductoDelCarrito(cartId, productId);

        res.json({
            status: 'success',
            message: 'Producto eliminado del carrito correctamente',
            updatedCart,
        });
    } catch (error) {
        console.error('Error al eliminar el producto del carrito', error);
        res.status(500).json({
            status: 'error',
            error: 'Error interno del servidor',
        });
    }
});


router.put('/:cid', async (req, res) => {
    const cartId = req.params.cid;
    const updatedProducts = req.body;
    // Debes enviar un arreglo de productos en el cuerpo de la solicitud

    try {
        const updatedCart = await cartManager.actualizarCarrito(cartId, updatedProducts);
        res.json(updatedCart);
    } catch (error) {
        console.error('Error al actualizar el carrito', error);
        res.status(500).json({
            status: 'error',
            error: 'Error interno del servidor',
        });
    }
});



router.put('/:cid/product/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const newQuantity = req.body.quantity;

        const updatedCart = await cartManager.actualizarCantidadDeProducto(cartId, productId, newQuantity);

        res.json({
            status: 'success',
            message: 'Cantidad del producto actualizada correctamente',
            updatedCart,
        });
    } catch (error) {
        console.error('Error al actualizar la cantidad del producto en el carrito', error);
        res.status(500).json({
            status: 'error',
            error: 'Error interno del servidor',
        });
    }
});


router.delete('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        
        const updatedCart = await cartManager.vaciarCarrito(cartId);

        res.json({
            status: 'success',
            message: 'Todos los productos del carrito fueron eliminados correctamente',
            updatedCart,
        });
    } catch (error) {
        console.error('Error al vaciar el carrito', error);
        res.status(500).json({
            status: 'error',
            error: 'Error interno del servidor',
        });
    }
});

module.exports = router;