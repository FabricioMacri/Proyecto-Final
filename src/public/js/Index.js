const socket = io();
const user = localStorage.getItem('user');

if(!user) {

    Swal.fire({
        title: "Identificate", 
        input: "text",
        text: "Ingresa un usuario para identificarte en el chat", 
        inputValidator: (value) => {
            return !value && "Necesitas escribir un nombre para continuar"
        }, 
        allowOutsideClick: false,
    }).then( result => {
        localStorage.setItem('user', result.value);
    })
}


const btn = document.getElementsByClassName('addButton');

for (let i = 0; i < btn.length; i++) {
    btn.item(i).addEventListener('click', () => {

        const user = localStorage.getItem('user');
    
        let cart = localStorage.getItem('cart');
    
        cart = JSON.parse(cart);
        if(cart) {
            console.log('viejo: ' + btn.item(i).id)
            cart.products.push(btn.item(i).id);
            socket.emit("updateCart", cart); 
        }
        else {
            cart = {
                user,
                products:[]
            }
            console.log('nuevo: ' + btn.item(i).id)
            cart.products.push(btn.item(i).id);
            socket.emit("newCart", cart);
            socket.on("cartID", async (data) => {
                cart.id = data._id;
                localStorage.setItem('cart', JSON.stringify(cart));
            })
            console.log(cart)
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        Swal.fire({
            position: "top-end",
            icon: "success",
            title: "El producto fue agregado correctamente",
            showConfirmButton: false,
            timer: 1500
          });
    
    })
    }


