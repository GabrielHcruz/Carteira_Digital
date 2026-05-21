const express = require('express');
const router = express.Router();
const pool = require('../config/database');


router.post('/', async (req, res) => {
  try {
    const { nome, email } = req.body;

    if (!nome || !email) {
      return res.status(400).json({ erro: 'Nome e email são obrigatórios' });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO usuarios (nome, email, criado_em) VALUES (?, ?, NOW())',
      [nome, email]
    );
    connection.release();

    res.status(201).json({
      id: result.insertId,
      nome,
      email,
      mensagem: 'Usuário criado com sucesso'
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [usuarios] = await connection.execute('SELECT * FROM usuarios');
    connection.release();

    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [usuarios] = await connection.execute(
      'SELECT * FROM usuarios WHERE id = ?',
      [id]
    );
    connection.release();

    if (usuarios.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    res.json(usuarios[0]);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email } = req.body;

    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'UPDATE usuarios SET nome = ?, email = ? WHERE id = ?',
      [nome, email, id]
    );
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    res.json({ mensagem: 'Usuário atualizado com sucesso', id });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'DELETE FROM usuarios WHERE id = ?',
      [id]
    );
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    res.json({ mensagem: 'Usuário deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

module.exports = router;
