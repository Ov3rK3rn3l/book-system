const express = require('express');
const router = express.Router();
const Salon = require('../models/salon');
const Servico = require('../models/servico');
const turf = require('@turf/turf');

router.post('/', async (req, res) => {
    try {        
        const salon = await new Salon(req.body).save();
        res.json({ salon });
    } catch (error) {
        res.json({ error: true, message: error.message });
    }
});

router.get('/servicos/:salaoId', async (req, res) => {
    try {
        const { salaoId } = req.params;
        const servicos = await Servico.find({
            salaoId,
            status: 'A'
        }).select('_id titulo');

        res.json({
            servicos: servicos.map(s => ({ label: s.titulo, value: s._id }))
        });

    } catch (error) {
        res.json({ error: true, message: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const salon = await Salon.findById(req.params.id).select(
            'capa nome endereco.cidade geo.coordinates telefone'
        );

        const distance = turf.distance(
            turf.point(salon.geo.coordinates),
            turf.point([-3.7925434, -38.6058702])  // Correção: Coordenadas dentro de um array
        );

        res.json({ error: false, salon, distance });
    } catch (error) {
        res.json({ error: true, message: error.message });
    }
});

module.exports = router;
