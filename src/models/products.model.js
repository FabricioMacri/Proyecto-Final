const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const productsSchema = new mongoose.Schema({

    title: {
        type: String, 
        required: true
    },
    description: {
        type: String, 
        required: true
    },
    price: {
        type: Number, 
        required: true
    },
    code: {
        type: String, 
        required: true,
        unique: true
    },
    stock: {
        type: Number, 
        required: true
    },
    category: {
        type: String, 
        required: true
    },
    status: {
        type: Boolean, 
        required: true
    },
    thumbnails: {
        type: String
    },
});

productsSchema.plugin(mongoosePaginate);

const ProductsModel = mongoose.model("products", productsSchema);

module.exports = ProductsModel;