<div align="center">
  <img src="https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express" />
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
</div>

<h1 align="center">🚀 SiteWatch</h1>

<p align="center">
  <strong>Uma plataforma completa de monitoramento de uptime e performance de sites.</strong>
</p>

## 📋 Sobre o Projeto

O **SiteWatch** é uma solução robusta (SaaS) construída para monitorar a disponibilidade de aplicações web em tempo real. Ele permite que os usuários cadastrem seus sites, definam intervalos de checagem e visualizem métricas detalhadas através de um dashboard interativo. O sistema também suporta alertas automatizados via webhook (Discord/Slack) e e-mail (Resend) quando um incidente é detectado.

Este projeto foi desenvolvido com foco em performance, escalabilidade e uma interface de usuário impecável, servindo como uma excelente demonstração de arquitetura fullstack moderna.

## ✨ Funcionalidades Principais

- 🔐 **Autenticação Segura:** Sistema de login e registro utilizando JWT e criptografia bcrypt.
- 📊 **Dashboard Analítico:** Visualização de dados e histórico de uptime utilizando gráficos dinâmicos (Recharts).
- ⚙️ **Gestão de Sites:** CRUD completo para gerenciar os sites que serão monitorados, com personalização de intervalos de ping.
- 🚨 **Sistema de Alertas:** Notificações em tempo real sobre quedas de serviço integradas com Webhooks (Slack/Discord) e E-mails (via Resend).
- 🕒 **Monitoramento Automatizado:** Cron jobs precisos rodando no backend para verificar a integridade de todas as URLs cadastradas de forma ininterrupta.

## 🛠️ Tecnologias Utilizadas

**Frontend:**
- [Next.js 15+](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Recharts](https://recharts.org/) para visualização de dados
- [Axios](https://axios-http.com/) para comunicação HTTP

**Backend:**
- [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- [Prisma ORM](https://www.prisma.io/) com PostgreSQL
- [TypeScript](https://www.typescriptlang.org/) para tipagem estática
- [node-cron](https://github.com/node-cron/node-cron) para agendamento de tarefas
- [Resend](https://resend.com/) para envio de e-mails transacionais
- [JSON Web Tokens (JWT)](https://jwt.io/) para segurança

## 🚀 Como Executar o Projeto Localmente

Para rodar este projeto na sua máquina, você precisará do [Node.js](https://nodejs.org/) e de um banco de dados **PostgreSQL** rodando.

### 1. Clonando o repositório

```bash
git clone https://github.com/SEU_USUARIO/sitewatch.git
cd sitewatch
```

### 2. Configurando o Backend

Navegue até a pasta do backend e instale as dependências:

```bash
cd backend
npm install
```

Crie um arquivo `.env` na pasta `backend/` seguindo o modelo `.env.example`:
*(Não se preocupe, as chaves reais não são versionadas por segurança).*

```env
DATABASE_URL="postgresql://user:password@localhost:5432/sitewatch"
DIRECT_URL="postgresql://user:password@localhost:5432/sitewatch"
JWT_SECRET="sua_chave_secreta_super_segura"
RESEND_API_KEY="sua_chave_do_resend"
PORT=3001
```

Execute as migrations do banco de dados e inicie o servidor:

```bash
npx prisma migrate dev
npm run dev
```

### 3. Configurando o Frontend

Em um novo terminal, vá para a pasta do frontend e instale as dependências:

```bash
cd frontend
npm install
```

Crie um arquivo `.env.local` na pasta `frontend/`:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

### 4. Acessando a Aplicação

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

## 📂 Estrutura do Projeto

O projeto é configurado como um monorepo simples, separando claramente as responsabilidades:

- `/frontend` - Contém toda a aplicação Next.js, componentes visuais e páginas.
- `/backend` - Contém a API Express, rotas, lógica de agendamento (cron) e acesso ao banco (Prisma).

## 💡 Próximos Passos (Roadmap)

- [ ] Implementar páginas de status públicas (Status Pages) para os usuários compartilharem com seus clientes.
- [ ] Adicionar suporte a times/organizações.
- [ ] Internacionalização (i18n) para múltiplos idiomas.

---

<p align="center">
  Desenvolvido por <strong>Você</strong>. <br>
  <em>Sinta-se livre para entrar em contato ou contribuir!</em>
</p>