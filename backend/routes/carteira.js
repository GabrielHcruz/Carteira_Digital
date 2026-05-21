const express = require('express');
const router = express.Router();
const pool = require('../config/database');


router.post('/', async (req, res) => {
  try {
    const { usuario_id, symbol, quantidade, preco_compra } = req.body;

    if (!usuario_id || !symbol || !quantidade) {
      return res.status(400).json({ erro: 'usuario_id, symbol e quantidade são obrigatórios' });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO carteira_criptos (usuario_id, symbol, quantidade, preco_compra, adicionada_em) VALUES (?, ?, ?, ?, NOW())',
      [usuario_id, symbol, quantidade, preco_compra || 0]
    );
    connection.release();

    res.status(201).json({
      id: result.insertId,
      usuario_id,
      symbol,
      quantidade,
      preco_compra,
      mensagem: 'Criptomoeda adicionada à carteira'
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});


router.get('/usuario/:usuario_id', async (req, res) => {
  try {
    const { usuario_id } = req.params;
    const connection = await pool.getConnection();
    const [carteira] = await connection.execute(
      'SELECT * FROM carteira_criptos WHERE usuario_id = ? ORDER BY adicionada_em DESC',
      [usuario_id]
    );
    connection.release();

    res.json(carteira);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantidade, preco_compra } = req.body;

    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'UPDATE carteira_criptos SET quantidade = ?, preco_compra = ? WHERE id = ?',
      [quantidade, preco_compra, id]
    );
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Criptomoeda não encontrada' });
    }

    res.json({ mensagem: 'Criptomoeda atualizada com sucesso', id });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'DELETE FROM carteira_criptos WHERE id = ?',
      [id]
    );
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Criptomoeda não encontrada' });
    }

    res.json({ mensagem: 'Criptomoeda removida da carteira' });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

module.exports = router;
