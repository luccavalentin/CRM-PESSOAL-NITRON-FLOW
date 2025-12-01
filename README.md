# NITRON FLOW - Sistema de Gestão Integrado

Sistema de gestão integrado que combina gestão empresarial e gestão pessoal em uma única plataforma, desenvolvido com Next.js, TypeScript e Tailwind CSS.

## 🚀 Como executar

1. Instale as dependências:

```bash
npm install
```

2. Execute o servidor de desenvolvimento:

```bash
npm run dev
```

3. Abra [http://localhost:8080](http://localhost:8080) no navegador.

## 🛠️ Tecnologias

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Zustand (Gerenciamento de Estado)
- Framer Motion (Animações)
- Lucide React (Ícones)
- Recharts (Gráficos)

## 📦 Scripts

- `npm run dev` - Inicia o servidor de desenvolvimento na porta 8080
- `npm run build` - Cria build de produção
- `npm start` - Inicia servidor de produção na porta 8080
- `npm run lint` - Executa o linter

## 🎨 Design System

O projeto utiliza um design system completo com:

- Paleta de cores futurista (preto profundo, azul elétrico, ciano neon)
- Tipografia Inter
- Sistema de espaçamento consistente
- Componentes reutilizáveis
- Animações suaves e microinterações
- Tema NITRON FLOW

## ✨ Recursos

- **Gestão Empresarial**
  - Dashboard consolidado
  - Gestão financeira empresarial
  - Gestão de projetos
  - Tarefas empresariais
  - Controle de usuários
  - Ideias e brainstorm
  - Suporte ao cliente
  - Gestão de risco

- **Gestão Pessoal**
  - Vida saudável (alimentação, treinos, sono)
  - Gestão financeira pessoal
  - Produtividade e projetos pessoais
  - Desenvolvimento pessoal
  - Espiritualidade
  - Trading com gestão de risco

## 📝 Estrutura do Projeto

```
├── app/                    # Páginas Next.js
│   ├── dashboard/         # Dashboard principal
│   ├── empresa/           # Módulo empresarial
│   └── pessoal/           # Módulo pessoal
├── components/            # Componentes React
│   ├── layout/           # Componentes de layout
│   └── ui/               # Componentes de interface
├── stores/                # Stores Zustand
├── types/                 # Tipos TypeScript
└── public/                # Arquivos estáticos
```

## 🔐 Persistência de Dados

Os dados são armazenados localmente no navegador usando localStorage através do Zustand persist middleware. Não há backend - o sistema funciona completamente no frontend.

## 📱 Responsividade

O sistema possui menu lateral para desktop e menu mobile para dispositivos menores, com layout adaptável para diferentes tamanhos de tela.

## 🎯 Funcionalidades Principais

### Dashboard
- Visão consolidada de todos os módulos
- Saldos financeiros (pessoal e empresarial)
- Status de projetos
- Tarefas do dia
- Ideias recentes
- Usuários ativos

### Gestão Financeira
- Fluxo de caixa
- Entradas e saídas
- Metas financeiras
- Reserva de emergência
- Aplicações e investimentos

### Projetos
- Acompanhamento de progresso
- Etapas do projeto
- Tarefas vinculadas
- Timeline e status

### Tarefas
- Sistema de prioridades
- Categorização
- Tarefas rápidas (2 minutos)
- Tarefas recorrentes
- Vínculo com projetos

### Trading
- Dashboard de gestão de risco
- Sistema de bloqueio automático
- Configurações personalizadas
- Estatísticas e análises

## 📝 Licença

Todos os direitos reservados - NITRON FLOW © 2025



