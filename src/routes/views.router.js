const express = require("express");
const router = express.Router(); 

const ProductsModel = require('../models/products.model.js');
const ProductManager = require("../controllers/productManager_db.js");
const CartManager = require("../controllers/cartManager_db.js");

const productManager = new ProductManager();
const cartManager = new CartManager();

router.get('/', async (req, res) => {

   res.render('home');
})

router.get('/purchase', async (req, res) => {

   res.render('purchase');
})

router.get('/chat', (req, res) => {
   res.render('chat');
})

router.get("/products", async (req, res) => {

   if(!req.session.login) return res.status(401).redirect('/login');

   const query = req.query.query;
   const sort = req.query.sort;
   const page = req.query.page || 1; 
   let limit = 6;

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
      const pages = [];
      for(let i=0;i<data.totalPages;i++){pages.push({number:i+1})}

      const pageInfo = {
         products,
         status:"success",
         payload: data.totalDocs,
         hasPrevPage: data.hasPrevPage,
         hasNextPage: data.hasNextPage,
         prevPage: data.prevPage,
         nextPage: data.nextPage,
         currentPage: data.page,
         totalPages: data.totalPages,
         pages:pages
      }
      if(req.session.login) {
         pageInfo.cart = await req.session.user.cart;
      }

      res.render("shop", pageInfo);
       
   } catch (error) {
      console.log("Error: " + error)
      res.status(500).send("Todo marcha, volve a intentar");
   }
})

router.get("/carts/:cid", async (req, res) => {
   const cartId = req.params.cid;

   try {
      if(cartId == 'class="card-img-top"') return res.status(404).json({ error: "ID invalido" });
      let carrito = await cartManager.getCarritoById(cartId);

      if (!carrito) {
         carrito = await cartManager.crearCarrito();
         const cartID = await cartManager.asignarCarrito(carrito._id, req.session.user.email);
         req.session.user.cart = await cartID.toString();
      }

      let total = 0;
      carrito.products.forEach((producto) => {

         total += producto.product.price * producto.quantity;
      });
      
      carrito = carrito.toObject();
      const info = { products:carrito.products, total:total, cart:cartId };
      res.render("carts", info);
   } catch (error) {
      console.error("Error al obtener el carrito", error);
      res.status(500).json({ error: "Error interno del servidor"});
   }
});

router.get("/login", (req, res) => {
   if (req.session.login) {
       return res.redirect("/products");
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