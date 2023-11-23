const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cliente = new Schema({
    nome: {
        type: String,
        required: true
    },
    telefone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    senha: {
        type: String,
        default: null,
    },
    foto: {
        type: String,
    },
    dataNascimento: {
        type: String, //Ano-MM-DD
        required: true
    },
    sexo: {
        type: String,
        enum:[ 'M', 'F'],
        required: true
    },
    status: {
        type: String,
        enum:[ 'A', 'I'],
        required: true,
        default: 'A'
    },
    documento: {
        tipo: {
            type: String,
            enum: ['cpf', 'cnpj'],
            required: true,
        },
        numero: {
            type: String,
            required: true
        }
    },
    endereco: {
        cidade: String,
        uf: String,
        cep: String,
        numero: String,
        logradouro: String,
        pais: String,
    },
    customerId: {
        type: String,
        default: null,
    },
    dataCadastro: {
        type: Date,
        default: Date.now,
    }

});


module.exports = mongoose.model('Cliente',cliente)