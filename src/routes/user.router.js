const express = require("express");
const jwt = require('jsonwebtoken');
const passport = require('passport');
const router = express.Router();

const UserModel = require("../models/user.model.js");
const { createHash } = require("../utils/hashbcrypt.js");

const ErrorHandler = require('../utils/error/errorHandler.js');
const errorHandler = new ErrorHandler();


//Register
router.post("/register", async (req, res) => {
    const { first_name, last_name, email, password, age } = req.body;

    try {
        // Verificar si el correo electrónico ya está registrado
        const existingUser = await UserModel.findOne({ email: email });
        if (existingUser) {
            return res.status(400).send({ error: "El correo electrónico ya está registrado" });
        }

        // Definir el rol del usuario 
        const role = email === 'admincoder@coder.com' ? 'admin' : 'usuario';

        // Crear un nuevo usuario
        const newUser = await UserModel.create({ first_name, last_name, email, password: createHash(password), age, role });

        // Almacenar información del usuario en la sesión (puedes ajustarlo según tus necesidades)
        req.session.login = true;
        req.session.user = { ...newUser._doc };

        //res.status(200).send({ message: "Usuario creado con éxito" });
        res.redirect("/allproducts");

    } catch (error) {
        console.error("Error al crear el usuario:", error);
        res.status(500).send({ error: "Error interno del servidor" });
    }

})

//User
router.get("/:uid", async (req, res) => {
    
    try {

        const userID = await req.params.uid;

        errorHandler.numeric(userID);

        if (errorHandler.code !== 0) {

            return res.status(400).json({ERROR:errorHandler});
        } else {

            return res.status(200).json({mensaje:"El ID enviado es valido"});
        }
        
       
        
    } catch (error) {
        res.status(500).send("Error interno del servidor: " + error);
    }
    
})

//Login: 

router.post("/login", async (req, res) => {
    const {usuario, password} = req.body; 

    try {
        //1) Verificamos que el usuario ingresdo existe en nuestra Base de Datos: 
        const usuarioEncontrado = await UserModel.findOne({usuario:usuario});
        

        if ( !usuarioEncontrado ) {
            return res.status(401).send("Usuario no encontrado");
        }

        //2) Verificamos la contraseña: 

        if (password !== usuarioEncontrado.password) {
            return res.status(401).send("Contraseña incorrecta, vete hacker!"); 
        }

        //Generamos el token: 
        const token = jwt.sign({usuario: usuarioEncontrado.usuario, rol: usuarioEncontrado.rol}, "coderhouse", {expiresIn: "1h"});

        //Establecer el token como Cookie: 
        res.cookie("coderCookieToken", token, {
            maxAge: 3600000, //1 hora de vida
            httpOnly: true //La cookie solo se puede acceder mediante HTTP
        }); 

        res.redirect("/home"); 
    } catch (error) {
        res.status(500).send("Error interno del servidor");
    }
})

//Home: 

router.get("/home", passport.authenticate("jwt", {session: false}), (req, res) => {
    res.render("home", {usuario: req.user.usuario});
})

//Logout: 

router.post("/logout", (req, res) => {
    //Voy a limpiar la cookie del Token
    res.clearCookie("coderCookieToken"); 
    //Redirigir a la pagina del Login. 
    res.redirect("/login");
})

//Ruta Admin: 

router.get("/admin", passport.authenticate("jwt", {session: false}), (req, res) => {
    console.log(req.user);
    if ( req.user.rol !== "admin") {
        return res.status(403).send("Acceso Denegado");
    }
    //Si el usuario es admin, mostrar el panel correspondiente: 
    res.render("admin");
})



module.exports = router;