const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const usuariosRoutes = require('./routes/usuarios');
const transacoesRoutes = require('./routes/transacoes');
const carteiraRoutes = require('./routes/carteira');


app.use('/api/usuarios', usuariosRoutes);
app.use('/api/transacoes', transacoesRoutes);
app.use('/api/carteira', carteiraRoutes);


app.get('/api/health', (req, res) => {
  res.json({ status: 'Server rodando' });
});


app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📊 Acesse: http://localhost:${PORT}/api/health para testar`);
});
