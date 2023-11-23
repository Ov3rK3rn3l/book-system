const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const moment =require('moment');
//const pagarme = require('../services/pagarme');
const Cliente = require('../models/cliente');
const Salao = require('../models/salon');
const Servico = require('../models/servico');
const Colaborador = require('../models/colaborador');
const Agendamento = require('../models/agendamento');
const _ = require('lodash');
const util = require('../util');
//const keys = require('../data/keys.json');
const Horario = require('../models/horario');


router.post('/', async (req, res) => {
    const db = mongoose.connection;
    const session = await db.startSession();
    session.startTransaction();
    try {
        const { clienteId, salaoId, servicoId, colaboradorId } = req.body;

        // RECUPERAR CLIENTE
        const cliente = await Cliente.findById(clienteId).select('nome endereco customerId');

        // RECUPERAR SALAO
       // const salao = await Salao.findById(salaoId).select('recipientId');

        // RECUPERAR SERVICO
        const servico = await Servico.findById(servicoId).select('preco titulo comissao');

        // RECUPERAR COLABORADOR
        const colaborador = await Colaborador.findById(colaboradorId).select('recipientId');

        // CRIA O AGENDAMENTO
        const agendamento = await new Agendamento({
            ...req.body,
            comissao: servico.comissao,
            valor: servico.preco,
        }).save({ session });

        await session.commitTransaction();
        session.endSession();

        res.json({ error: false, agendamento });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.json({ error: true, message: err.message });
    }
});

