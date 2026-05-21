# Carteira Digital

Aplicação web para gerenciar finanças pessoais e carteira de criptomoedas.

## Funcionalidades

- Dashboard financeiro com 6 cards: Renda, Despesa, Saldo, Carteira, Investido e Resultado
- Cadastro de renda mensal
- Controle de despesas por categoria
- Adição de criptomoedas com quantidade e preço de compra
- Cálculo de saldo disponível e patrimônio em criptomoedas
- Gráficos de distribuição e comparativo
- Interface responsiva para desktop, tablet e celular
- Persistência local via localStorage
- Backend opcional com Node.js, Express e MySQL

## Como executar

### Frontend (principal)
1. Abra `index.html/index.html` no navegador.
2. Ou use um servidor local como Live Server.
3. A aplicação carregará automaticamente e salvará os dados no navegador.

### Backend opcional
1. Abra o terminal em `backend`
2. Execute:
   ```bash
   npm install
   ```
3. Crie o arquivo `.env` a partir de `.env.example` e configure:
   ```ini
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=suasenha
   DB_NAME=carteira_digital
   PORT=3000
   ```
4. Execute o servidor:
   ```bash
   npm start
   ```
5. O backend ficará disponível em `http://localhost:3000`

## Estrutura do projeto

```
Carteira-Digital/
├── index.html/index.html
├── cssstyle.css/css/style.css
├── jsapp.js/js/app.js
├── backend/
│   ├── server.js
│   ├── routes/
│   ├── config/database.js
│   └── database.sql
├── README.md
└── README-ARQUITETURA.md
```

## Documentação

- [README-INTEGRACAO.md](README-INTEGRACAO.md) - Guia completo de integração backend + frontend
- [README-ARQUITETURA.md](README-ARQUITETURA.md) - Arquitetura da aplicação e modelo de banco de dados
- [ANALISE-SEGURANCA.md](ANALISE-SEGURANCA.md) - Análise de segurança, redundâncias e checklist

## Observações

- O frontend funciona de forma independente usando `localStorage`.
- O backend serve como API opcional para persistência em MySQL.
- Os dados do frontend são carregados diretamente do navegador.

## Recursos principais

- Cadastro e visualização de receitas e despesas
- Registro de transações de criptomoedas
- Relatórios de mapa de calor financeiro
- Responsividade para telas pequenas e grandes
- Interface escura moderna com Tailwind CSS e Lucide Icons
 

## Link do Site do Projeto

Link: https://carteira-digital-phi.vercel.app/
