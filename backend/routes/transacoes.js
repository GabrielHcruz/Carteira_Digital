const express = require('express');
const router = express.Router();
const pool = require('../config/database');


router.post('/', async (req, res) => {
  try {
    const { usuario_id, tipo, descricao, valor, moeda } = req.body;

    if (!usuario_id || !tipo || !valor) {
      return res.status(400).json({ erro: 'usuario_id, tipo e valor são obrigatórios' });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO transacoes (usuario_id, tipo, descricao, valor, moeda, data) VALUES (?, ?, ?, ?, ?, NOW())',
      [usuario_id, tipo, descricao || null, valor, moeda || 'BRL']
    );
    connection.release();

    res.status(201).json({
      id: result.insertId,
      usuario_id,
      tipo,
      descricao,
      valor,
      moeda,
      mensagem: 'Transação criada com sucesso'
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});


router.get('/usuario/:usuario_id', async (req, res) => {
  try {
    const { usuario_id } = req.params;
    const connection = await pool.getConnection();
    const [transacoes] = await connection.execute(
      'SELECT * FROM transacoes WHERE usuario_id = ? ORDER BY data DESC',
      [usuario_id]
    );
    connection.release();

    res.json(transacoes);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [transacoes] = await connection.execute(
      'SELECT * FROM transacoes ORDER BY data DESC'
    );
    connection.release();

    res.json(transacoes);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'DELETE FROM transacoes WHERE id = ?',
      [id]
    );
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Transação não encontrada' });
    }

    res.json({ mensagem: 'Transação deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

module.exports = router;
