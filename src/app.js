// Desafío 6

// comando para dependencias:
// npm i nodemon express mongoose express-handlebars socket.io passport passport-jwt mongoose-paginate-v2 bcrypt dotenv commander cors cookie-parser express-session sweetalert2 swagger-jsdoc swagger-ui-express

// Imports:
const express = require('express');
const mongoose = require('mongoose');
const exphbs = require("express-handlebars");
const socket = require("socket.io");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require("express-session");

//Import modules: 
const productsRouter = require('./routes/products.router.js');
const viewsRouter = require("./routes/views.router.js");
const sessionRouter = require("./routes/session.router.js");
const userRouter = require("./routes/user.router.js");
const cartsRouter = require("./routes/carts.router.js");
const initializePassport = require("./config/passport.config.js");

// Server, puerto y conexion a la BD
const app = express();
const PUERTO = 8080;
require("./database.js");

// Middlewares:
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static("./src/public"));
app.use(cors());
app.use(cookieParser());
app.use(passport.initialize());
app.use(session({
    secret:"secretCoder",
    resave: true, 
    saveUninitialized:true,   
}))
initializePassport();

// Handlebars
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");


// Routes
app.get("/", (req, res) => {
    if (req.session.login) {
        return res.redirect("/views/home");
    }
 
    res.render("home");
 });

app.use('/api', productsRouter);
app.use("/views", viewsRouter);
app.use("/api/users", userRouter);
app.use("/api/sessions", sessionRouter);
app.use("/api/carts", cartsRouter);

// Listen
const httpServer = app.listen(PUERTO, () => {

    console.log('Escuchando puerto: ' + PUERTO);
})

// Chat

const MessageModel = require("./models/message.model.js");
const CartModel = require("./models/cart.model.js");
const io = new socket.Server(httpServer);

io.on("connection",  (socket) => {
    console.log("Nuevo usuario conectado");

    socket.on("message", async data => {

        //Guardo el mensaje en MongoDB: 
        await MessageModel.create(data);

        //Obtengo los mensajes de MongoDB y se los paso al cliente: 
        const messages = await MessageModel.find();
        io.sockets.emit("message", messages);
     
    })
    socket.on('newCart', async data => {
        const newID = await CartModel.create(data);
        io.sockets.emit("cartID", newID);
    })
    socket.on('updateCart', async data => {
        console.log(data.id);
        await CartModel.findByIdAndUpdate(data.id, data);
    })
})
