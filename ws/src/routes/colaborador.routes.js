const express = require("express");
const router = express.Router();
const Colaborador = require("../models/colaborador");
const mongoose = require("mongoose");
const SalonColaborator = require("../models/relationship/salonColaborator");

router.post("/", async (req, res) => {
    try {
        const { colaborador, salaoId } = req.body;
        let newColaborador = null;

        // Verificar se o colaborador existe
        const existentColaborador = await Colaborador.findOne({
            $or: [{ email: colaborador.email }, { telefone: colaborador.telefone }],
        });

        // Se não existe, cadastra
        if (!existentColaborador) {
            newColaborador = await Colaborador({
                ...colaborador,
            }).save();
        }

        // Relacionamento
        const colaboradorId = existentColaborador ? existentColaborador._id : newColaborador._id;

        // Verifica se já existe o relacionamento com o salão
        const existentRelationship = await SalonColaborator.findOne({
            salaoId,
            colaboradorId,
            status: { $ne: "E" },
        });

        // Se não existe
        if (!existentRelationship) {
            await new SalonColaborator({
                salaoId,
                colaboradorId,
                status: colaborador.vinculo,
            }).save();
        }

        // Se existe o vínculo entre o colaborador e o salão
        if (existentColaborador) {
            await SalonColaborator.findOneAndUpdate(
                {
                    salaoId,
                    colaboradorId,
                },
                { status: colaborador.vinculo }
            );
        }

        res.json({ error: false });

    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

router.put('/:colaboradorId', async (req, res) => {
    try {
        
        const { vinculo, vinculoId, especialidades } = req.body;
        const { colaboradorId } = req.params;
        //vinculo
        await SalonColaborator.findByIdAndUpdate(vinculoId, { status: vinculo });

        //especialidades
        await colaboradorServico.deleteMany({
            colaboradorId,
        });

        await colaboradorServico.insertMany(
            especialidades.map(
                (servicoId) => ({
                    servicoId,
                    colaboradorId,
                }))
        );

        res.json({ error: false })

    } catch (err) {
        res.json({ error: true, message: err.message })
    }
});

router.delete('/vinculo/:id', async (req, res) => {
    try {
        await SalonColaborator.findByIdAndUpdate(req.params.id, { status: 'E' });
        res.json({ error: false });
    } catch (err) {
        res.json({ error:true, message: err.message });
    }
});

router.post('/filter',async (req, res) => {
    try {
        
        const colaboradores = await Colaborador.find(req.body.filters);
        res.json({ error: false, colaboradores });

    } catch (err) {
        res.json({ error:true, message: err.message });
    }
});

router.get('/salon/:salaoId', async (req, res) => {
    try {
        
        const { salaoId } = req.params;
        let listaColaboradores = [];

        //recuperar vinculos
        const salaoColaboradores = await salonColaborator.find({
            salaoId,
            status: { $ne: 'E'},
        })
        .populate({ path: 'colaboradorId',select: '-senha -recipientId'})
        .select('colaboradorId dataCadastro status');

        for (let vinculo of salaoColaboradores) {
            const especialidades = await ColaboradorServico.find({
                colaboradorId: vinculo.colaboradorI._id
            });

            listaColaboradores.push({
                ...vinculo._doc,
                especialidades,
            });
        }

        res.json({ error: false, 
            colaboradores: listaColaboradores.map((vinculo) => ({
                ...vinculo.colaboradorId._doc,
                vinculoId: vinculo._id,
                vinculo: vinculo.status,
                especialidades: vinculo.especialidades,
                dataCadastro: vinculo.dataCadastro,

        }))
    });


    } catch (err) {
        res.json({ error:true, message: err.message });
    }
});

// Restante do código permanece o mesmo...

module.exports = router;
