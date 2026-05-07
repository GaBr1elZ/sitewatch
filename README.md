<div align="center">
  <img src="https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express" />
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</div>

<h1 align="center">🚀 SiteWatch</h1>

<p align="center">
  <strong>Plataforma SaaS Fullstack para Monitoramento de Uptime e Performance.</strong>
</p>

---

## 🎯 Sobre o Projeto

O **SiteWatch** é uma aplicação completa de monitoramento (estilo SaaS) desenvolvida para garantir que serviços web estejam sempre disponíveis. O sistema realiza verificações de integridade automáticas e contínuas (pings) em URLs cadastradas e alerta os usuários imediatamente em caso de quedas ou instabilidades.

Este projeto foi construído para ser o **pilar do meu portfólio**, demonstrando minha capacidade de arquitetar, desenvolver e estruturar uma aplicação fullstack moderna do zero, lidando com tarefas assíncronas (cron jobs), segurança, comunicação via API e desenvolvimento de interfaces responsivas e focadas em dados.

## 🏗️ Arquitetura e Tecnologias

A aplicação segue uma arquitetura baseada em **Microsserviços/Monorepo**, dividida de forma clara entre Frontend e Backend, permitindo escalabilidade e manutenção independentes. 

Toda a base de código foi escrita utilizando **TypeScript**, garantindo segurança de tipos de ponta a ponta.

### 🎨 Frontend (Client-Side)

A interface do usuário foi projetada para ser limpa, intuitiva e apresentar dados complexos de forma simples.

- **Next.js 15 (App Router):** Escolhido pelo poder da renderização híbrida (SSR/SSG), rotas aninhadas simplificadas e otimização pesada de performance out-of-the-box.
- **React 19:** Utilização massiva de Server Components e Hooks modernos para lidar com estado global e requisições no client.
- **Tailwind CSS v4:** Para estilização rápida, responsiva e altamente customizável diretamente no JSX, sem a necessidade de arquivos CSS separados (CSS-in-JS).
- **Recharts:** Biblioteca poderosa utilizada para criar gráficos dinâmicos de uptime, histórico de respostas e métricas de latência no dashboard.
- **Axios:** Gerenciador de requisições HTTP configurado com interceptors para o envio transparente de tokens JWT (Authorization) para o backend.

### ⚙️ Backend (Server-Side & Cron Jobs)

A infraestrutura foi desenhada para rodar verificações ininterruptas sem travar a thread principal do Node.

- **Node.js + Express:** Estrutura rápida e minimalista para a criação de rotas RESTful focadas na gestão dos usuários, cadastro de sites e autenticação.
- **Prisma ORM:** Abstração de banco de dados robusta e tipada. Utilizada por facilitar o relacionamento de tabelas (ex: Usuário -> Sites -> Incidentes).
- **PostgreSQL:** Banco de dados relacional escolhido por sua alta confiabilidade, ideal para guardar grandes volumes de dados temporais de ping/uptime.
- **node-cron:** Responsável pela engrenagem principal do projeto. Agenda e executa tarefas assíncronas de checagem em intervalos customizáveis (ex: a cada 1, 5 ou 15 minutos).
- **Segurança (bcrypt + JWT):** Todo o fluxo de autenticação é blindado utilizando hashes fortes para senhas e tokens com expiração definida para persistência de sessão.

### 🌐 Integrações & Notificações

- **Resend API:** Integrado para o disparo rápido e confiável de e-mails transacionais (ex: e-mail alertando que um site caiu).
- **Webhooks (Discord / Slack):** Módulo construído para suportar endpoints externos, enviando um JSON com o payload formatado diretamente para os canais de comunicação dos times.

## 💡 Desafios Resolvidos

1. **Agendamento Dinâmico:** Implementar um sistema onde o backend consegue gerenciar múltiplos sites rodando rotinas (crons) independentes baseadas na configuração individual escolhida pelo usuário.
2. **Monitoramento em Massa:** Estruturação assíncrona das checagens HTTP para evitar gargalos caso centenas de sites entrem na fila de monitoramento no mesmo minuto.
3. **Gestão de Incidentes:** Criação de uma lógica inteligente para abrir um "Incidente" (Site Caiu) e fechá-lo automaticamente quando o site voltar a responder com status `200 OK`.

---
<p align="center">
  👨‍💻 Desenvolvido com dedicação por <strong>Gabriel</strong>. <br>
  Acesse meu <a href="https://github.com/GaBr1elZ">GitHub</a> para mais projetos!
</p>