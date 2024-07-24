const express = require("express");
const router = express.Router(); 

const ProductsModel = require('../models/products.model.js');
const ProductManager = require("../controllers/productManager_db.js");
const CartManager = require("../controllers/cartManager_db.js");

const productManager = new ProductManager();
const cartManager = new CartManager();

router.get('/chat', (req, res) => {
   res.render('chat');
})

router.get("/products", async (req, res) => {

   const query = req.query.query;
   const sort = req.query.sort;
   const page = req.query.page || 1; 
   let limit = 9;

   try {
       
      const data = await ProductsModel.paginate({}, {limit, page});

      let products = data.docs.map(el => {
         const {...rest} = el.toObject();
         return rest;
      });
      if(query) {
         products = products.filter((el) => el.category == query);
      }
      if(sort == 'ASC') {
         query.sort([['category', 'asc']]);
      }
      if(sort == 'DESC') {
         query.sort([['category', 'desc']]);
      }
      res.render("home", {
         products,
         status:"success",
         payload: data.totalDocs,
         hasPrevPage: data.hasPrevPage,
         hasNextPage: data.hasNextPage,
         prevPage: data.prevPage,
         nextPage: data.nextPage,
         currentPage: data.page,
         totalPages: data.totalPages,
         cart: await req.session.user.cart
      });
       
   } catch (error) {
      console.log("Error: " + error)
      res.status(500).send("Todo marcha, volve a intentar");
   }
})

router.get("/carts/:cid", async (req, res) => {
   const cartId = req.params.cid;

   try {
      const carrito = await cartManager.getCarritoById(cartId);

      if (!carrito) {
         console.log("No existe ese carrito con el id");
         return res.status(404).json({ error: "Carrito no encontrado" });
      }

      const productosEnCarrito = carrito.products.map(item => ({
         product: item.product.toObject(),
         //Lo convertimos a objeto para pasar las restricciones de Exp Handlebars. 
         quantity: item.quantity
      }));

      let total = 0;
      carrito.products.forEach((producto) => {

         total += producto.product.price * producto.quantity;
      });

      res.render("carts", { productos: productosEnCarrito, total : total, cart:cartId });
   } catch (error) {
      console.error("Error al obtener el carrito", error);
      res.status(500).json({ error: "Error interno del servidor"
       });
   }
});

router.get("/login", (req, res) => {
   if (req.session.login) {
       return res.redirect("/views/products");
   }

   res.render("login");
});

router.get("/register", (req, res) => {
   res.render("register");
})

router.get("/profile", (req, res) => {
   if (!req.session.login) {
       return res.redirect("views/login");
   }

   res.render("profile", { user: req.session.user });
});



module.exports = router; 