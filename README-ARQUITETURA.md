# Arquitetura e Banco de Dados

Este documento descreve a arquitetura da aplicação e o modelo de dados usado pelo backend.

## Visão geral da arquitetura

A aplicação é composta por duas camadas principais:

- **Frontend**: aplicação web estática em `index.html` com `cssstyle.css/css/style.css` e `jsapp.js/js/app.js`.
- **Backend**: API Node.js com Express e MySQL em `backend/`.

O frontend funciona de forma independente usando `localStorage`, mas o backend oferece estrutura de API para persistência em banco de dados.

## Componentes principais

### Frontend

- `index.html/index.html` - interface de usuário principal
- `cssstyle.css/css/style.css` - estilos e temas
- `jsapp.js/js/app.js` - lógica de interação, cálculo e persistência local

### Backend

- `backend/server.js` - servidor Express
- `backend/config/database.js` - conexão MySQL via `mysql2`
- `backend/routes/usuarios.js` - CRUD de usuários
- `backend/routes/transacoes.js` - endpoints de transações
- `backend/routes/carteira.js` - endpoints de carteira de cripto
- `backend/database.sql` - script de criação do banco e dados de exemplo

## Modelo de dados MySQL

### `usuarios`

- `id` INT AUTO_INCREMENT PRIMARY KEY
- `nome` VARCHAR(100) NOT NULL
- `email` VARCHAR(100) UNIQUE NOT NULL
- `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### `transacoes`

- `id` INT AUTO_INCREMENT PRIMARY KEY
- `usuario_id` INT NOT NULL
- `tipo` ENUM('receita', 'despesa') NOT NULL
- `descricao` VARCHAR(255)
- `valor` DECIMAL(15, 2) NOT NULL
- `moeda` VARCHAR(10) DEFAULT 'BRL'
- `data` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `FOREIGN KEY (usuario_id)` referencia `usuarios(id)`

### `carteira_criptos`

- `id` INT AUTO_INCREMENT PRIMARY KEY
- `usuario_id` INT NOT NULL
- `symbol` VARCHAR(20) NOT NULL
- `quantidade` DECIMAL(20, 8) NOT NULL
- `preco_compra` DECIMAL(15, 2)
- `adicionada_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `FOREIGN KEY (usuario_id)` referencia `usuarios(id)`
- índice único `unique_user_crypto` em `(usuario_id, symbol)`

## A integração entre frontend e backend

- O frontend atual salva dados no navegador.
- O backend pode ser usado para armazenar dados em MySQL e fornecer APIs REST.
- Exemplo de rota principal:
  - `GET /api/usuarios`
  - `POST /api/transacoes`
  - `GET /api/carteira/usuario/:usuario_id`

## Banco de dados

O arquivo `backend/database.sql` cria o banco `carteira_digital` e as tabelas necessárias. Ele também insere dados de exemplo:

- usuário de teste
- transações de receita e despesa
- duas entradas de criptomoedas

## Configuração do banco

A conexão ao MySQL está em `backend/config/database.js` e usa variáveis de ambiente definidas em `.env`.

## Observações de arquitetura

- O backend utiliza uma arquitetura simples de API REST.
- Cada recurso tem sua própria rota e arquivo de controle.
- O frontend mantém a lógica de apresentação separada da camada de dados.
