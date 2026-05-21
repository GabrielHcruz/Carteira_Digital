# Integração Backend e Frontend

Este documento descreve como usar o backend (Node.js + MySQL) em conjunto com o frontend (SPA estática).

## Arquitetura de integração

O projeto oferece duas opções de funcionamento:

### Opção 1: Frontend isolado (padrão)
- Frontend usa `localStorage` para armazenar dados
- Não requer backend
- Ideal para desenvolvimento local e uso offline

### Opção 2: Frontend + Backend integrado
- Frontend comunica com API REST do backend
- Backend armazena dados em MySQL
- Permite sincronização entre dispositivos

## Setup do Backend

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Configurar banco de dados

Execute o script SQL:
```bash
mysql -u root -p < database.sql
```

### 3. Configurar variáveis de ambiente

Copie `.env.example` para `.env`:
```bash
cp .env.example .env
```

Edite `.env` com suas credenciais:
```ini
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=carteira_digital
PORT=3000
NODE_ENV=development
```

### 4. Iniciar o servidor

```bash
npm start
```

O backend estará disponível em `http://localhost:3000`.

## Integração com Frontend

Para usar o backend com o frontend, você precisa integrar as chamadas de API no arquivo `jsapp.js/js/app.js`.

### Exemplo: Sincronizar receita mensal

**Atualmente (localStorage)**:
```javascript
monthlyIncome = amount;
saveToLocalStorage();
```

**Com backend**:
```javascript
async function saveMonthlyIncome(amount) {
  const usuarioId = localStorage.getItem('usuarioId') || 1;
  const response = await fetch(`http://localhost:3000/api/transacoes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      usuario_id: usuarioId,
      tipo: 'receita',
      descricao: 'Salário/Renda Mensal',
      valor: amount,
      moeda: 'BRL'
    })
  });
  return await response.json();
}
```

### Exemplo: Carregar carteira de cripto

**Atualmente (localStorage)**:
```javascript
const holdings = JSON.parse(localStorage.getItem('holdings')) || [];
```

**Com backend**:
```javascript
async function loadCryptoPortfolio() {
  const usuarioId = localStorage.getItem('usuarioId') || 1;
  const response = await fetch(`http://localhost:3000/api/carteira/usuario/${usuarioId}`);
  return await response.json();
}
```

## Endpoints disponíveis

### Usuários
- `GET /api/usuarios` - Listar todos
- `POST /api/usuarios` - Criar novo
- `GET /api/usuarios/:id` - Obter por ID
- `PUT /api/usuarios/:id` - Atualizar
- `DELETE /api/usuarios/:id` - Deletar

### Transações
- `GET /api/transacoes` - Listar todas
- `POST /api/transacoes` - Criar nova
- `GET /api/transacoes/usuario/:usuario_id` - Transações do usuário
- `DELETE /api/transacoes/:id` - Deletar

### Carteira de Cripto
- `GET /api/carteira` - Listar todas as carteiras
- `POST /api/carteira` - Adicionar cripto
- `GET /api/carteira/usuario/:usuario_id` - Carteira do usuário
- `PUT /api/carteira/:id` - Atualizar
- `DELETE /api/carteira/:id` - Remover

## CORS

O backend está configurado para aceitar requisições do frontend. Certifique-se de que:

1. O frontend está em `http://localhost:3000` (ou configurar CORS em `server.js`)
2. A variável `API_URL` no frontend aponta para `http://localhost:3000/api`

## Fluxo de autenticação

1. Ao iniciar, o frontend verifica `localStorage.getItem('usuarioId')`
2. Se não existir, cria um novo usuário via `POST /api/usuarios`
3. Armazena o ID do usuário em `localStorage` para requisições futuras
4. Todas as transações incluem o `usuario_id` para rastreabilidade

## Migração de dados

Para migrar dados do localStorage para MySQL:

1. Abra o console do navegador (F12)
2. Execute:
```javascript
const data = JSON.parse(localStorage.getItem('carteiraDigitalData'));
console.log(JSON.stringify(data, null, 2));
```
3. Use esses dados para popular o backend via API

## Troubleshooting

### "Cannot GET /api/health"
- Backend não está rodando
- Verifique: `npm start` em `backend/`

### "ECONNREFUSED 127.0.0.1:3000"
- MySQL não está rodando ou conectando
- Verifique credenciais em `.env`

### CORS error
- Certifique-se de que CORS está ativado em `server.js`
- Frontend e backend podem estar em portas diferentes

## Desenvolvimento simultâneo

Para desenvolver frontend e backend simultaneamente:

**Terminal 1** - Backend:
```bash
cd backend
npm run dev
```

**Terminal 2** - Frontend (Live Server no VS Code):
```
Abra index.html com Live Server
```

Ambos rodarão em portas diferentes e se comunicarão via API.