router.post('/filter', async (req, res) => {
    try {
        const { periodo, salaoId } = req.body;

        const agendamentos = await Agendamento.find({
            salaoId,
            data: {
                $gte: moment(periodo.inicio).startOf('day'),
                $lte: moment(periodo.final).endOf('day'),
            },
        })
            .populate([
                { path: 'servicoId', select: 'titulo duracao' },
                { path: 'colaboradorId', select: 'nome' },
                { path: 'clienteId', select: 'nome' },
            ]);

        res.json({ error: false, agendamentos });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

router.post('/filter', async (req, res) => {
    try {

        const { periodo, salaoId } = req.body;

        const agendamentos = await Agendamento.find({
            salaoId,
            data: {
                $gte: moment(periodo.inicio).startOf('day'),
                $lte: moment(periodo.final).endOfDay('day'),
            },
        })
            .populate([
            { path: 'servicoId', select: 'titulo duracao' },
            { path: 'colaboradorId', select: 'nome' },
            { path: 'clienteId', select: 'nome' },
        ]);

        res.json({ error: false, agendamentos })


    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

router.post('/dias-disponiveis', async (req, res) => {
    try {
        const { data, salaoId, servicoId } = req.body;
        const horarios = await Horario.find({ salaoId });
        const servico = await Servico.findById(servicoId).select('duracao');

        let agenda = [];
        let colaboradores = [];
        let lastDay = moment(data);

        // DURAÇÃO DO SERVIÇO
        const servicoMinutos = util.hourToMinutes(moment(servico.duracao).format('HH:mm'));

        const servicoSlots = util.sliceMinutes(
            servico.duracao, // 1:30
            moment(servico.duracao).add(servicoMinutos, 'minutes'), // 3:00
            util.SLOT_DURATION

        ).length;

            // PROCURANDO NOS PROXIMOS 365 DIAS ATÉ A AGENDA CONTER 7 DIAS DISPONIVEIS.

        for (let i = 0; i < 365 && agenda.length <  7; i++) {
            const espaçosValidos = horarios.filter(horario => {
                // VERIFICAR O DIA DA SEMANA
                const diaSemanaDisponivel = horario.dias.includes(moment(lastDay).day()); // que vai de 0 (domingo) até 6 (sabado)

                // VERIFICAR ESPECIALIDADE DISPONIVEL
                const servicoDisponivel = horario.especialidade.includes(servicoId);

                return diaSemanaDisponivel && servicoDisponivel;

            });


            // TODOS OS HORÁRIOS COLABORADORES DISPONIVEIS NO DIA E SEUS HORARIOS


            if (espaçosValidos.length > 0) {

                let todosHorariosDia = {  };

                for (let spaco of espaçosValidos) {
                    for (let colaboradorId of  spaco.colaboradores) {
                        if (!todosHorariosDia[colaboradorId]) {
                            todosHorariosDia[colaboradorId] =  []
                        }

                        // PEGAR TODOS OS HORARIOS DO ESPAÇO E JOGAR PARA DENTRO DO COLABORADOR

                        todosHorariosDia[colaboradorId] = [
                            ...todosHorariosDia[colaboradorId],
                            ... util.sliceMinutes(
                                util.mergeDateTime(lastDay, spaco.inicio),
                                util.mergeDateTime(lastDay, spaco.fim),
                                util.SLOT_DURATION
                            )
                        ];

                    }
                }

                // VERIFICAR OCUPAÇÃO DOS COLABORADORES NO DIA

                for (let colaboradorId of Object.keys(todosHorariosDia)) {
                    // RECUPERAR AGENDAMENTOS
                    const agendamentos = await Agendamento.find({
                        colaboradorId,
                        data: {
                            $gte: moment(lastDay).startOf('day'),
                            $lte: moment(lastDay).endOf('day')
                        },
                    })
                        .select('data servicoId -_id')
                        .populate('servicoId', 'duracao');

                    // RECUPERAR HORARIOS AGENDADOS
                    let horariosOcupados = agendamentos.map(agendamento => ({
                        inicio: moment(agendamento.data),
                        final: moment(agendamento.data).add(util.hourToMinutes
                        (moment(agendamento.servicoId.duracao).format('HH:mm')
                        ), 'minutes' ),
                    }));
                    // RECUPERANDO TODOS OS SLOTS ENTRE OS AGENDAMENTOS
                    horariosOcupados = horariosOcupados.map(horario => util.sliceMinutes(horario.inicio, horario.final, util.SLOT_DURATION)
                    )
                    .flat();

                    // REMOVENDO TODOS OS HORÁRIOS/SLOTS OCUPADOS
                    let horariosLivres = util.splitByValue(todosHorariosDia[colaboradorId].map(horarioLivre => {
                        return horariosOcupados.includes(horarioLivre) ? '-' : horarioLivre ;
                    }), '-'
                    ).filter((space) => space.length > 0);

                    // VERIFICANDO SE EXISTE ESPAÇO SUFICIENTE NO SLOT
                    horariosLivres = horariosLivres.filter((horarios) => horarios.length > servicoSlots);

                    // verificando se os horarios DO SLOT TEM A QUANTIDADE NECESSARIA

                    horariosLivres = horariosLivres.map((slot) => slot.filter((horario, index) => slot.length - index > servicoSlots
                    )).flat();
                    // FORMATANDO OS HORÁRIOS DE 2 EM 2
                    horariosLivres =  _.chunk(horariosLivres, 2);

                    // remover colaborador caso NAO TENHA NENHUMA ESPAÇO

                    if (horariosLivres.length == 0) {
                        todosHorariosDia = _.omit(todosHorariosDia, colaboradorId);
                    } else {
                        todosHorariosDia[colaboradorId] = horariosLivres;
                    }
                }

                // VERIFICAR SE TEM ESPECIALISTA DISPONIVEL NAQUELE DIA...
                const totalEspecialistas = Object.keys(todosHorariosDia).length;

                if (totalEspecialistas > 0 ) {
                    colaboradores.push(Object.keys(todosHorariosDia));
                    agenda.push({
                        [lastDay.format('YYYY-MM-DD')] : todosHorariosDia,
                    });
                }
            }

            lastDay = lastDay.add(1, 'day');

        }
        // RECUPERANDO DADOS DOS COLABORADORES
        colaboradores = _.uniq(colaboradores.flat())

        colaboradores = await Colaborador.find({
            _id: { $in: colaboradores },
        }).select('nome foto');

        colaboradores = colaboradores.map(c => ({
            ...c._doc,
            nome: c.nome.split(' ')[0],
        }));

        res.json({ error: false, colaboradores, agenda, });


    } catch (err) {
        res.json({error: true, message: err.message })
    }
})

module.exports = router;
