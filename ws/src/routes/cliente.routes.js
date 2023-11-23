const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const Cliente = require('../models/cliente');
const SalaoCliente = require('../models/relationship/salonCliente');

router.post("/", async (req, res) => {
    const db = mongoose.connection;
    const session = await db.startSession();
    session.startTransaction();

    try {
        const { cliente, salaoId } = req.body;
        let newCliente = null;

        // Verificar se o cliente já existe
        const existentCliente = await Cliente.findOne({
            $or: [{ email: cliente.email }, { telefone: cliente.telefone }],
        });

        // Se não existe, cadastrar
        if (!existentCliente) {
            const _id = mongoose.Types.ObjectId();

            // Criar cliente no banco de dados
            newCliente = await Cliente({
                ...cliente,
                _id,
            }).save({ session });
        }

        // Relacionamento com o salão
        const clienteId = existentCliente
            ? existentCliente._id
            : newCliente._id;

        // Verificar se já existe o relacionamento com o salão
        const existentRelationship = await SalaoCliente.findOne({
            salaoId,
            clienteId,
            status: { $ne: "E" },
        });

        // Se não existe, criar relacionamento
        if (!existentRelationship) {
            await new SalaoCliente({
                salaoId,
                clienteId,
            }).save({ session });
        }

        // Se existe o vínculo entre o cliente e o salão, atualizar status
        if (existentCliente) {
            await SalaoCliente.findOneAndUpdate(
                {
                    salaoId,
                    clienteId,
                },
                { status: 'A' },
                { session }
            );
        }

        await session.commitTransaction();
        session.endSession();

        if (existentCliente || existentRelationship) {
            res.json({ error: true, message: 'Cliente já cadastrado!' });
        } else {
            res.json({ error: false });
        }

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.json({ error: true, message: err.message });
    }
});

router.post('/filter',async (req, res) => {
    try {
        
        const clientes = await Cliente.find(req.body.filters);
        res.json({ error: false, clientes });

    } catch (err) {
        res.json({ error:true, message: err.message });
    }
});

router.get('/salon/:salaoId', async (req, res) => {
    try {
        
        const { salaoId } = req.params;

        //recuperar vinculos
        const clientes = await SalaoCliente.find({
            salaoId,
            status: { $ne: 'E'},
        })
        .populate('clienteId')
        .select('clienteId dataCadastro')

        res.json({ error: false, 
            clientes: clientes.map((vinculo) => ({
                ...vinculo.clienteId._doc,
                vinculoId: vinculo._id,
                dataCadastro: vinculo.dataCadastro,
        }))
    });

    } catch (err) {
        res.json({ error:true, message: err.message });
    }
});

router.delete('/vinculo/:id', async (req, res) => {
    try {
        await SalaoCliente.findByIdAndUpdate(req.params.id, { status: 'E' });
        res.json({ error: false });
    } catch (err) {
        res.json({ error:true, message: err.message });
    }
});

module.exports = router;
