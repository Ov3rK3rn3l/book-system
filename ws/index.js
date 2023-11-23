const express = require("express");
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const busboy = require('connect-busboy');
const busboyBodyParser =  require('busboy-body-parser');
require('./database');


// middlewares
app.use(morgan('dev'));
app.use(express.json () );
app.use(busboy () );
app.use(busboyBodyParser () );
app.use(cors () );

//variaveis / variables
app.set('port', 8000);

app.use('/salon', require('./src/routes/salon.routes'));
app.use('/servico', require('./src/routes/servico.routes'));
app.use('/horario', require('./src/routes/horario.routes'));
app.use('/colaborador', require('./src/routes/colaborador.routes'));
app.use('/cliente', require('./src/routes/cliente.routes'));
app.use('/agendamento', require('./src/routes/agendamento.routes'));

app.listen(app.get('port'), () => {
    console.log(`WS Escutando na porta ${app.get('port')}` );
})