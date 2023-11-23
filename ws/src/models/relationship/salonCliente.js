const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const salonCliente = new Schema({
    salaoId: {
        type: mongoose.Types.ObjectId,
        ref: 'Salon',
        required: true
    },
    clienteId: {
        type: mongoose.Types.ObjectId,
        ref: 'Cliente',
        required: true
    },
    status: {
        type: String,
        enum:[ 'A', 'I'],
        required: true,
        default: 'A'
    },

    dataCadastro: {
        type: Date,
        default: Date.now,
    }

});

module.exports = mongoose.model('SalonCliente', salonCliente)