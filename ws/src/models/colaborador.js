const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const colaboradorSchema = new Schema({
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
        required: true
    },
    dataNascimento: {
        type: String, //Ano-MM-DD
        required: true
    },
    sexo: {
        type: String,
        enum: ['M', 'F'],
        required: true
    },
    status: {
        type: String,
        enum: ['A', 'I'],
        required: true,
        default: 'A'
    },
    dataCadastro: {
        type: Date,
        default: Date.now,
    }
});

const Colaborador = mongoose.model('Colaborador', colaboradorSchema);

module.exports = Colaborador;
