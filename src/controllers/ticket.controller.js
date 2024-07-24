const TicketModel = require("../models/ticket.model.js");

const ProductManager = require("../controllers/productManager_db.js");
const productManager = new ProductManager();

const CartModel = require("../models/cart.model.js");


class TicketManager {

    async addTicket( code, purchaser, cartId) {
        try {

            if (!code || !cartId || !purchaser) {
                console.log("Todos los campos son obligatorios");
                return;
            }

            const existeTicket = await TicketModel.findOne({ code: code });

            if (existeTicket) {
                console.log("El codigo esta siendo utilizado por otro ticket");
                return;
            }

            const Total = await this.chekProducts(cartId);

            if (!Total) {

                console.log("Hubo problemas con los productos");
                return;
            }

            console.log(Total);

            const newTicket = new TicketModel({
                code,
                amount: Total,
                purchaser
            });

            await newTicket.save();

            return newTicket;

        } catch (error) {
            console.log("Error al agregar ticket", error);
            throw error;
        }
    }

    async getTicketById(id) {
        try {
            const ticket = await TicketModel.findById(id);

            if (!ticket) {
                console.log("Ticket no encontrado");
                return null;
            }

            return ticket;
        } catch (error) {
            console.log("No se pudo encontrar el ticket por ID");
        }
    }


    async deleteTicket(id) {
        try {

            const deleteado = await TicketModel.findByIdAndDelete(id);

            if (!deleteado) {
                console.log("No se pudo encontrar el ticket");
                return null;
            }

        } catch (error) {
            console.log("Error al eliminar el ticket", error);
            throw error;
        }
    }

    async chekProducts(cartId) {

        try {
            const carrito = await CartModel.findById(cartId)
                
            if (!carrito) {
                consol.log("La compra no se aprobo porque no se encuentra el carrito");
                return false;
            } else {
                let total = 0;
                carrito.products.forEach((producto) => {
    
                    const flag = productManager.getProductById(producto.product._id);
                    if (flag) {
    
                        const chekStock = producto.product.stock - producto.quantity;
    
                        if (chekStock < 0) {
    
                            consol.log("La compra no se aprobo por falta de stock");
                            return false;
                        } else {
                            total += producto.product.price * producto.quantity;
                        }
                    } else {
                        consol.log("La compra no se aprobo porque uno de los productos no fue encontrado");
                        return false;
                    }
                });
                return total;
    
            }
        } catch (error) {
            console.error("Error al obtener el carrito", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }
}

module.exports = TicketManager; 