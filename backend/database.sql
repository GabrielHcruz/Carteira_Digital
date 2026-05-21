-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS carteira_digital;
USE carteira_digital;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

-- Tabela de transações (receitas e despesas)
CREATE TABLE IF NOT EXISTS transacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  tipo ENUM('receita', 'despesa') NOT NULL,
  descricao VARCHAR(255),
  valor DECIMAL(15, 2) NOT NULL,
  moeda VARCHAR(10) DEFAULT 'BRL',
  data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_usuario (usuario_id),
  INDEX idx_data (data)
);

-- Tabela de carteira de criptomoedas
CREATE TABLE IF NOT EXISTS carteira_criptos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  symbol VARCHAR(20) NOT NULL,
  quantidade DECIMAL(20, 8) NOT NULL,
  preco_compra DECIMAL(15, 2),
  adicionada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_usuario (usuario_id),
  INDEX idx_symbol (symbol),
  UNIQUE KEY unique_user_crypto (usuario_id, symbol)
);

-- Inserir usuário de exemplo
INSERT INTO usuarios (nome, email) VALUES ('Usuário Teste', 'teste@example.com');

-- Inserir transações de exemplo
INSERT INTO transacoes (usuario_id, tipo, descricao, valor, moeda) VALUES 
  (1, 'receita', 'Salário', 3000.00, 'BRL'),
  (1, 'despesa', 'Alimentação', 500.00, 'BRL');

-- Inserir criptomoeda de exemplo
INSERT INTO carteira_criptos (usuario_id, symbol, quantidade, preco_compra) VALUES
  (1, 'BTC', 0.5, 45000.00),
  (1, 'ETH', 2.5, 3000.00);
