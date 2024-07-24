const CartModel = require("../models/cart.model.js");
const UserModel = require("../models/user.model.js");

class CartManager {
    async crearCarrito() {
        try {
            const nuevoCarrito = new CartModel({ products: [] });
            await nuevoCarrito.save();
            return nuevoCarrito;
        } catch (error) {
            console.log("Error al crear el nuevo carrito");
        }
    }

    async getCarritoById(cartId) {
        try {
            const carrito = await CartModel.findById(cartId);
            if (!carrito) {
                console.log("No existe un carrito con ese ID");
                return null;
            }

            return carrito;
        } catch (error) {
            console.log("Error al traer el carrito", error);
        }
    }

    async agregarProductoAlCarrito(cartId, productId, quantity = 1) {
        try {
            const carrito = await this.getCarritoById(cartId);
            const existeProducto = carrito.products.find(item => item.product._id.toString() == productId);
            console.log(existeProducto);

            if (existeProducto) {
                existeProducto.quantity += quantity;
            } else {
                carrito.products.push({ product: productId, quantity });
            }

            carrito.markModified("products");

            await carrito.save();
            return carrito;

        } catch (error) {
            console.log("error al agregar un producto", error);
        }
    }

    async linkedCart(userEmail) {

        try {
            const usuario = await UserModel.findOne({ email: userEmail });
            if (usuario) {
                if (!usuario.cart) {
                    return null
                } else {
                    return usuario.cart._id.toString();
                }
            } else {
                console.log("No se encuentra al usuario al que quiere asignar el carrito");
                return null;
            }

        } catch (error) {
            console.log("error al asignar el carrito", error);
        }

    }

    async asignarCarrito(cartId, userEmail) {

        try {
            const flag = await this.linkedCart(userEmail);
            const usuario = await UserModel.findOne({ email: userEmail });
            console.log(usuario);

            if (!flag) {

                usuario.cart = cartId;
            } else {
                return null;
            }

            usuario.markModified("cart");

            await usuario.save();
            return cartId;

        } catch (error) {
            console.log("error al asignar el carrito", error);
        }

    }

    async eliminarProductoDelCarrito(cartId, productId) {
        try {
            const cart = await CartModel.findById(cartId);

            if (!cart) {
                throw new Error('Carrito no encontrado');
            }

            cart.products = cart.products.filter(item => item.product._id.toString() !== productId);

            await cart.save();
            return cart;
        } catch (error) {
            console.error('Error al eliminar el producto', error);
            throw error;
        }
    }


    async actualizarCarrito(cartId, updatedProducts) {
        try {
            const cart = await CartModel.findById(cartId);

            if (!cart) {
                throw new Error('Carrito no encontrado');
            }

            cart.products = updatedProducts;

            cart.markModified('products');

            await cart.save();

            return cart;
        } catch (error) {
            console.error('Error al actualizar el carrito', error);
            throw error;
        }
    }

    async actualizarCantidadDeProducto(cartId, productId, newQuantity) {
        try {
            const cart = await CartModel.findById(cartId);

            if (!cart) {
                throw new Error('Carrito no encontrado');
            }

            const productIndex = cart.products.findIndex(item => item.product._id.toString() === productId);

            if (productIndex !== -1) {
                cart.products[productIndex].quantity = newQuantity;


                cart.markModified('products');

                await cart.save();
                return cart;
            } else {
                throw new Error('Producto no encontrado en el carrito');
            }
        } catch (error) {
            console.error('Error al actualizar la cantidad del producto en el carrito', error);
            throw error;
        }
    }

    async vaciarCarrito(cartId) {
        try {
            const cart = await CartModel.findByIdAndUpdate(
                cartId,
                { products: [] },
                { new: true }
            );

            if (!cart) {
                throw new Error('Carrito no encontrado');
            }

            return cart;
        } catch (error) {
            console.error('Error al vaciar el carrito', error);
            throw error;
        }
    }

}

module.exports = CartManager; 