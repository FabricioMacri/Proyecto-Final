
class errorHandler {

    constructor() {

        this.code = 0;
        this.type = "No hay error";
        this.message = "El handler no encontro ningun error";

    }

    nullChek(input) {

        if (input === NaN) { 

            this.code = 1; 
            this.type = "NaN error";
            this.mensage = "La variable ingresada es de tipo NaN.";

            return false;
        }
        if (input === undefined) { 

            this.code = 1; 
            this.type = "Undefined error";
            this.mensage = "La variable ingresada es de tipo undefined.";

            return false;
        }
        if (input === null) {

            this.code = 1; 
            this.type = "Null error";
            this.mensage = "La variable ingresada es de tipo null.";

            return false;
        }

        return true;
    }

    numeric(input) {

        if (this.nullChek(input)) {

            const integer = Number.parseInt(input);
            if (integer !== NaN){

                if (input > 0) {
                    this.code = 0;
                    return;
                }
            }
        }

        this.code = 2;
        this.type = "Numeric error";
        this.message = `El valor ingresado: ${input}, debe ser un entero positivo.`;

        return;
    }
}

module.exports = errorHandler; 