const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },

    last_name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        index: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    age: {
        type: Number,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'usuario'],
        default: 'usuario'
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'carts'
    },
});

userSchema.pre('findOne', function (next) {
    this.populate('cart');
    next();
  });

const UserModel = mongoose.model("user", userSchema);

module.exports = UserModel;